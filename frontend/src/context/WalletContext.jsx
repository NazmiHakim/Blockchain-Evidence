import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/config';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isSatgas, setIsSatgas] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const connect = async (forcePrompt = false) => {
    if (!window.ethereum) {
      alert('MetaMask belum terpasang.');
      return;
    }
    try {
      if (forcePrompt) {
        // Memaksa MetaMask untuk memunculkan pop-up pilihan akun
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
      }

      // Menggunakan BrowserProvider sesuai standar ethers v6
      const provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await provider.getSigner();
      const _account = await _signer.getAddress();

      setAccount(_account);
      setSigner(_signer);

      // Cek role Satgas & Admin
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const _isSatgas = await contract.isSatgas(_account);
      const _adminAddr = await contract.admin();
      
      setIsSatgas(_isSatgas);
      setIsAdmin(_account.toLowerCase() === _adminAddr.toLowerCase());

    } catch (err) {
      console.error('Gagal connect:', err);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setSigner(null);
    setIsSatgas(false);
    setIsAdmin(false);
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            await connect();
          }
        } catch (err) {
          console.error("Gagal memeriksa koneksi saat memuat:", err);
        }
      }
    };
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) disconnect();
        else connect();
      });
      // Handle network changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
    
    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <WalletContext.Provider value={{ account, signer, isSatgas, isAdmin, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);