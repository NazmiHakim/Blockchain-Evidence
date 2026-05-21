import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/config'; // Sesuaikan path jika berbeda
import { generateKey, encryptFile } from '../utils/encryption'; // Sesuaikan path
import { uploadToIPFS } from '../utils/ipfs'; // Sesuaikan path

const Lapor = () => {
  // Mengambil state signer dari WalletContext
  const { signer } = useWallet();

  // Local state untuk form
  const [tanggal, setTanggal] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [kronologi, setKronologi] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'
  const [error, setError] = useState('');

  // Handle saat user memilih file
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(''); // Reset error kalau ada
    }
  };

  const handleFormSubmit = async () => {
    // Validasi awal
    if (!signer) {
      setError("Hubungkan wallet MetaMask terlebih dahulu.");
      return;
    }
    if (!tanggal || !lokasi || !kronologi) {
      setError("Semua field teks (tanggal, lokasi, kronologi) wajib diisi!");
      return;
    }
    if (!file) {
      setError("Pilih file bukti terlebih dahulu!");
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
      // Mengunggah file bukti terenkripsi dan metadata terenkripsi dalam satu bundel folder
      const cid = await uploadToIPFS([encryptedFile, encryptedMetadata]);
      
      // 3. Kirim ke Smart Contract via ethers.js
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const fileType = file.type || 'application/octet-stream';

      // Memanggil fungsi kontrak yang akan memicu popup MetaMask
      const tx = await contract.submitReport(cid, fileType, encryptionKey);
      
      // Menunggu konfirmasi jaringan
      await tx.wait(); 

      alert("Laporan berhasil dikirim ke blockchain!");
      setStatus('success');
      
      // Reset form setelah sukses
      setTanggal('');
      setLokasi('');
      setKronologi('');
      setFile(null); 
      
    } catch (err) {
      console.error("Gagal mengirim laporan:", err);
      // Penanganan error sesuai instruksi dari panduan integration
      if (err.code === 4001) {
        // Kode 4001 = user reject di MetaMask
        setError('Kamu membatalkan transaksi di MetaMask.');
      } else if (err.message?.includes('network')) {
        setError('Koneksi bermasalah. Cek internet dan coba lagi.');
      } else {
        setError('Terjadi kesalahan: ' + (err.reason || err.message));
      }
      setStatus('idle');
    }
  };

  return (
    <div style={{ padding: '60px 120px' }}>
      <p style={{ color: 'var(--royal-blue)', fontWeight: 'bold', fontSize: '14px' }}>FORMULIR AMAN</p>
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

          <div style={styles.uploadArea}>
             <input 
               type="file" 
               onChange={handleFileChange}
               style={{ marginBottom: '10px', color: '#fff' }}
             />
             <p style={{ margin: '10px 0 5px' }}>
               {file ? `✅ ${file.name} terpilih` : '📤 Pilih file bukti dari perangkat Anda'}
             </p>
             <span style={{ color: '#555', fontSize: '12px' }}>Bukti Anda akan langsung dienkripsi sebelum masuk ke IPFS</span>
          </div>

          {/* Menampilkan pesan error jika ada */}
          {error && <p style={{ color: '#ff4d4d', marginTop: '15px', fontSize: '14px' }}>❌ {error}</p>}

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
  inputGroup: {
    marginBottom: '20px'
  },
  uploadArea: {
    border: '2px dashed #333',
    padding: '40px',
    textAlign: 'center',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.01)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  pijarBox: {
    background: 'rgba(77, 108, 250, 0.05)',
    padding: '30px',
    borderRadius: '20px',
    border: '1px solid rgba(77, 108, 250, 0.2)'
  }
};

export default Lapor;