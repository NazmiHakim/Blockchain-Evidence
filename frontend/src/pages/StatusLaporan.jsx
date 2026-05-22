import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/config';
import EvidenceViewer from '../components/EvidenceViewer';

const StatusLaporan = () => {
  const { account, connect } = useWallet();
  
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  // Status mapping
  const STATUS_TEXT = ['SUBMITTED', 'SEDANG DIPROSES', 'SELESAI'];
  const STATUS_COLORS = ['#4D6CFA', '#FFFF2E', '#27AE60'];

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setError('Masukkan ID laporan terlebih dahulu.');
      return;
    }

    if (!window.ethereum) {
      setError('MetaMask belum terpasang di browser Anda.');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);

    try {
      // Buat provider read-only dari browser
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Cari laporan berdasarkan ID (BigInt)
      const idBigInt = BigInt(searchId.trim());
      const rawReport = await contract.reports(idBigInt);

      // Cek apakah laporan valid / ada (jika alamat reporter kosong, laporan tidak ditemukan)
      if (rawReport.reporter === ethers.ZeroAddress) {
        setError(`Laporan dengan ID #${searchId} tidak ditemukan.`);
        setLoading(false);
        return;
      }

      // Format report object agar mudah dibaca di frontend
      const formattedReport = {
        id: Number(rawReport.id),
        reporter: rawReport.reporter,
        ipfsHash: rawReport.ipfsHash,
        fileType: rawReport.fileType,
        encryptionKey: rawReport.encryptionKey,
        timestamp: Number(rawReport.timestamp),
        status: Number(rawReport.status)
      };

      setReport(formattedReport);
    } catch (err) {
      console.error('Error saat melacak laporan:', err);
      setError('Terjadi kesalahan saat mengambil data dari blockchain: ' + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Cek apakah wallet yang terhubung adalah pemilik laporan
  const isOwner = account && report && account.toLowerCase() === report.reporter.toLowerCase();

  return (
    <div style={styles.container}>
      <p style={{ color: 'var(--royal-blue)', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', letterSpacing: '1px' }}>PELACAKAN AMAN</p>
      <h1 style={{ textAlign: 'center', fontSize: '38px', marginBottom: '10px' }}>Cek Status Laporan</h1>
      <p style={{ textAlign: 'center', color: '#888', marginBottom: '40px' }}>
        Lacak status penanganan kasus Anda langsung di blockchain secara transparan dan aman.
      </p>

      <div style={styles.searchBox}>
        <input 
          type="number" 
          placeholder="Contoh: 1, 2, 3..." 
          style={styles.searchInput} 
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn-pijar" onClick={handleSearch} disabled={loading} style={{ padding: '12px 30px' }}>
          {loading ? 'Mencari...' : 'Cari Laporan'}
        </button>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          ❌ {error}
        </div>
      )}

      {report && (
        <div style={styles.resultWrapper}>
          {/* Bagian 1: Informasi Dasar Laporan */}
          <div style={styles.statusCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '24px' }}>Laporan #{report.id}</h3>
                <span style={{ color: '#666', fontSize: '12px' }}>
                  Waktu Blok: {new Date(report.timestamp * 1000).toLocaleString('id-ID')}
                </span>
              </div>
              <span 
                style={{ 
                  ...styles.badge, 
                  background: `${STATUS_COLORS[report.status]}15`, 
                  color: STATUS_COLORS[report.status],
                  border: `1px solid ${STATUS_COLORS[report.status]}40`
                }}
              >
                {STATUS_TEXT[report.status]}
              </span>
            </div>

            <hr style={{ borderColor: '#222', margin: '20px 0' }} />

            <div style={styles.infoList}>
              <p style={styles.infoRow}>
                <span style={styles.infoLabel}>Wallet Pelapor:</span>
                <code style={styles.code}>{report.reporter}</code>
              </p>
              <p style={styles.infoRow}>
                <span style={styles.infoLabel}>Hash IPFS (CID):</span>
                <code style={styles.code}>{report.ipfsHash}</code>
              </p>
              <p style={styles.infoRow}>
                <span style={styles.infoLabel}>Tipe Bukti:</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>{report.fileType}</span>
              </p>
            </div>

            {/* Bagian 2: Visualisasi Timeline Penanganan */}
            <h4 style={{ color: '#FFFF2E', marginTop: '35px', marginBottom: '20px', fontSize: '16px' }}>📍 Ringkasan Timeline Penanganan</h4>
            <div style={styles.timeline}>
              {/* Langkah 1 */}
              <div style={styles.timelineItem}>
                <div style={{ ...styles.timelineDot, background: '#27AE60' }}>✓</div>
                <div style={styles.timelineContent}>
                  <p style={styles.timelineTitle}>Laporan Dikirim (Submitted)</p>
                  <p style={styles.timelineDesc}>Bukti terenkripsi berhasil dicatat ke blockchain oleh pelapor.</p>
                </div>
              </div>

              {/* Langkah 2 */}
              <div style={styles.timelineItem}>
                <div 
                  style={{ 
                    ...styles.timelineDot, 
                    background: report.status >= 1 ? '#27AE60' : '#333',
                    color: report.status >= 1 ? '#fff' : '#888' 
                  }}
                >
                  {report.status >= 1 ? '✓' : '2'}
                </div>
                <div style={styles.timelineContent}>
                  <p style={{ ...styles.timelineTitle, color: report.status >= 1 ? '#fff' : '#666' }}>Sedang Diproses (Under Investigation)</p>
                  <p style={styles.timelineDesc}>Satgas PPKS sedang memverifikasi bukti-bukti fisik dan memproses aduan.</p>
                </div>
              </div>

              {/* Langkah 3 */}
              <div style={styles.timelineItem}>
                <div 
                  style={{ 
                    ...styles.timelineDot, 
                    background: report.status === 2 ? '#27AE60' : '#333',
                    color: report.status === 2 ? '#fff' : '#888' 
                  }}
                >
                  {report.status === 2 ? '✓' : '3'}
                </div>
                <div style={styles.timelineContent}>
                  <p style={{ ...styles.timelineTitle, color: report.status === 2 ? '#fff' : '#666' }}>Kasus Selesai (Resolved)</p>
                  <p style={styles.timelineDesc}>Aduan selesai ditangani dan diambil tindakan penyelesaian formal.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian 3: Dekripsi Khusus bagi Pelapor */}
          <div style={styles.decryptSection}>
            {isOwner ? (
              <div>
                <div style={styles.ownerBanner}>
                  <span>🔑 <strong>Status: Pemilik Laporan Terdeteksi.</strong> Wallet Anda cocok dengan pengirim laporan ini. Sistem secara otomatis mendekripsi data Anda.</span>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <EvidenceViewer 
                    ipfsHash={report.ipfsHash} 
                    fileType={report.fileType} 
                    encryptionKey={report.encryptionKey} 
                  />
                </div>
              </div>
            ) : (
              <div style={styles.lockedBanner}>
                <p style={{ margin: 0, fontSize: '15px' }}>
                  🔒 <strong>Kronologi & File Bukti Terkunci</strong>
                </p>
                <p style={{ margin: '5px 0 15px', color: '#888', fontSize: '13px' }}>
                  Hanya wallet **Pelapor Asli** atau **Satgas PPKS** yang berwenang yang dapat melihat detail kronologi dan bukti pendukung laporan ini di browser.
                </p>
                {!account ? (
                  <button className="btn-pijar" onClick={connect} style={{ fontSize: '12px', padding: '8px 20px' }}>
                    Hubungkan Wallet untuk Dekripsi
                  </button>
                ) : (
                  <span style={{ color: '#555', fontSize: '12px' }}>
                    Terhubung sebagai: <code>{account.substring(0, 6)}...{account.substring(38)}</code> (Bukan pengirim)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '60px 40px', maxWidth: '900px', margin: '0 auto' },
  searchBox: { display: 'flex', gap: '15px', marginBottom: '30px' },
  searchInput: { 
    flex: 1, 
    padding: '15px', 
    borderRadius: '12px', 
    border: '1px solid #333', 
    background: 'rgba(0,0,0,0.3)', 
    color: '#fff',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  resultWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  statusCard: { 
    background: 'var(--card-bg)', 
    padding: '35px', 
    borderRadius: '20px', 
    border: '1px solid var(--border-white)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.4)' 
  },
  badge: { 
    padding: '6px 20px', 
    borderRadius: '30px', 
    fontSize: '12px', 
    fontWeight: 'bold',
    letterSpacing: '1px'
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '15px'
  },
  infoRow: {
    margin: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  infoLabel: {
    color: '#888',
    fontSize: '14px'
  },
  code: {
    background: 'rgba(0,0,0,0.4)',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #222',
    color: '#4D6CFA',
    fontSize: '13px',
    wordBreak: 'break-all'
  },
  errorAlert: {
    background: 'rgba(255, 77, 77, 0.08)',
    color: '#ff4d4d',
    border: '1px solid rgba(255, 77, 77, 0.2)',
    padding: '15px 20px',
    borderRadius: '12px',
    marginBottom: '30px',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
    position: 'relative',
    paddingLeft: '20px',
    marginTop: '25px'
  },
  timelineItem: {
    display: 'flex',
    gap: '20px',
    position: 'relative'
  },
  timelineDot: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    zIndex: 2,
    border: '2px solid #111'
  },
  timelineContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'left'
  },
  timelineTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 'bold'
  },
  timelineDesc: {
    margin: 0,
    color: '#777',
    fontSize: '13px',
    lineHeight: '1.4'
  },
  decryptSection: {
    width: '100%'
  },
  ownerBanner: {
    background: 'rgba(39, 174, 96, 0.08)',
    border: '1px solid rgba(39, 174, 96, 0.2)',
    color: '#27AE60',
    padding: '18px',
    borderRadius: '12px',
    textAlign: 'left',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center'
  },
  lockedBanner: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
    padding: '30px',
    borderRadius: '16px',
    textAlign: 'center'
  }
};

export default StatusLaporan;