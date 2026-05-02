import React from 'react';

const StatusLaporan = () => {
  return (
    <div style={styles.container}>
      <h1 style={{textAlign: 'center'}}>Cek Status Laporan</h1>
      <div style={styles.searchBox}>
        <input type="text" placeholder="Masukkan ID Laporan" style={styles.searchInput} />
        <button className="btn-pijar">Cari</button>
      </div>
      
      <div style={styles.statusCard}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <h3>Laporan #0047</h3>
          <span style={styles.badge}>SEDANG DIPROSES</span>
        </div>
        <hr style={{borderColor: '#333', margin: '20px 0'}} />
        <p>Tanggal Lapor: <strong>12 April 2026</strong></p>
        <p>Wallet Pelapor: <code>0x71C7...976F</code></p>
        <p>Hash IPFS: <code>QmXoyp...kDDP</code></p>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '80px', maxWidth: '800px', margin: '0 auto' },
  searchBox: { display: 'flex', gap: '10px', marginBottom: '50px' },
  searchInput: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff' },
  statusCard: { background: '#111', padding: '30px', borderRadius: '12px', border: '1px solid #333' },
  badge: { background: 'rgba(255, 255, 46, 0.1)', color: '#FFFF2E', padding: '5px 15px', borderRadius: '20px', fontSize: '12px' }
};

export default StatusLaporan;