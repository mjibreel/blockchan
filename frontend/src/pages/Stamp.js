import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Debug: Log API URL (remove in production if needed)
console.log('API_URL from environment:', API_URL);

// Note: Contract address and explorer URL are now dynamic based on selected network

// Contract ABI (minimal)
const CONTRACT_ABI = [
  "function stampFile(bytes32 fileHash, bool isPublic) external",
  "function fileExists(bytes32 fileHash) external view returns (bool)",
  "function verifyFile(bytes32 fileHash) external view returns (bool exists, address owner, uint256 timestamp, bool isPublic)",
  "event FileStamped(bytes32 indexed fileHash, address indexed owner, uint256 timestamp, bool isPublic)"
];

function Stamp() {
  const { account, connectWallet, isConnected, isCorrectNetwork, provider, selectedNetwork } = useWallet();
  const CONTRACT_ADDRESS = selectedNetwork?.contractAddress || '';
  const BLOCK_EXPLORER_URL = selectedNetwork?.blockExplorerUrls?.[0] || 'https://amoy.polygonscan.com';
  const [file, setFile] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [backendWarning, setBackendWarning] = useState(null);

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
      setError(`Please switch to ${selectedNetwork?.name || 'the correct'} network`);
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
      setError(`Contract not deployed on ${selectedNetwork?.name || 'selected network'}. Please deploy the contract first or select a different network.`);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setBackendWarning(null);

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
      const balanceInNative = ethers.formatEther(balance);
      const currencySymbol = selectedNetwork?.nativeCurrency?.symbol || 'ETH';
      console.log('Account balance:', balanceInNative, currencySymbol);
      
      if (balanceInNative === '0.0') {
        const currency = selectedNetwork?.nativeCurrency?.symbol || 'ETH';
        const faucetUrl = selectedNetwork?.faucetUrl || 'https://faucet.polygon.technology/';
        throw new Error(`Insufficient ${currency} balance. Please get test tokens from the faucet: ${faucetUrl}`);
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
        // Check for RPC/network errors
        if (estimateError.code === 'TIMEOUT' || estimateError.code === 'NETWORK_ERROR' || 
            estimateError.message?.includes('timeout') || estimateError.message?.includes('network')) {
          throw new Error('RPC node is slow or unresponsive. Please try again in a moment, or switch to a different RPC endpoint in MetaMask settings.');
        }
        throw new Error(`Transaction would fail: ${estimateError.reason || estimateError.message}`);
      }
      
      // Step 5: Send transaction with explicit gas limit (COSTS GAS)
      // Add timeout and retry logic for RPC issues
      console.log('Sending transaction to blockchain...');
      let tx;
      const maxRetries = 2;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          tx = await Promise.race([
            contract.stampFile(fileHashBytes32, isPublic, {
              gasLimit: 200000,
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Transaction timeout - RPC node is slow')), 30000)
            )
          ]);
          break; // Success, exit retry loop
        } catch (txError) {
          if (attempt === maxRetries) {
            // Last attempt failed, throw the error
            if (txError.message?.includes('timeout') || txError.code === 'TIMEOUT') {
              throw new Error('Transaction timed out. The RPC node is slow. Please try again in a moment or check your network connection.');
            }
            throw txError;
          }
          // Wait a bit before retrying
          console.warn(`Transaction attempt ${attempt + 1} failed, retrying...`, txError);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      console.log('Transaction sent:', tx.hash);

      // Step 6: Wait for confirmation
      setLoading(true);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.blockNumber);

      // Step 7: Send metadata to backend to save in database (optional - non-blocking)
      // If backend fails, still show success since blockchain transaction succeeded
      let backendData = null;
      try {
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
          timeout: 5000, // 5 second timeout
        });

        backendData = response.data;
      } catch (backendError) {
        // Backend failed, but blockchain transaction succeeded - that's what matters!
        // Filter out meaningless error messages
        const errorMsg = backendError.message || String(backendError);
        if (errorMsg !== 'eg' && errorMsg.length > 2) {
          console.warn('Backend API call failed (transaction still succeeded on blockchain):', backendError);
        }
        
        // Set warning but continue - blockchain transaction is what matters
        const isConnectionError = backendError.code === 'ECONNREFUSED' || 
                                  backendError.code === 'ERR_NETWORK' ||
                                  errorMsg?.includes('ERR_CONNECTION_REFUSED') || 
                                  errorMsg?.includes('Network Error') ||
                                  errorMsg?.includes('Failed to fetch') ||
                                  (backendError.response?.status === 0);
        
        if (isConnectionError) {
          setBackendWarning('⚠️ Backend server is offline. Your file was successfully stamped on the blockchain, but metadata could not be saved to the database. You can still verify your file using the transaction hash below.');
        } else {
          setBackendWarning('⚠️ Backend API call failed. Your file was successfully stamped on the blockchain, but some features may be limited.');
        }
      }

      // Get block timestamp (more accurate than current time)
      let blockTimestamp = Date.now();
      try {
        const block = await provider.getBlock(receipt.blockNumber);
        if (block && block.timestamp) {
          blockTimestamp = Number(block.timestamp) * 1000;
        }
      } catch (blockError) {
        console.warn('Could not fetch block timestamp, using current time:', blockError);
      }

      // Show success with blockchain data (backend data is optional)
      // Clear any errors before showing success
      setError(null);
      setResult({
        fileHash: fileHash.slice(2), // Remove 0x for display
        ownerAddress: account,
        timestamp: new Date(blockTimestamp).toISOString(),
        isPublic: isPublic,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        fileName: file.name,
        fileSize: file.size,
        ...backendData, // Include backend data if available (overrides above if present)
      });
    } catch (err) {
      console.error('Error stamping file:', err);
      
      // Don't show error if transaction already succeeded - this shouldn't happen, but just in case
      if (result && result.txHash) {
        console.warn('Error occurred after transaction succeeded:', err);
        return; // Don't overwrite success with error
      }
      
      let errorMessage = 'Failed to stamp file. Please try again.';
      
      // Check if this is a network/connection error (backend offline)
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK' ||
          err.message?.includes('ERR_CONNECTION_REFUSED') || 
          err.message?.includes('Network Error') ||
          err.message?.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to backend server. Please ensure the backend is running. If you just deployed to blockchain, check your transaction on the block explorer.';
      } else if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by user. Please try again.';
      } else if (err.code === 'UNKNOWN_ERROR' || err.code === -32603 || err.code === 'TIMEOUT') {
        // Internal JSON-RPC error - could be various issues
        if (err.message && err.message.includes('File already stamped')) {
          errorMessage = 'This file with this PIN has already been stamped. Try a different file or use a different PIN.';
        } else if (err.message && err.message.includes('would fail')) {
          errorMessage = err.message;
        } else if (err.message && (err.message.includes('timeout') || err.message.includes('slow'))) {
          errorMessage = `RPC node timeout: The blockchain node is slow or unresponsive. Try: 1) Wait a moment and try again, 2) Check your internet connection, 3) Switch RPC endpoint in MetaMask (Settings → Networks → Polygon Amoy → Edit).`;
        } else {
          errorMessage = `RPC error: The blockchain node encountered an issue. Please check: 1) You have enough ${selectedNetwork?.nativeCurrency?.symbol || 'ETH'} for gas, 2) You're on ${selectedNetwork?.name || 'the correct'} network, 3) Try again in a moment. If the problem persists, try switching to a different RPC endpoint in MetaMask settings.`;
        }
      } else if (err.reason && err.reason.includes('File already stamped')) {
        errorMessage = 'This file with this PIN has already been stamped. Try a different file or use a different PIN.';
      } else if (err.message && err.message.includes('File already stamped')) {
        errorMessage = 'This file with this PIN has already been stamped. Try a different file or use a different PIN.';
      } else if (err.message && typeof err.message === 'string' && err.message.length > 2 && err.message !== 'eg') {
        // Filter out meaningless error messages
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

                  View on Block Explorer:
${BLOCK_EXPLORER_URL}/tx/${result.txHash}

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
              Please switch to {selectedNetwork ? selectedNetwork.name : 'the correct'} network in MetaMask.
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

        {/* Backend Warning */}
        {backendWarning && (
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">{backendWarning}</p>
          </div>
        )}

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
                  href={`${BLOCK_EXPLORER_URL}/tx/${result.txHash}`}
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

