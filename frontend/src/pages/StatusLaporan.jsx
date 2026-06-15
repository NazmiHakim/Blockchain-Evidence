import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/config';
import EvidenceViewer from '../components/EvidenceViewer';

const StatusLaporan = () => {
  const { account, connect } = useWallet();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myReports, setMyReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  // Status mapping
  const STATUS_TEXT = ['SUBMITTED', 'SEDANG DIPROSES', 'SELESAI'];
  const STATUS_COLORS = ['#4D6CFA', '#FFFF2E', '#27AE60'];

  useEffect(() => {
    if (account) {
      fetchMyReports();
    } else {
      setMyReports([]);
      setSelectedReport(null);
    }
  }, [account]);

  const fetchMyReports = async () => {
    if (!window.ethereum) return;

    setLoading(true);
    setError('');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Butuh signer karena getMyReports mengambil msg.sender
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // getMyReports mengembalikan array of uint256 (ID)
      const reportIds = await contract.getMyReports();
      
      const reportsData = [];
      for (let i = 0; i < reportIds.length; i++) {
        const rawReport = await contract.reports(reportIds[i]);
        if (rawReport.reporter !== ethers.ZeroAddress) {
          reportsData.push({
            id: Number(rawReport.id),
            reporter: rawReport.reporter,
            ipfsHash: rawReport.ipfsHash,
            fileType: rawReport.fileType,
            encryptionKey: rawReport.encryptionKey,
            timestamp: Number(rawReport.timestamp),
            status: Number(rawReport.status)
          });
        }
      }

      // Urutkan dari yang terbaru
      reportsData.sort((a, b) => b.timestamp - a.timestamp);
      setMyReports(reportsData);

    } catch (err) {
      console.error('Error saat mengambil daftar laporan:', err);
      setError('Gagal mengambil daftar laporan Anda.');
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div style={styles.container}>
        <div style={styles.lockedBanner}>
          <p style={{ margin: 0, fontSize: '18px', color: '#fff' }}>
            🔒 <strong>Akses Terkunci</strong>
          </p>
          <p style={{ margin: '10px 0 20px', color: '#888', fontSize: '14px' }}>
            Hanya pelapor yang sah yang dapat melihat status dan riwayat pelaporan. Silakan hubungkan wallet MetaMask Anda.
          </p>
          <button className="btn-pijar" onClick={connect} style={{ padding: '12px 30px' }}>
            Hubungkan Wallet Anda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <p style={{ color: 'var(--royal-blue)', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', letterSpacing: '1px' }}>PELACAKAN</p>
      <h1 style={{ textAlign: 'center', fontSize: '38px', marginBottom: '10px' }}>Riwayat Laporan Saya</h1>
      <p style={{ textAlign: 'center', color: '#888', marginBottom: '40px' }}>
        Ketuk salah satu kartu laporan Anda di bawah ini untuk melihat status penanganan dan mendekripsi bukti.
      </p>

      {error && (
        <div style={styles.errorAlert}>
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <div style={styles.spinner}></div>
          <p>Memuat daftar laporan Anda dari blockchain...</p>
        </div>
      ) : (
        <>
          {!selectedReport ? (
            <div style={styles.cardsGrid}>
              {myReports.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666', padding: '40px' }}>
                  Anda belum pernah membuat laporan menggunakan wallet ini.
                </div>
              ) : (
                myReports.map((r) => (
                  <div 
                    key={r.id} 
                    className="report-card-item"
                    style={styles.reportCard} 
                    onClick={() => setSelectedReport(r)}
                  >
                    <div style={styles.cardHeader}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>Laporan #{r.id}</span>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 'bold', 
                        padding: '4px 10px', 
                        borderRadius: '20px',
                        background: `${STATUS_COLORS[r.status]}15`,
                        color: STATUS_COLORS[r.status],
                        border: `1px solid ${STATUS_COLORS[r.status]}40`
                      }}>
                        {STATUS_TEXT[r.status]}
                      </span>
                    </div>
                    <div style={styles.cardBody}>
                      <p style={{ margin: '5px 0', fontSize: '12px', color: '#888' }}>
                        📅 {new Date(r.timestamp * 1000).toLocaleString('id-ID')}
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '12px', color: '#888' }}>
                        📁 {r.fileType}
                      </p>
                    </div>
                    <div style={styles.cardFooter}>
                      <span style={{ color: 'var(--royal-blue)', fontSize: '13px', fontWeight: 'bold' }}>Lihat Detail →</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div style={styles.resultWrapper}>
              <button 
                onClick={() => setSelectedReport(null)} 
                style={styles.backBtn}
              >
                ← Kembali ke Daftar
              </button>

              {/* Bagian 1: Informasi Dasar Laporan */}
              <div style={styles.statusCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '24px' }}>Laporan #{selectedReport.id}</h3>
                    <span style={{ color: '#666', fontSize: '12px' }}>
                      Waktu Blok: {new Date(selectedReport.timestamp * 1000).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span 
                    style={{ 
                      ...styles.badge, 
                      background: `${STATUS_COLORS[selectedReport.status]}15`, 
                      color: STATUS_COLORS[selectedReport.status],
                      border: `1px solid ${STATUS_COLORS[selectedReport.status]}40`
                    }}
                  >
                    {STATUS_TEXT[selectedReport.status]}
                  </span>
                </div>

                <hr style={{ borderColor: '#222', margin: '20px 0' }} />

                {/* Visualisasi Timeline Penanganan */}
                <h4 style={{ color: '#FFFF2E', marginTop: '20px', marginBottom: '20px', fontSize: '16px' }}>📍 Ringkasan Timeline Penanganan</h4>
                <div style={styles.timeline}>
                  <div style={styles.timelineItem}>
                    <div style={{ ...styles.timelineDot, background: '#27AE60' }}>✓</div>
                    <div style={styles.timelineContent}>
                      <p style={styles.timelineTitle}>Laporan Dikirim (Submitted)</p>
                      <p style={styles.timelineDesc}>Bukti terenkripsi berhasil dicatat ke blockchain oleh Anda.</p>
                    </div>
                  </div>

                  <div style={styles.timelineItem}>
                    <div style={{ 
                        ...styles.timelineDot, 
                        background: selectedReport.status >= 1 ? '#27AE60' : '#333',
                        color: selectedReport.status >= 1 ? '#fff' : '#888' 
                      }}>
                      {selectedReport.status >= 1 ? '✓' : '2'}
                    </div>
                    <div style={styles.timelineContent}>
                      <p style={{ ...styles.timelineTitle, color: selectedReport.status >= 1 ? '#fff' : '#666' }}>Sedang Diproses (Under Investigation)</p>
                      <p style={styles.timelineDesc}>Satgas PPKS sedang memverifikasi bukti-bukti fisik dan memproses aduan.</p>
                    </div>
                  </div>

                  <div style={styles.timelineItem}>
                    <div style={{ 
                        ...styles.timelineDot, 
                        background: selectedReport.status === 2 ? '#27AE60' : '#333',
                        color: selectedReport.status === 2 ? '#fff' : '#888' 
                      }}>
                      {selectedReport.status === 2 ? '✓' : '3'}
                    </div>
                    <div style={styles.timelineContent}>
                      <p style={{ ...styles.timelineTitle, color: selectedReport.status === 2 ? '#fff' : '#666' }}>Kasus Selesai (Resolved)</p>
                      <p style={styles.timelineDesc}>Aduan selesai ditangani dan diambil tindakan penyelesaian formal.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bagian 2: Dekripsi Laporan */}
              <div style={styles.decryptSection}>
                <div style={styles.ownerBanner}>
                  <span>🔑 <strong>Proses Dekripsi Aktif.</strong> Sistem menarik kunci Anda dari blockchain untuk membuka bukti ini...</span>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <EvidenceViewer 
                    ipfsHash={selectedReport.ipfsHash} 
                    fileType={selectedReport.fileType} 
                    encryptionKey={selectedReport.encryptionKey} 
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '60px 40px', maxWidth: '900px', margin: '0 auto' },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px'
  },
  reportCard: {
    background: 'var(--card-bg)',
    border: '1px solid var(--border-white)',
    borderRadius: '16px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardBody: {
    paddingTop: '10px',
    borderTop: '1px dashed rgba(255,255,255,0.1)'
  },
  cardFooter: {
    marginTop: 'auto',
    textAlign: 'right'
  },
  resultWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'left',
    padding: 0,
    width: 'fit-content'
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
    paddingLeft: '20px'
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
    background: 'var(--card-bg)',
    border: '1px dashed rgba(255, 255, 255, 0.2)',
    padding: '50px 30px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
  },
  spinner: {
    width: '30px',
    height: '30px',
    border: '3px solid rgba(255,255,255,0.1)',
    borderTop: '3px solid #FFFF2E',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 15px'
  }
};

// Menambahkan hover effect untuk kartu laporan
if (typeof document !== 'undefined') {
  const styleId = 'report-card-hover';
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.innerText = `
      .report-card-item:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(77, 108, 250, 0.15);
        border-color: rgba(77, 108, 250, 0.4) !important;
      }
    `;
    document.head.appendChild(styleSheet);
  }
}

export default StatusLaporan;