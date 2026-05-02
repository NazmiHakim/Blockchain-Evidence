import React from 'react';

const DetailLaporan = () => {
  return (
    <div style={{ padding: '40px 80px' }}>
      <h3 style={{ color: '#03257F' }}>Dashboard / Detail Laporan / #0047</h3>
      <div style={styles.container}>
        <div style={styles.content}>
          <h2 style={{ color: '#FFFF2E' }}>Kronologi Kejadian</h2>
          <p style={{ lineHeight: '1.8' }}>Isi kronologi laporan akan tampil di sini setelah didekripsi di browser...</p>
          <h3 style={{ marginTop: '40px' }}>📁 File Bukti</h3>
          <div style={styles.fileBox}>Foto_Bukti_1.jpg <button className="btn-pijar">Unduh</button></div>
        </div>
        <div style={styles.sidebar}>
          <h4>Status Penanganan</h4>
          <select style={styles.select}>
            <option>Submitted</option>
            <option>Under Investigation</option>
            <option>Resolved</option>
          </select>
          <button className="btn-pijar" style={{ width: '100%', marginTop: '20px' }}>Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginTop: '30px' },
  content: { background: '#111', padding: '30px', borderRadius: '12px', border: '1px solid #333' },
  sidebar: { background: '#111', padding: '30px', borderRadius: '12px', height: 'fit-content', border: '1px solid #333' },
  select: { width: '100%', padding: '10px', background: '#000', color: '#fff', borderRadius: '6px' },
  fileBox: { padding: '15px', border: '1px solid #333', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
};

export default DetailLaporan;