import React from 'react';

const DashboardSatgas = () => {
  return (
    <div style={{ padding: '40px 80px' }}>
      <h1 style={{ marginBottom: '40px' }}>Dashboard Satgas PPKS</h1>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Laporan</p>
          <h2 style={styles.statValue}>47</h2>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #FFFF2E' }}>
          <p style={styles.statLabel}>Menunggu Tindakan</p>
          <h2 style={styles.statValue}>12</h2>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #4D6CFA' }}>
          <p style={styles.statLabel}>Sedang Diproses</p>
          <h2 style={styles.statValue}>8</h2>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #27AE60' }}>
          <p style={styles.statLabel}>Kasus Selesai</p>
          <h2 style={styles.statValue}>27</h2>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={{ color: '#555', fontSize: '13px' }}>
              <th style={styles.th}>ID LAPORAN</th>
              <th style={styles.th}>WALLET</th>
              <th style={styles.th}>TANGGAL</th>
              <th style={styles.th}>STATUS</th>
              <th style={styles.th}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr style={styles.tr}>
              <td style={styles.td}>#0047</td>
              <td style={styles.td}><code>0x71C7...976F</code></td>
              <td style={styles.td}>12 Apr 2026</td>
              <td style={styles.td}><span style={styles.status}>SUBMITTED</span></td>
              <td style={styles.td}><button className="btn-pijar" style={{ padding: '6px 15px', fontSize: '12px' }}>Lihat Detail</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '50px' },
  statCard: { 
    background: 'var(--card-bg)', 
    padding: '30px', 
    borderRadius: '16px', 
    border: '1px solid var(--border-white)',
    textAlign: 'center'
  },
  statLabel: { color: '#888', fontSize: '14px', marginBottom: '10px' },
  statValue: { fontSize: '42px', margin: 0, fontWeight: 'bold' },
  tableWrapper: { background: 'var(--card-bg)', borderRadius: '20px', border: '1px solid var(--border-white)', padding: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '20px', textAlign: 'left' },
  td: { padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' },
  status: { background: 'rgba(77, 108, 250, 0.1)', color: '#4D6CFA', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }
};

export default DashboardSatgas;