import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ConnectWallet from './ConnectWallet';
// 1. Import useWallet dari context
import { useWallet } from '../context/WalletContext'; 

const Navbar = () => {
  const location = useLocation();
  const [isModalOpen, setModalOpen] = useState(false);
  
  // 2. Ambil account dari context
  const { account } = useWallet(); 

  const navLinkStyle = (path) => ({
    color: location.pathname === path ? '#FFFF2E' : '#888',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: location.pathname === path ? '700' : '400',
    transition: '0.3s'
  });

  // Fungsi utilitas untuk menyingkat address wallet (contoh: 0x1234...5678)
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      <nav style={styles.nav}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px', color: '#fff' }}>PIJAR</div>
        <div style={styles.menu}>
          <Link to="/" style={navLinkStyle('/')}>Beranda</Link>
          <Link to="/lapor" style={navLinkStyle('/lapor')}>Laporkan</Link>
          <Link to="/status" style={navLinkStyle('/status')}>Status Laporan</Link>
          <Link to="/satgas" style={navLinkStyle('/satgas')}>Satgas</Link>
        </div>
        
        {/* 3. Conditional rendering: tampilkan address jika ada, tombol Connect jika tidak */}
        {account ? (
          <button className="btn-pijar" style={styles.connectedBtn}>
            {formatAddress(account)}
          </button>
        ) : (
          <button className="btn-pijar" onClick={() => setModalOpen(true)}>
            Connect Wallet
          </button>
        )}
      </nav>
      
      <ConnectWallet isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 80px',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(4, 4, 21, 0.7)',
    backdropFilter: 'blur(15px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  menu: { display: 'flex', gap: '40px' },
  // Tambahan style opsional agar tombol beda warna kalau sudah connect
  connectedBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #FFFF2E',
    color: '#FFFF2E',
    cursor: 'default'
  }
};

export default Navbar;