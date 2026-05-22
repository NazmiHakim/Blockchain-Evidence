import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SuccessReport = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Ekstrak state dinamis (fallback jika diakses langsung tanpa submit)
  const { reportId, txHash } = location.state || { reportId: 'N/A', txHash: 'N/A' };

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '80px', margin: '0 0 20px', animation: 'bounce 2s infinite' }}>✨</h1>
      <h1 style={{ color: '#FFFF2E', fontSize: '42px', margin: '0 0 10px', fontWeight: '800' }}>Laporan Berhasil Tersimpan!</h1>
      <p style={{ color: '#aaa', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
        Laporan enkripsi awal Anda telah terkunci secara permanen dan di-timestamp di Blockchain Ethereum (Sepolia).
      </p>
      
      <div style={styles.receiptCard}>
        <div style={styles.receiptRow}>
          <span style={styles.receiptLabel}>ID LAPORAN (ON-CHAIN)</span>
          <strong style={{ color: '#FFFF2E', fontSize: '20px' }}>#{reportId}</strong>
        </div>
        <hr style={{ borderColor: '#222', margin: '15px 0' }} />
        <div style={styles.receiptRow}>
          <span style={styles.receiptLabel}>TRANSACTION HASH</span>
          {txHash !== 'N/A' ? (
            <a 
              href={`https://sepolia.etherscan.io/tx/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.txLink}
            >
              {txHash.substring(0, 12)}...{txHash.substring(54)} ↗
            </a>
          ) : (
            <code style={{ color: '#888' }}>N/A</code>
          )}
        </div>
      </div>

      <div style={{ marginTop: '50px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <button className="btn-pijar" onClick={() => navigate('/status')} style={{ padding: '15px 35px' }}>
          Cek Status Laporan
        </button>
        <button 
          className="btn-pijar" 
          onClick={() => navigate('/')} 
          style={{ padding: '15px 35px', background: 'transparent', border: '1px solid #333', color: '#888' }}
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};

const styles = {
  receiptCard: { 
    background: 'var(--card-bg)', 
    padding: '30px', 
    borderRadius: '20px', 
    border: '1px solid var(--border-white)',
    display: 'inline-block', 
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    textAlign: 'left',
    boxSizing: 'border-box'
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  receiptLabel: {
    color: '#666',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1px'
  },
  txLink: {
    color: '#4D6CFA',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '14px',
    wordBreak: 'break-all'
  }
};

export default SuccessReport;