import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);

  const TARGET_CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID || '80002'); // Polygon Amoy

  const disconnectWallet = async () => {
    try {
      // Clear all state
      setAccount(null);
      setProvider(null);
      setChainId(null);
      
      // Try to disconnect from MetaMask (if supported)
      if (window.ethereum && window.ethereum.disconnect) {
        await window.ethereum.disconnect();
      }
      
      console.log('Wallet disconnected successfully');
    } catch (error) {
      // Even if disconnect fails, clear the state
      setAccount(null);
      setProvider(null);
      setChainId(null);
      console.log('Wallet disconnected (state cleared)');
    }
  };

  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  }, []);

  const handleChainChanged = useCallback((chainId) => {
    setChainId(Number(chainId));
    window.location.reload();
  }, []);

  useEffect(() => {
    // Set up event listeners but don't auto-connect
    // Users must manually click "Connect Wallet"
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [handleAccountsChanged, handleChainChanged]);

  const checkConnection = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setProvider(provider);
        setAccount(accounts[0]);
        setChainId(Number(network.chainId));
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return false;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);

      setProvider(provider);
      setAccount(accounts[0]);
      setChainId(currentChainId);

      // Check if on correct network
      if (currentChainId !== TARGET_CHAIN_ID) {
        await switchNetwork();
      }

      setIsConnecting(false);
      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setIsConnecting(false);
      return false;
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${TARGET_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${TARGET_CHAIN_ID.toString(16)}`,
                chainName: 'Polygon Amoy',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc-amoy.polygon.technology'],
                blockExplorerUrls: ['https://amoy.polygonscan.com/'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      }
    }
  };


  const value = {
    account,
    provider,
    isConnecting,
    chainId,
    connectWallet,
    disconnectWallet,
    isConnected: !!account,
    isCorrectNetwork: chainId === TARGET_CHAIN_ID,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

