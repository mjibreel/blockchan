import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
// Default to Polygon Amoy explorer, but can be updated dynamically
const BLOCK_EXPLORER_URL = 'https://amoy.polygonscan.com';

function Verify() {
  const [file, setFile] = useState(null);
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
    
    // If PIN provided, combine with file hash (same as stamping)
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

  const handleVerify = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Generate hash with PIN (if provided)
      const fileHash = await generateFileHash(file, pin);
      
      const formData = new FormData();
      formData.append('file', file);
      if (pin) {
        formData.append('pin', pin);
        formData.append('fileHash', fileHash.slice(2)); // Provide pre-computed hash
      }

      const response = await axios.post(`${API_URL}/api/verify`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (err) {
      console.error('Error verifying file:', err);
      setError(
        err.response?.data?.error || err.message || 'Failed to verify file. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        Verify File Authenticity
      </h1>

      <div className="bg-white dark:bg-[#1E2024] rounded-lg shadow-md p-8">
        {/* PIN Input (if file was stamped with PIN) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Security PIN (if file was stamped with PIN) 🔐
          </label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN if file was stamped with one (optional)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            If the file was stamped with a PIN, enter it here. Leave empty if no PIN was used.
          </p>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select File to Verify
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
              id="file-verify-upload"
            />
            <label
              htmlFor="file-verify-upload"
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading || !file}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Verifying...' : 'Verify File'}
        </button>

        {/* Verification Result */}
        {result && (
          <div className="mt-8">
            {result.exists ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4">
                  ✅ File is Authentic!
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
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {result.ownerAddress}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Stamped On:
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Public:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {result.isPublic ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {result.txId && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Transaction:
                      </span>
                      <a
                        href={`${BLOCK_EXPLORER_URL}/tx/${result.txId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View on Block Explorer
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-4">
                  ❌ File Not Found
                </h3>
                <p className="text-red-700 dark:text-red-300">
                  This file was not stamped on the blockchain. It may have been:
                </p>
                <ul className="list-disc list-inside mt-2 text-red-700 dark:text-red-300 space-y-1">
                  <li>Never stamped</li>
                  <li>Modified after being stamped</li>
                  <li>Created by someone else</li>
                </ul>
                {result.fileHash && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-700 dark:text-gray-300">File Hash:</span>
                    <code className="ml-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                      {result.fileHash}
                    </code>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Verify;

