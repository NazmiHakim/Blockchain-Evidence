import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/config';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isSatgas, setIsSatgas] = useState(false);

  const connect = async () => {
    if (!window.ethereum) {
      alert('MetaMask belum terpasang.');
      return;
    }
    try {
      // Menggunakan BrowserProvider sesuai standar ethers v6
      const provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await provider.getSigner();
      const _account = await _signer.getAddress();

      setAccount(_account);
      setSigner(_signer);

      // Cek role Satgas
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const _isSatgas = await contract.isSatgas(_account);
      setIsSatgas(_isSatgas);

    } catch (err) {
      console.error('Gagal connect:', err);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setSigner(null);
    setIsSatgas(false);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) disconnect();
        else connect();
      });
    }
  }, []);

  return (
    <WalletContext.Provider value={{ account, signer, isSatgas, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);