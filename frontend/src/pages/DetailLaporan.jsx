import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/config';
import EvidenceViewer from '../components/EvidenceViewer';

const DetailLaporan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { signer, isSatgas } = useWallet();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [newStatus, setNewStatus] = useState(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Proteksi halaman: pastikan user terhubung dan merupakan Satgas PPKS
    if (!isSatgas) {
      navigate('/403');
      return;
    }

    const fetchReport = async () => {
      setLoading(true);
      setError('');
      try {
        if (!window.ethereum) {
          throw new Error('MetaMask belum terpasang.');
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        const reportId = BigInt(id);
        const rawReport = await contract.reports(reportId);

        if (rawReport.reporter === ethers.ZeroAddress) {
          throw new Error(`Laporan dengan ID #${id} tidak ditemukan.`);
        }

        const formatted = {
          id: Number(rawReport.id),
          reporter: rawReport.reporter,
          ipfsHash: rawReport.ipfsHash,
          fileType: rawReport.fileType,
          encryptionKey: rawReport.encryptionKey,
          timestamp: Number(rawReport.timestamp),
          status: Number(rawReport.status)
        };

        setReport(formatted);
        setNewStatus(formatted.status);
      } catch (err) {
        console.error("Gagal mengambil detail laporan:", err);
        setError(err.message || 'Gagal membaca data laporan dari blockchain.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, isSatgas, navigate]);

  const handleUpdateStatus = async () => {
    if (!signer) {
      alert("Hubungkan wallet MetaMask terlebih dahulu.");
      return;
    }

    setUpdating(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.updateStatus(BigInt(id), Number(newStatus));
      
      // Tunggu konfirmasi transaksi blockchain
      await tx.wait();
      
      alert("Status laporan berhasil diperbarui!");
      // Perbarui state lokal
      setReport(prev => prev ? { ...prev, status: Number(newStatus) } : null);
    } catch (err) {
      console.error("Gagal memperbarui status laporan:", err);
      if (err.code === 4001) {
        alert("Pembaruan status dibatalkan di MetaMask.");
      } else {
        alert("Gagal memperbarui status: " + (err.reason || err.message));
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '15px' }}>Mengambil informasi kasus dari blockchain...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h3 style={{ color: '#ff4d4d' }}>⚠️ Detail Kasus Gagal Dimuat</h3>
        <p style={{ color: '#ccc' }}>{error}</p>
        <Link to="/satgas" className="btn-pijar" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h3 style={{ color: '#888', margin: 0 }}>
          <Link to="/satgas" style={{ color: '#888', textDecoration: 'none' }}>Dashboard</Link> / 
          <span style={{ color: 'var(--royal-blue)' }}> Detail Laporan #{id}</span>
        </h3>
        <Link to="/satgas" className="btn-pijar" style={{ padding: '8px 20px', fontSize: '13px', textDecoration: 'none' }}>
          ← Kembali
        </Link>
      </div>

      <div style={styles.container}>
        <div style={styles.content}>
          {report && (
            <EvidenceViewer 
              ipfsHash={report.ipfsHash} 
              fileType={report.fileType} 
              encryptionKey={report.encryptionKey} 
            />
          )}
        </div>

        <div style={styles.sidebar}>
          <h4 style={{ margin: '0 0 20px', color: '#FFFF2E', fontSize: '18px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
            ⚙️ Panel Penanganan
          </h4>
          
          <p style={{ margin: '0 0 8px', color: '#888', fontSize: '13px' }}>ALAMAT PELAPOR (PSEUDONIM)</p>
          <code style={styles.code}>{report?.reporter}</code>

          <p style={{ margin: '20px 0 8px', color: '#888', fontSize: '13px' }}>STATUS KASUS SAAT INI</p>
          <select 
            style={styles.select} 
            value={newStatus} 
            onChange={(e) => setNewStatus(Number(e.target.value))}
            disabled={updating}
          >
            <option value={0}>Submitted</option>
            <option value={1}>Under Investigation</option>
            <option value={2}>Resolved</option>
          </select>
          
          <button 
            className="btn-pijar" 
            style={{ width: '100%', marginTop: '25px', padding: '15px', opacity: updating ? 0.7 : 1 }}
            onClick={handleUpdateStatus}
            disabled={updating}
          >
            {updating ? 'Memperbarui di Blockchain...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginTop: '20px' },
  content: { background: 'var(--card-bg)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-white)' },
  sidebar: { background: 'var(--card-bg)', padding: '30px', borderRadius: '16px', height: 'fit-content', border: '1px solid var(--border-white)' },
  select: { 
    width: '100%', 
    padding: '12px', 
    background: '#050510', 
    color: '#fff', 
    borderRadius: '8px', 
    border: '1px solid #333',
    fontSize: '14px',
    outline: 'none'
  },
  code: {
    background: 'rgba(0,0,0,0.4)',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #222',
    color: '#4D6CFA',
    fontSize: '12px',
    display: 'block',
    wordBreak: 'break-all',
    marginBottom: '15px'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '100px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ccc'
  },
  spinner: {
    width: '45px',
    height: '45px',
    border: '4px solid rgba(255, 255, 46, 0.1)',
    borderTop: '4px solid #FFFF2E',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '80px 20px',
    maxWidth: '600px',
    margin: '0 auto'
  }
};

export default DetailLaporan;