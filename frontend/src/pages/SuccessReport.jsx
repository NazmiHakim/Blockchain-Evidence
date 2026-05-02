import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessReport = () => {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <h1 style={{ fontSize: '64px' }}>✨</h1>
      <h1 style={{ color: '#FFFF2E' }}>Laporan Berhasil Tersimpan!</h1>
      <p style={{ color: '#aaa' }}>Laporan Anda telah terkunci secara permanen di Blockchain Sepolia.</p>
      <div style={{ background: '#111', padding: '20px', borderRadius: '12px', display: 'inline-block', marginTop: '20px' }}>
        <p>ID Laporan: <strong>#0048</strong></p>
        <p style={{ fontSize: '12px' }}>Tx Hash: 0x823...9281</p>
      </div>
      <div style={{ marginTop: '40px' }}>
        <button className="btn-pijar" onClick={() => navigate('/status')}>Cek Status</button>
      </div>
    </div>
  );
};

export default SuccessReport;