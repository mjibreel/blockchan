import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const POLYGONSCAN_URL = process.env.REACT_APP_POLYGONSCAN_URL || 'https://amoy.polygonscan.com';
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA';

// Note: CONTRACT_ADDRESS is set from .env, with fallback to deployed contract address

// Contract ABI (minimal)
const CONTRACT_ABI = [
  "function stampFile(bytes32 fileHash, bool isPublic) external",
  "function fileExists(bytes32 fileHash) external view returns (bool)",
  "function verifyFile(bytes32 fileHash) external view returns (bool exists, address owner, uint256 timestamp, bool isPublic)",
  "event FileStamped(bytes32 indexed fileHash, address indexed owner, uint256 timestamp, bool isPublic)"
];

function Stamp() {
  const { account, connectWallet, isConnected, isCorrectNetwork, provider } = useWallet();
  const [file, setFile] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const generateFileHash = async (file, pin = '') => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // If PIN provided, combine with file hash for double authentication
    if (pin) {
      const combined = fileHashHex + pin;
      const combinedBuffer = new TextEncoder().encode(combined);
      const combinedHashBuffer = await crypto.subtle.digest('SHA-256', combinedBuffer);
      const combinedHashArray = Array.from(new Uint8Array(combinedHashBuffer));
      const combinedHashHex = combinedHashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return '0x' + combinedHashHex;
    }
    
    return '0x' + fileHashHex;
  };

  const handleStamp = async () => {
    if (!isConnected) {
      const connected = await connectWallet();
      if (!connected) return;
    }

    if (!isCorrectNetwork) {
      setError('Please switch to Polygon Amoy network');
      return;
    }

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!pin || pin.length < 4) {
      setError('Please enter a PIN (minimum 4 characters)');
      return;
    }

    if (!CONTRACT_ADDRESS) {
      setError('Contract address not configured. Please deploy the contract first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: Generate file hash with PIN (double authentication)
      const fileHash = await generateFileHash(file, pin);
      const fileHashBytes32 = ethers.getBytes(fileHash);

      // Step 2: Get contract instance with user's wallet
      if (!provider) {
        throw new Error('Wallet not connected');
      }
      const signer = await provider.getSigner();
      
      // Check balance before proceeding (free check)
      const balance = await provider.getBalance(account);
      const balanceInMatic = ethers.formatEther(balance);
      console.log('Account balance:', balanceInMatic, 'MATIC');
      
      if (balanceInMatic === '0.0') {
        throw new Error('Insufficient MATIC balance. Please get test MATIC from the faucet: https://faucet.polygon.technology/');
      }
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Step 3: Pre-check if file already exists (FREE - view function, no gas cost)
      console.log('Checking if file already exists (free check)...');
      console.log('File hash (bytes32):', ethers.hexlify(fileHashBytes32));
      
      try {
        const alreadyExists = await contract.fileExists(fileHashBytes32);
        if (alreadyExists) {
          // Get more details about the existing stamp
          const [, , timestamp] = await contract.verifyFile(fileHashBytes32);
          throw new Error(`This file with this PIN was already stamped on ${new Date(Number(timestamp) * 1000).toLocaleString()}. Try a different file or use a different PIN.`);
        }
        console.log('✅ File not yet stamped, proceeding...');
      } catch (checkError) {
        if (checkError.message && checkError.message.includes('already stamped')) {
          throw checkError;
        }
        console.warn('Warning: Could not check if file exists:', checkError);
        // Continue anyway - the transaction will fail if it's already stamped
      }

      // Step 4: Estimate gas first to catch other errors early (FREE - just estimates, doesn't send)
      console.log('Estimating gas (free check)...');
      try {
        const gasEstimate = await contract.stampFile.estimateGas(fileHashBytes32, isPublic);
        console.log('Gas estimate:', gasEstimate.toString(), 'gas units');
        console.log('Is public:', isPublic);
      } catch (estimateError) {
        console.error('Gas estimation failed:', estimateError);
        if (estimateError.reason && estimateError.reason.includes('File already stamped')) {
          throw new Error('This file with this PIN has already been stamped. Try a different file or use a different PIN.');
        }
        throw new Error(`Transaction would fail: ${estimateError.reason || estimateError.message}`);
      }
      
      // Step 5: Send transaction with explicit gas limit (COSTS GAS)
      console.log('Sending transaction to blockchain...');
      const tx = await contract.stampFile(fileHashBytes32, isPublic, {
        gasLimit: 200000, // Set explicit gas limit to avoid estimation issues
      });
      console.log('Transaction sent:', tx.hash);

      // Step 6: Wait for confirmation
      setLoading(true);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.blockNumber);

      // Step 7: Send metadata to backend to save in database
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ownerAddress', account);
      formData.append('isPublic', isPublic);
      formData.append('txHash', tx.hash);
      formData.append('fileHash', fileHash.slice(2)); // Remove 0x for backend
      formData.append('hasPin', 'true'); // Indicate this hash includes PIN

      const response = await axios.post(`${API_URL}/api/stamp`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult({
        ...response.data,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
      });
    } catch (err) {
      console.error('Error stamping file:', err);
      let errorMessage = 'Failed to stamp file. Please try again.';
      
      if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected. Please try again.';
      } else if (err.code === 'UNKNOWN_ERROR' || err.code === -32603) {
        // Internal JSON-RPC error - could be various issues
        if (err.message && err.message.includes('File already stamped')) {
          errorMessage = 'This file with this PIN has already been stamped. Try a different file or use a different PIN.';
        } else if (err.message && err.message.includes('would fail')) {
          errorMessage = err.message;
      } else {
          errorMessage = 'RPC error: The blockchain node encountered an issue. Please check: 1) You have enough MATIC for gas, 2) You\'re on Polygon Amoy network, 3) Try again in a moment.';
        }
      } else if (err.reason && err.reason.includes('File already stamped')) {
        errorMessage = 'This file with this PIN has already been stamped. Try a different file or use a different PIN.';
      } else if (err.message && err.message.includes('File already stamped')) {
        errorMessage = 'This file with this PIN has already been stamped. Try a different file or use a different PIN.';
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadProof = (format) => {
    if (!result) return;

    if (format === 'json') {
      const dataStr = JSON.stringify(result, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `proof-${result.fileHash.slice(0, 8)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // Simple PDF generation (you can use a library like jsPDF for better formatting)
      const pdfContent = `
QUBIC FILE STAMP - PROOF OF AUTHENTICITY

File Hash: ${result.fileHash}
Owner Address: ${result.ownerAddress}
Timestamp: ${new Date(result.timestamp).toLocaleString()}
Transaction ID: ${result.txHash}
Block Number: ${result.blockNumber}
File Name: ${result.fileName}
File Size: ${(result.fileSize / 1024).toFixed(2)} KB
Public: ${result.isPublic ? 'Yes' : 'No'}

View on PolygonScan:
${POLYGONSCAN_URL}/tx/${result.txHash}

This document proves that the file with the above hash was stamped on the blockchain at the specified timestamp.
      `;

      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `proof-${result.fileHash.slice(0, 8)}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        Stamp Your File
      </h1>

      {!isConnected && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200">
            Please connect your wallet to stamp files.
          </p>
        </div>
      )}

        {!isCorrectNetwork && isConnected && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">
              Please switch to Polygon Amoy network in MetaMask.
            </p>
          </div>
        )}

      <div className="bg-white dark:bg-[#1E2024] rounded-lg shadow-md p-8">
        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select File
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-gray-600 dark:text-gray-400">
                {file ? file.name : 'Click to upload or drag and drop'}
              </span>
              {file && (
                <span className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {(file.size / 1024).toFixed(2)} KB
                </span>
              )}
            </label>
          </div>
        </div>

        {/* PIN Input for Double Authentication */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Security PIN (Double Authentication) 🔐
          </label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter a PIN (minimum 4 characters)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            minLength={4}
          />
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            This PIN will be combined with your file hash for extra security. You'll need it to verify the file.
          </p>
        </div>

        {/* Public/Private Toggle */}
        <div className="mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Make this stamp publicly verifiable
            </span>
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 ml-8">
            {isPublic
              ? 'Anyone can verify this file without a wallet'
              : 'Only you can verify this file (requires wallet connection)'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Stamp Button */}
        <button
          onClick={handleStamp}
          disabled={loading || !file || !isConnected}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Stamping...' : 'Stamp File on Blockchain'}
        </button>

        {/* Success Result */}
        {result && (
          <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4">
              ✅ File Stamped Successfully!
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">File Hash:</span>
                <code className="ml-2 text-gray-600 dark:text-gray-400 font-mono">
                  {result.fileHash}
                </code>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Owner:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{result.ownerAddress}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Timestamp:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {new Date(result.timestamp).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Transaction ID:
                </span>
                <a
                  href={`${POLYGONSCAN_URL}/tx/${result.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {result.txHash.slice(0, 10)}...{result.txHash.slice(-8)}
                </a>
              </div>
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => downloadProof('json')}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Download JSON
                </button>
                <button
                  onClick={() => downloadProof('pdf')}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Download Proof
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Stamp;

