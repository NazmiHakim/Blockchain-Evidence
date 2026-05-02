import React from 'react';

const AccessDenied = () => {
  return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <h1 style={{ fontSize: '64px' }}>🚫</h1>
      <h1 style={{ color: '#ff4444' }}>Akses Ditolak</h1>
      <p>Halaman ini hanya dapat diakses oleh anggota Satgas PPKS yang terdaftar di sistem.</p>
      <button className="btn-pijar" style={{ marginTop: '20px' }} onClick={() => window.location.href = '/'}>Kembali ke Beranda</button>
    </div>
  );
};

export default AccessDenied;