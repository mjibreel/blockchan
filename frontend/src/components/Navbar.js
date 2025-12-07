import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

function Navbar() {
  const { account, connectWallet, disconnectWallet, isConnected, isCorrectNetwork, selectedNetwork, supportedNetworks, switchToNetwork } = useWallet();
  const [showChainSelector, setShowChainSelector] = useState(false);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleChainSelect = async (networkKey) => {
    try {
      await switchToNetwork(networkKey);
      setShowChainSelector(false);
    } catch (error) {
      console.error('Error switching network:', error);
      alert(`Failed to switch network: ${error.message}`);
    }
  };

  return (
    <nav className="bg-white dark:bg-[#1E2024] shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                🔐 Qubic File Stamp
              </span>
            </Link>
            <div className="ml-10 flex items-center space-x-4">
              <Link
                to="/stamp"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Stamp
              </Link>
              <Link
                to="/verify"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Verify
              </Link>
              <Link
                to="/history"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                History
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Chain Selector */}
            <div className="relative">
              <button
                onClick={() => setShowChainSelector(!showChainSelector)}
                className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center"
              >
                <span className="mr-2">🌐</span>
                {selectedNetwork?.name || 'Select Chain'}
                <span className="ml-2">▼</span>
              </button>
              
              {showChainSelector && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowChainSelector(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 border border-gray-200 dark:border-gray-700">
                    <div className="py-2">
                      {Object.entries(supportedNetworks).map(([key, network]) => (
                        <button
                          key={key}
                          onClick={() => handleChainSelect(key)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            selectedNetwork?.chainId === network.chainId
                              ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="font-medium">{network.name}</div>
                          {!network.contractAddress && (
                            <div className="text-xs text-yellow-600 dark:text-yellow-400">
                              Contract not deployed
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {isConnected ? (
              <div className="flex items-center space-x-4">
                {!isCorrectNetwork && (
                  <button
                    onClick={() => switchToNetwork(Object.keys(supportedNetworks).find(key => supportedNetworks[key].chainId === selectedNetwork.chainId))}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-medium"
                  >
                    Switch Network
                  </button>
                )}
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  {formatAddress(account)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

