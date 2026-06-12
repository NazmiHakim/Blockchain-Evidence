import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ConnectWallet from './ConnectWallet';
// 1. Import useWallet dari context
import { useWallet } from '../context/WalletContext'; 

const Navbar = () => {
  const location = useLocation();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  
  // 2. Ambil account, role, dan disconnect dari context
  const { account, isSatgas, isAdmin, disconnect } = useWallet(); 

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
          {isSatgas && (
            <Link to="/satgas" style={navLinkStyle('/satgas')}>Satgas</Link>
          )}
        </div>
        
        {/* 3. Conditional rendering: tampilkan address jika ada, tombol Connect jika tidak */}
        {account ? (
          <div style={{ position: 'relative' }}>
            <button 
              className="btn-pijar" 
              style={styles.connectedBtn}
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            >
              🔑 {formatAddress(account)}
            </button>
            
            {isDropdownOpen && (
              <div style={styles.dropdown}>
                <button 
                  style={styles.logoutBtn} 
                  onClick={() => {
                    disconnect();
                    setDropdownOpen(false);
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
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
    backgroundColor: 'rgba(255, 255, 46, 0.1)',
    border: '1px solid rgba(255, 255, 46, 0.5)',
    color: '#FFFF2E',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    background: 'rgba(10, 10, 25, 0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '10px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    minWidth: '150px',
    backdropFilter: 'blur(10px)',
    zIndex: 1001
  },
  logoutBtn: {
    width: '100%',
    padding: '10px 15px',
    background: 'rgba(255,77,77,0.1)',
    color: '#ff4d4d',
    border: '1px solid rgba(255,77,77,0.2)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  }
};

export default Navbar;