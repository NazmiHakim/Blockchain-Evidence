import React from 'react';
import { ethers } from 'ethers';

const ConnectWallet = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const connectToMetaMask = async () => {
    // 1. Cek apakah MetaMask terpasang di browser
    if (window.ethereum) {
      try {
        // 2. Minta izin akses akun ke user
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        console.log("Connected to:", accounts[0]);
        alert("Berhasil terhubung ke: " + accounts[0]);
        
        // 3. Tutup modal setelah berhasil
        onClose(); 
      } catch (error) {
        console.error("User menolak koneksi", error);
      }
    } else {
      alert("Wah, MetaMask belum terpasang nih. Instal dulu ya di browser kamu!");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={{ color: '#fff' }}>Hubungkan Wallet</h2>
        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '30px' }}>
          Pilih provider wallet untuk masuk ke sistem PIJAR secara anonim.
        </p>
        
        {/* Tambahkan onClick di sini */}
        <button 
          className="btn-pijar" 
          style={styles.providerBtn}
          onClick={connectToMetaMask}
        >
          🦊 MetaMask
        </button>
        
        <button style={styles.closeBtn} onClick={onClose}>Batal</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: { 
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.85)', 
    backdropFilter: 'blur(5px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 
  },
  modal: { 
    background: '#040415', padding: '40px', borderRadius: '24px', 
    border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', maxWidth: '400px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
  },
  providerBtn: { width: '100%', padding: '15px', fontSize: '16px' },
  closeBtn: { background: 'transparent', border: 'none', color: '#555', marginTop: '20px', cursor: 'pointer' }
};

export default ConnectWallet;