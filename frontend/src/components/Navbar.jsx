import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ConnectWallet from './ConnectWallet';

const Navbar = () => {
  const location = useLocation();
  const [isModalOpen, setModalOpen] = useState(false);

  const navLinkStyle = (path) => ({
    color: location.pathname === path ? '#FFFF2E' : '#888',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: location.pathname === path ? '700' : '400',
    transition: '0.3s'
  });

  return (
    <>
      <nav style={styles.nav}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px' }}>PIJAR</div>
        <div style={styles.menu}>
          <Link to="/" style={navLinkStyle('/')}>Beranda</Link>
          <Link to="/lapor" style={navLinkStyle('/lapor')}>Laporkan</Link>
          <Link to="/status" style={navLinkStyle('/status')}>Status Laporan</Link>
          <Link to="/satgas" style={navLinkStyle('/satgas')}>Satgas</Link>
        </div>
        <button className="btn-pijar" onClick={() => setModalOpen(true)}>
          Connect Wallet
        </button>
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
  menu: { display: 'flex', gap: '40px' }
};

export default Navbar;