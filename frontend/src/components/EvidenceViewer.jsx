import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { decryptFile } from '../utils/encryption';

const EvidenceViewer = ({ ipfsHash, fileType, encryptionKey }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceName, setEvidenceName] = useState('');

  useEffect(() => {
    let active = true;

    const fetchAndDecryptData = async () => {
      if (!ipfsHash || !encryptionKey) {
        setError('CID IPFS atau Kunci Enkripsi tidak valid.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        // Daftar Gateway IPFS untuk Fallback (Meningkatkan keandalan)
        const gateways = [
          `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
          `https://ipfs.io/ipfs/${ipfsHash}`,
          `https://dweb.link/ipfs/${ipfsHash}`,
          `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`
        ];

        let metadataRes = null;
        let activeGateway = null;

        // 1. Download & Dekripsi Metadata dengan Fallback Gateway
        for (const gateway of gateways) {
          try {
            metadataRes = await axios.get(`${gateway}/metadata.json.enc`, {
              responseType: 'arraybuffer',
              timeout: 15000 // 15 detik per gateway
            });
            activeGateway = gateway; // Simpan gateway yang berhasil
            break; // Keluar dari loop jika berhasil
          } catch (err) {
            console.warn(`Gateway ${gateway} gagal atau timeout, mencoba gateway berikutnya...`);
          }
        }

        if (!metadataRes) {
          throw new Error("Gagal mendownload dari semua IPFS Gateway. Mohon tunggu beberapa detik hingga IPFS menyinkronkan file Anda, lalu Refresh.");
        }

        let metadataObj = null;
        try {
          const decryptedMetadataBuffer = await decryptFile(metadataRes.data, encryptionKey);
          const decoder = new TextDecoder('utf-8');
          const metadataText = decoder.decode(decryptedMetadataBuffer);
          metadataObj = JSON.parse(metadataText);
          
          if (active) {
            setMetadata(metadataObj);
            setEvidenceName(metadataObj.fileName);
          }
        } catch (metaErr) {
          console.error("Gagal mendekripsi metadata:", metaErr);
          throw new Error("Gagal mendekripsi. Pastikan kunci enkripsi sesuai. Error: " + metaErr.message);
        }

        // 2. Download & Dekripsi File Bukti menggunakan Active Gateway yang sudah terbukti cepat
        if (metadataObj && metadataObj.fileName && activeGateway) {
          try {
            const fileNameEncoded = encodeURIComponent(`${metadataObj.fileName}.enc`);
            const fileRes = await axios.get(`${activeGateway}/${fileNameEncoded}`, {
              responseType: 'arraybuffer',
              timeout: 45000 // 45s timeout untuk file bukti yang mungkin besar
            });

            const decryptedFileBuffer = await decryptFile(fileRes.data, encryptionKey);
            const decryptedBlob = new Blob([decryptedFileBuffer], { type: fileType || 'application/octet-stream' });
            const blobUrl = URL.createObjectURL(decryptedBlob);

            if (active) {
              setEvidenceUrl(blobUrl);
            }
          } catch (fileErr) {
            console.error("Gagal mendownload/mendekripsi file bukti:", fileErr);
            throw new Error(`Gagal mendekripsi file bukti pendukung. Detail: ${fileErr.message || String(fileErr)}`);
          }
        }

        if (active) setLoading(false);
      } catch (err) {
        if (active) {
          setError(err.message || 'Terjadi kesalahan saat memproses data terenkripsi.');
          setLoading(false);
        }
      }
    };

    fetchAndDecryptData();

    return () => {
      active = false;
      // Cleanup object URL untuk mencegah kebocoran memori
      if (evidenceUrl) {
        URL.revokeObjectURL(evidenceUrl);
      }
    };
  }, [ipfsHash, fileType, encryptionKey]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '15px', color: '#ccc' }}>Mendownload & mendekripsi bukti aman (AES-256)...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={{ color: '#ff4d4d', fontWeight: 'bold' }}>⚠️ Gagal Membuka Bukti</p>
        <p style={{ color: '#aaa', fontSize: '14px', marginTop: '5px' }}>{error}</p>
      </div>
    );
  }

  // Helper untuk merender file bukti berdasarkan tipenya
  const renderEvidence = () => {
    if (!evidenceUrl) return null;

    const lowerType = (fileType || '').toLowerCase();

    if (lowerType.startsWith('image/')) {
      return (
        <div style={styles.mediaWrapper}>
          <img src={evidenceUrl} alt="Bukti Kasus" style={styles.image} />
          <p style={styles.fileNameText}>📄 {evidenceName}</p>
          <a href={evidenceUrl} download={evidenceName} className="btn-pijar" style={styles.downloadBtn}>
            Unduh Gambar Asli
          </a>
        </div>
      );
    }

    if (lowerType.startsWith('video/')) {
      return (
        <div style={styles.mediaWrapper}>
          <video src={evidenceUrl} controls style={styles.video} />
          <p style={styles.fileNameText}>🎥 {evidenceName}</p>
          <a href={evidenceUrl} download={evidenceName} className="btn-pijar" style={styles.downloadBtn}>
            Unduh Video Asli
          </a>
        </div>
      );
    }

    if (lowerType.startsWith('audio/')) {
      return (
        <div style={styles.mediaWrapper}>
          <audio src={evidenceUrl} controls style={styles.audio} />
          <p style={styles.fileNameText}>🎵 {evidenceName}</p>
          <a href={evidenceUrl} download={evidenceName} className="btn-pijar" style={styles.downloadBtn}>
            Unduh Audio Asli
          </a>
        </div>
      );
    }

    // Default untuk dokumen (PDF, Word, dll)
    return (
      <div style={styles.docWrapper}>
        <div style={styles.docIcon}>📄</div>
        <h4 style={{ margin: '10px 0' }}>Dokumen Bukti</h4>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>{evidenceName}</p>
        <a href={evidenceUrl} download={evidenceName} className="btn-pijar" style={{ padding: '12px 30px' }}>
          Unduh & Buka Dokumen
        </a>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {metadata && (
        <div style={styles.metadataSection}>
          <h2 style={{ color: '#FFFF2E', fontSize: '22px', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: 0 }}>
            📝 Detail Kronologi (Terdekripsi)
          </h2>
          <div style={styles.metaGrid}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Waktu Kejadian</span>
              <span style={styles.metaValue}>
                {metadata.tanggal ? new Date(metadata.tanggal).toLocaleString('id-ID', {
                  dateStyle: 'long',
                  timeStyle: 'short'
                }) : '-'}
              </span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Lokasi</span>
              <span style={styles.metaValue}>{metadata.lokasi || '-'}</span>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <span style={styles.metaLabel}>Kronologi Lengkap</span>
            <p style={styles.chronologyText}>{metadata.kronologi}</p>
          </div>
        </div>
      )}

      <div style={styles.evidenceSection}>
        <h2 style={{ color: '#FFFF2E', fontSize: '22px', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: 0 }}>
          📁 File Bukti Fisik (Terdekripsi)
        </h2>
        {renderEvidence()}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    width: '100%'
  },
  metadataSection: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '16px',
    padding: '25px',
    textAlign: 'left'
  },
  evidenceSection: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '16px',
    padding: '25px',
    textAlign: 'left'
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginTop: '15px'
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  metaLabel: {
    color: '#666',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  metaValue: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600'
  },
  chronologyText: {
    color: '#ddd',
    lineHeight: '1.8',
    fontSize: '15px',
    background: 'rgba(0,0,0,0.2)',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '5px',
    whiteSpace: 'pre-wrap'
  },
  mediaWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20px',
    gap: '15px'
  },
  image: {
    maxWidth: '100%',
    maxHeight: '450px',
    borderRadius: '12px',
    border: '2px solid rgba(255,255,255,0.1)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
  },
  video: {
    width: '100%',
    maxHeight: '400px',
    borderRadius: '12px',
    border: '2px solid rgba(255,255,255,0.1)'
  },
  audio: {
    width: '100%',
    marginTop: '10px'
  },
  docWrapper: {
    textAlign: 'center',
    padding: '40px 20px',
    border: '2px dashed rgba(255,255,255,0.1)',
    borderRadius: '12px',
    marginTop: '20px'
  },
  docIcon: {
    fontSize: '48px',
    color: '#FFFF2E'
  },
  fileNameText: {
    color: '#aaa',
    fontSize: '14px',
    margin: '5px 0'
  },
  downloadBtn: {
    padding: '10px 25px',
    fontSize: '13px',
    textDecoration: 'none'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 255, 46, 0.1)',
    borderTop: '4px solid #FFFF2E',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    background: 'rgba(255,77,77,0.05)',
    border: '1px solid rgba(255,77,77,0.2)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    margin: '20px 0'
  }
};

// Menyuntikkan keyframes spinner ke dokumen secara dinamis jika belum ada
if (typeof document !== 'undefined') {
  const styleId = 'evidence-viewer-spin-style';
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.innerText = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);
  }
}

export default EvidenceViewer;
