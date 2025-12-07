import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import axios from 'axios';

// Get API URL and ensure it has https:// protocol
let API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
// Auto-add https:// if missing (common mistake in env vars)
if (API_URL && !API_URL.startsWith('http://') && !API_URL.startsWith('https://')) {
  API_URL = `https://${API_URL}`;
}

// Debug: Log API URL (remove in production if needed)
console.log('API_URL from environment:', API_URL);

function History() {
  const { account, connectWallet, isConnected, selectedNetwork } = useWallet();
  const BLOCK_EXPLORER_URL = selectedNetwork?.blockExplorerUrls?.[0] || 'https://amoy.polygonscan.com';
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = useCallback(async () => {
    if (!account) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/api/history/${account}`, {
        timeout: 30000, // 30 second timeout for history fetch
      });
      
      // Security: Verify that all transactions belong to the connected wallet
      const transactions = response.data.transactions || [];
      const connectedAddress = account.toLowerCase();
      
      // Filter to only show transactions owned by the connected wallet
      const ownTransactions = transactions.filter(tx => 
        tx.owner && tx.owner.toLowerCase() === connectedAddress
      );
      
      // If there's a mismatch, log a warning (shouldn't happen, but extra security)
      if (transactions.length > 0 && ownTransactions.length !== transactions.length) {
        console.warn('Security warning: Some transactions do not belong to connected wallet');
      }
      
      setTransactions(ownTransactions);
      setFilteredTransactions(ownTransactions);
    } catch (err) {
      console.error('Error fetching history:', err);
      
      // Check if it's a connection or CORS error
      const isConnectionError = err.code === 'ECONNREFUSED' || 
                                err.code === 'ERR_NETWORK' ||
                                err.code === 'ERR_FAILED' ||
                                err.message?.includes('ERR_CONNECTION_REFUSED') || 
                                err.message?.includes('Network Error') ||
                                err.message?.includes('Failed to fetch') ||
                                err.message?.includes('CORS') ||
                                (err.response?.status === 0);
      
      // Check if it's a CORS error specifically
      const isCorsError = !err.response && 
                         (err.message?.includes('CORS') || 
                          err.message?.includes('Access-Control-Allow-Origin') ||
                          err.code === 'ERR_FAILED');
      
      if (isCorsError) {
        setError(
          <div>
            <p className="mb-2">⚠️ CORS Error: Backend is not allowing requests from this origin.</p>
            <p className="mb-2 text-sm">The backend needs to be configured to allow CORS. Current API URL: <code className="bg-gray-100 px-1 rounded text-xs">{API_URL}</code></p>
            <p className="text-sm mt-2">
              <span className="font-semibold">Alternative:</span> View your transactions on{' '}
              <a 
                href={`${BLOCK_EXPLORER_URL}/address/${account}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 underline"
              >
                Block Explorer
              </a>
            </p>
          </div>
        );
      } else if (isConnectionError) {
        setError(
          <div>
            <p className="mb-2">⚠️ Cannot connect to backend server.</p>
            <p className="mb-2 text-sm">To fix this:</p>
            <ol className="list-decimal list-inside text-sm mb-2 space-y-1">
              <li>Get your Vercel backend URL from <a href="https://vercel.com/mohamed-jibrils-projects/blockchan" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Vercel dashboard</a></li>
              <li>Add it as <code className="bg-gray-100 px-1 rounded">REACT_APP_API_URL</code> in Netlify environment variables</li>
              <li>Redeploy the frontend</li>
            </ol>
            <p className="text-sm mt-2">
              <span className="font-semibold">Alternative:</span> View your transactions on{' '}
              <a 
                href={`${BLOCK_EXPLORER_URL}/address/${account}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 underline"
              >
                Block Explorer
              </a>
            </p>
          </div>
        );
      } else {
        const errorMsg = err.response?.data?.error || err.message;
        // Filter out meaningless error messages like "eg"
        if (errorMsg && typeof errorMsg === 'string' && errorMsg.length > 2 && errorMsg !== 'eg') {
          setError(errorMsg);
        } else {
          setError('Failed to fetch transaction history. Please try again.');
        }
      }
      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [account, BLOCK_EXPLORER_URL]);

  useEffect(() => {
    if (isConnected && account) {
      fetchHistory();
    } else {
      setTransactions([]);
      setFilteredTransactions([]);
    }
  }, [isConnected, account, fetchHistory]);

  useEffect(() => {
    // Filter transactions based on search term
    if (!searchTerm.trim()) {
      setFilteredTransactions(transactions);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = transactions.filter((tx) => {
      return (
        tx.txHash.toLowerCase().includes(search) ||
        tx.fileHashHex.toLowerCase().includes(search) ||
        tx.owner.toLowerCase().includes(search) ||
        tx.date.toLowerCase().includes(search) ||
        tx.blockNumber.toString().includes(search)
      );
    });
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatHash = (hash) => {
    if (!hash) return '';
    if (hash.length <= 20) return hash;
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(filteredTransactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transaction-history-${account?.slice(2, 10)}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadTXT = () => {
    let content = 'TRANSACTION HISTORY\n';
    content += '='.repeat(80) + '\n\n';
    content += `Wallet Address: ${account}\n`;
    content += `Total Transactions: ${filteredTransactions.length}\n`;
    content += `Generated: ${new Date().toISOString()}\n\n`;
    content += '='.repeat(80) + '\n\n';

    filteredTransactions.forEach((tx, index) => {
      content += `Transaction #${index + 1}\n`;
      content += '-'.repeat(80) + '\n';
      content += `Transaction Hash: ${tx.txHash}\n`;
      content += `File Hash: ${tx.fileHashHex}\n`;
      content += `Owner: ${tx.owner}\n`;
      content += `Date: ${formatDate(tx.timestamp)}\n`;
      content += `Status: ${tx.status}\n`;
      content += `Public: ${tx.isPublic ? 'Yes' : 'No'}\n`;
      content += `Block Number: ${tx.blockNumber}\n`;
      content += `Gas Used: ${tx.gasUsed}\n`;
      content += `Block Explorer: ${BLOCK_EXPLORER_URL}/tx/${tx.txHash}\n`;
      content += '\n';
    });

    const dataBlob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transaction-history-${account?.slice(2, 10)}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please connect your wallet to view your transaction history.
          </p>
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Transaction History
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Wallet: {formatAddress(account)}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            {filteredTransactions.length > 0 && (
              <>
                <button
                  onClick={downloadJSON}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Download JSON
                </button>
                <button
                  onClick={downloadTXT}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Download TXT
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by transaction hash, file hash, block number, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchTerm ? 'No transactions found matching your search.' : 'No transactions found.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredTransactions.length} of {transactions.length} transaction(s)
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Transaction Hash
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      File Hash
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Block
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Public
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map((tx, index) => (
                    <tr key={tx.txHash} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`${BLOCK_EXPLORER_URL}/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-mono"
                        >
                          {formatHash(tx.txHash)}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {formatHash(tx.fileHashHex)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(tx.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {tx.blockNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            tx.status === 'success'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {tx.isPublic ? (
                          <span className="text-green-600 dark:text-green-400">Yes</span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a
                          href={`${BLOCK_EXPLORER_URL}/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default History;

