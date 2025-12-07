import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { SUPPORTED_NETWORKS, getNetworkByChainId, getDefaultNetwork, getSupportedChainIds } from '../config/networks';

const WalletContext = createContext();

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(() => {
    // Get saved network from localStorage or use default
    const saved = localStorage.getItem('selectedNetwork');
    return saved ? SUPPORTED_NETWORKS[saved] || getDefaultNetwork() : getDefaultNetwork();
  });

  // Update TARGET_CHAIN_ID based on selected network
  const TARGET_CHAIN_ID = selectedNetwork.chainId;

  const disconnectWallet = async () => {
    try {
      // Clear all application state
      setAccount(null);
      setProvider(null);
      setChainId(null);
      
      // Note: MetaMask may still remember the connection permission
      // Users can manually disconnect in MetaMask's "Connected Sites" if needed
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
      // User disconnected in MetaMask - clear our state
      setAccount(null);
      setProvider(null);
      setChainId(null);
    } else if (account && accounts[0] !== account) {
      // User switched accounts in MetaMask - update to new account
      setAccount(accounts[0]);
    }
  }, [account]);

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

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return false;
    }

    setIsConnecting(true);
    try {
      // Always use eth_requestAccounts to ensure MetaMask opens
      // This will show the MetaMask popup for account selection
      // Note: If MetaMask has cached permissions, it may auto-connect to the last used account
      // Users can switch accounts in MetaMask if needed
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        setIsConnecting(false);
        return false;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
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
      
      // If user rejected the connection, don't show error
      if (error.code === 4001) {
        console.log('User rejected wallet connection');
      } else if (error.code === -32002) {
        // Connection request already pending
        console.log('Connection request already pending');
        alert('A connection request is already pending. Please check MetaMask.');
      } else {
        alert('Error connecting wallet: ' + (error.message || 'Unknown error'));
      }
      
      setIsConnecting(false);
      return false;
    }
  };

  const switchNetwork = async (networkToSwitch = null) => {
    const network = networkToSwitch || selectedNetwork;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
      });
      
      // Update selected network if switching to a new one
      if (networkToSwitch && networkToSwitch.chainId !== selectedNetwork.chainId) {
        const networkKey = Object.keys(SUPPORTED_NETWORKS).find(
          key => SUPPORTED_NETWORKS[key].chainId === networkToSwitch.chainId
        );
        if (networkKey) {
          setSelectedNetwork(networkToSwitch);
          localStorage.setItem('selectedNetwork', networkKey);
        }
      }
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${network.chainId.toString(16)}`,
                chainName: network.name,
                nativeCurrency: network.nativeCurrency,
                rpcUrls: network.rpcUrls,
                blockExplorerUrls: network.blockExplorerUrls,
              },
            ],
          });
          
          // Update selected network after adding
          if (networkToSwitch && networkToSwitch.chainId !== selectedNetwork.chainId) {
            const networkKey = Object.keys(SUPPORTED_NETWORKS).find(
              key => SUPPORTED_NETWORKS[key].chainId === networkToSwitch.chainId
            );
            if (networkKey) {
              setSelectedNetwork(networkToSwitch);
              localStorage.setItem('selectedNetwork', networkKey);
            }
          }
        } catch (addError) {
          console.error('Error adding network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  const switchToNetwork = async (networkKey) => {
    const network = SUPPORTED_NETWORKS[networkKey];
    if (!network) {
      throw new Error('Network not supported');
    }
    
    if (network.chainId === selectedNetwork.chainId) {
      return; // Already on this network
    }
    
    // If connected, switch network in MetaMask
    if (window.ethereum && account) {
      await switchNetwork(network);
      // Reload to apply new network settings
      window.location.reload();
    } else {
      // If not connected, just update the selected network
      setSelectedNetwork(network);
      localStorage.setItem('selectedNetwork', networkKey);
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
    selectedNetwork,
    supportedNetworks: SUPPORTED_NETWORKS,
    switchNetwork,
    switchToNetwork,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

