import React from 'react';

const Lapor = () => {
  return (
    <div style={{ padding: '60px 120px' }}>
      <p style={{ color: 'var(--royal-blue)', fontWeight: 'bold', fontSize: '14px' }}>FORMULIR AMAN</p>
      <h1 style={{ fontSize: '40px', marginBottom: '40px' }}>Rekam Kejadian Anda</h1>
      
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Kapan kejadian ini terjadi?</label>
            <input type="datetime-local" style={styles.input} />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Di mana lokasi kejadian?</label>
            <input type="text" placeholder="Gedung, Ruangan, atau Area..." style={styles.input} />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Ceritakan kronologi lengkap</label>
            <textarea rows="6" style={styles.input} placeholder="Kejadian ini dimulai saat..."></textarea>
          </div>

          <div style={styles.uploadArea}>
             <p>📤 Seret file bukti ke sini atau klik untuk memilih</p>
             <span style={{ color: '#555', fontSize: '12px' }}>Bukti Anda akan langsung dienkripsi sebelum masuk ke IPFS</span>
          </div>

          <button className="btn-pijar" style={{ width: '100%', marginTop: '30px', padding: '18px' }}>
            Kirim Laporan ke Blockchain
          </button>
        </div>

        <div style={styles.infoSide}>
          <div style={styles.pijarBox}>
            <h4 style={{ color: '#FFFF2E' }}>🛡️ Jaminan Sistem PIJAR</h4>
            <ul style={{ color: '#ccc', fontSize: '14px', lineHeight: '2' }}>
              <li>Identitas Anda tidak tersimpan di server manapun.</li>
              <li>Bukti fisik tidak dapat dimanipulasi oleh pihak lain.</li>
              <li>Laporan terverifikasi oleh jaringan Ethereum Sepolia.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  grid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '50px' },
  card: { 
    background: 'linear-gradient(145deg, #0a0a25, #040415)',
    padding: '40px', 
    borderRadius: '24px', 
    border: '1px solid var(--border-white)' 
  },
  label: { display: 'block', marginBottom: '10px', fontSize: '14px', color: '#aaa' },
  input: { 
    width: '100%', 
    padding: '15px', 
    borderRadius: '12px', 
    background: 'rgba(0,0,0,0.3)', 
    border: '1px solid #333', 
    color: '#fff', 
    marginBottom: '25px',
    boxSizing: 'border-box'
  },
  uploadArea: {
    border: '2px dashed #333',
    padding: '40px',
    textAlign: 'center',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.01)'
  },
  pijarBox: {
    background: 'rgba(77, 108, 250, 0.05)',
    padding: '30px',
    borderRadius: '20px',
    border: '1px solid rgba(77, 108, 250, 0.2)'
  }
};

export default Lapor;