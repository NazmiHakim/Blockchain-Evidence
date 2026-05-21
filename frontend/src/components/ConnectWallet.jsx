import React from 'react';
// 1. Import useWallet dari context
import { useWallet } from '../context/WalletContext'; 

const ConnectWallet = ({ isOpen, onClose }) => {
  // 2. Ambil fungsi connect dari context
  const { connect } = useWallet();

  if (!isOpen) return null;

  const handleConnect = async () => {
    // 3. Panggil fungsi connect dari context, lalu tutup modal
    await connect();
    onClose(); 
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={{ color: '#fff' }}>Hubungkan Wallet</h2>
        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '30px' }}>
          Pilih provider wallet untuk masuk ke sistem PIJAR secara anonim.
        </p>
        
        <button 
          className="btn-pijar" 
          style={styles.providerBtn}
          onClick={handleConnect} // Gunakan handleConnect di sini
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