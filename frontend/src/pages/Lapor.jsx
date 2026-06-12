import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/config';
import { generateKey, encryptFile } from '../utils/encryption';
import { uploadToIPFS } from '../utils/ipfs';

const Lapor = () => {
  const navigate = useNavigate();
  const { account, signer } = useWallet();
  const fileInputRef = useRef(null);

  // Local state untuk form
  const [tanggal, setTanggal] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [kronologi, setKronologi] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'
  const [error, setError] = useState('');

  // Handle Drag and Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  const handleFormSubmit = async () => {
    // Validasi awal
    if (!signer) {
      setError("Hubungkan wallet MetaMask terlebih dahulu.");
      return;
    }
    if (!tanggal || !lokasi || !kronologi.trim()) {
      setError("Semua field teks (tanggal, lokasi, kronologi) wajib diisi!");
      return;
    }
    if (!file) {
      setError("Pilih file bukti terlebih dahulu!");
      return;
    }
    if (!termsAgreed) {
      setError("Anda harus menyetujui persyaratan sebelum mensubmit laporan.");
      return;
    }

    setStatus('loading');
    setError('');

    try {
      // 1. Generate Kunci & Enkripsi (Web Crypto API)
      const encryptionKey = await generateKey();
      
      // Enkripsi file bukti
      const encryptedFile = await encryptFile(file, encryptionKey);
      
      // Enkripsi file teks metadata (tanggal, lokasi, kronologi)
      const metadata = {
        tanggal,
        lokasi,
        kronologi,
        fileName: file.name
      };
      const metadataJson = JSON.stringify(metadata, null, 2);
      const metadataFile = new File([metadataJson], 'metadata.json', { type: 'application/json' });
      const encryptedMetadata = await encryptFile(metadataFile, encryptionKey);
      
      // 2. Upload ke Pinata / IPFS (Axios)
      const cid = await uploadToIPFS([encryptedMetadata, encryptedFile]);
      
      // 3. Kirim ke Smart Contract via ethers.js
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const fileType = file.type || 'application/octet-stream';

      const tx = await contract.submitReport(cid, fileType, encryptionKey);
      await tx.wait(); 

      const count = await contract.getReportCount();
      const reportId = Number(count);
      const txHash = tx.hash;

      setStatus('success');
      
      setTanggal('');
      setLokasi('');
      setKronologi('');
      setFile(null); 
      setTermsAgreed(false);

      navigate('/success', { state: { reportId, txHash } });
      
    } catch (err) {
      console.error("Gagal mengirim laporan:", err);
      if (err.code === 4001) {
        setError('Kamu membatalkan transaksi di MetaMask.');
      } else if (err.message?.includes('network')) {
        setError('Koneksi bermasalah. Cek internet dan coba lagi.');
      } else {
        setError('Terjadi kesalahan: ' + (err.reason || err.message));
      }
      setStatus('idle');
    }
  };

  if (!account) {
    return (
      <div style={{ padding: '120px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🦊</div>
        <h2 style={{ fontSize: '32px', marginBottom: '15px' }}>Hubungkan Wallet Anda</h2>
        <p style={{ color: '#aaa', fontSize: '16px', maxWidth: '500px', margin: '0 auto 30px', lineHeight: '1.6' }}>
          Untuk memastikan anonimitas dan keamanan identitas Anda, laporan hanya dapat dibuat dan ditandatangani melalui Web3 Wallet (MetaMask). 
          Silakan klik tombol <b>Connect Wallet</b> di menu atas untuk memulai.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 120px' }}>
      <p style={{ color: 'var(--royal-blue)', fontWeight: 'bold', fontSize: '14px' }}>FORMULIR</p>
      <h1 style={{ fontSize: '40px', marginBottom: '40px' }}>Rekam Kejadian Anda</h1>
      
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Kapan kejadian ini terjadi?</label>
            <input 
              type="datetime-local" 
              style={styles.input} 
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Di mana lokasi kejadian?</label>
            <input 
              type="text" 
              placeholder="Gedung, Ruangan, atau Area..." 
              style={styles.input} 
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Ceritakan kronologi lengkap</label>
            <textarea 
              rows="6" 
              style={styles.input} 
              placeholder="Kejadian ini dimulai saat..."
              value={kronologi}
              onChange={(e) => setKronologi(e.target.value)}
            ></textarea>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Lampirkan Bukti (Foto/Video/Audio)</label>
            <div 
              style={{
                ...styles.uploadArea,
                borderColor: isDragging ? '#4D6CFA' : '#333',
                background: isDragging ? 'rgba(77, 108, 250, 0.05)' : 'rgba(255,255,255,0.01)'
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div style={styles.uploadIcon}>
                {file ? '📄' : '📤'}
              </div>
              <p style={{ margin: '10px 0 5px', fontSize: '16px', fontWeight: 'bold' }}>
                {file ? file.name : 'Seret & Lepas file ke sini, atau klik untuk memilih'}
              </p>
              <span style={{ color: '#888', fontSize: '13px' }}>
                {file ? `Ukuran: ${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Maks. 50MB (JPG, PNG, MP4, PDF)'}
              </span>
            </div>
            <span style={{ display: 'block', marginTop: '10px', color: '#555', fontSize: '12px' }}>
              *File bukti Anda akan dienkripsi secara lokal di browser sebelum diunggah ke IPFS.
            </span>
          </div>

          {/* Syarat dan Ketentuan Validation */}
          <div style={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              id="terms" 
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              style={styles.checkbox}
            />
            <label htmlFor="terms" style={styles.checkboxLabel}>
              Saya menyatakan bahwa laporan dan bukti yang dilampirkan adalah benar adanya, 
              dan saya setuju untuk membayar biaya transaksi Ethereum (Gas Fee) untuk menyimpan data ini secara permanen.
            </label>
          </div>

          {error && <p style={{ color: '#ff4d4d', marginTop: '15px', fontSize: '14px', fontWeight: 'bold' }}>❌ {error}</p>}

          <button 
            className="btn-pijar" 
            style={{ width: '100%', marginTop: '30px', padding: '18px', opacity: status === 'loading' ? 0.7 : 1 }}
            onClick={handleFormSubmit}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Mengenkripsi & Mengirim Transaksi...' : 'Kirim Laporan ke Blockchain'}
          </button>
        </div>

        <div style={styles.infoSide}>
          <div style={styles.pijarBox}>
            <h4 style={{ color: '#FFFF2E' }}>🛡️ Jaminan Sistem PIJAR</h4>
            <ul style={{ color: '#ccc', fontSize: '14px', lineHeight: '2' }}>
              <li>Identitas Anda tidak tersimpan di server manapun.</li>
              <li>Bukti fisik dienkripsi dengan standar militer AES-GCM.</li>
              <li>Hanya Anda dan Satgas yang memiliki akses ke bukti tersebut.</li>
              <li>Laporan terverifikasi oleh jaringan desentralisasi blockchain.</li>
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
  label: { display: 'block', marginBottom: '10px', fontSize: '14px', color: '#aaa', fontWeight: 'bold' },
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
  inputGroup: {
    marginBottom: '15px'
  },
  uploadArea: {
    border: '2px dashed',
    padding: '40px 20px',
    textAlign: 'center',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  uploadIcon: {
    fontSize: '40px',
    marginBottom: '10px'
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginTop: '25px',
    background: 'rgba(255,255,255,0.02)',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  checkbox: {
    marginTop: '4px',
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '13px',
    color: '#aaa',
    lineHeight: '1.5',
    cursor: 'pointer'
  },
  pijarBox: {
    background: 'rgba(77, 108, 250, 0.05)',
    padding: '30px',
    borderRadius: '20px',
    border: '1px solid rgba(77, 108, 250, 0.2)'
  }
};

export default Lapor;