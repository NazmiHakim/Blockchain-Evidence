import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.title}>Laporan Pertama Anda.<br/><span style={styles.yellowText}>Tersimpan Selamanya.</span></h1>
        <p style={styles.subtitle}>Sistem pelaporan kekerasan seksual berbasis Blockchain untuk Satgas PPKS kampus. Kesaksian Anda terkunci permanen sejak detik pertama pelaporan.</p>
        <div style={styles.heroBtns}>
          <button className="btn-pijar" onClick={() => navigate('/lapor')}>Laporkan Sekarang</button>
          <button style={styles.outlineBtn} onClick={() => navigate('/status')}>Cek Status Laporan</button>
        </div>
      </section>

      {/* Why Section */}
      <section style={styles.whySection}>
        <h3 style={styles.sectionLabel}>MENGAPA PIJAR</h3>
        <h2 style={styles.sectionTitle}>Dirancang untuk Melindungi, Bukan Memperumit</h2>
        <div style={styles.grid}>
          <div style={styles.card}>
            <h4>🛡️ Bukti Tidak Bisa Diubah</h4>
            <p>Setelah laporan dikirim, tidak ada seorangpun yang bisa mengubah atau menghapusnya.</p>
          </div>
          <div style={styles.card}>
            <h4>📅 Timestamp Resmi Blockchain</h4>
            <p>Waktu pelaporan diambil langsung dari jaringan Ethereum, tidak bisa dimanipulasi.</p>
          </div>
          <div style={styles.card}>
            <h4>🕵️ Identitas Pseudonim</h4>
            <p>Anda tidak perlu memasukkan nama atau email. Identitas Anda adalah alamat dompet digital.</p>
          </div>
        </div>
      </section>

      {/* Footer-like CTA */}
      <section style={styles.ctaBox}>
        <div style={styles.ctaContent}>
          <h3>Siap untuk mengamankan kesaksian Anda?</h3>
          <button className="btn-pijar" onClick={() => navigate('/lapor')}>Mulai Laporan Sekarang</button>
        </div>
        <div style={styles.satgasLogin}>
            <p>Anggota Satgas PPKS?</p>
            <button style={styles.blueBtn} onClick={() => navigate('/satgas')}>Masuk ke Dashboard</button>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: { padding: '0 80px 80px 80px' },
  hero: { padding: '100px 0', maxWidth: '800px' },
  title: { fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' },
  yellowText: { color: '#FFFF2E' },
  subtitle: { fontSize: '18px', color: '#ccc', lineHeight: '1.6', marginBottom: '40px' },
  heroBtns: { display: 'flex', gap: '20px' },
  outlineBtn: { background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' },
  whySection: { padding: '80px 0' },
  sectionLabel: { color: '#4D6CFA', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px' },
  sectionTitle: { fontSize: '32px', marginBottom: '40px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  card: { padding: '30px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.02)' },
  ctaBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#000', padding: '50px', borderRadius: '20px', marginTop: '50px' },
  blueBtn: { backgroundColor: '#03257F', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }
};

export default LandingPage;