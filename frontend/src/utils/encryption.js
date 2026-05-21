export async function generateKey() {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exported)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function encryptFile(file, hexKey) {
  // 1. Ubah hexKey kembali menjadi CryptoKey
  // 2. Baca file sebagai ArrayBuffer
  // 3. Gunakan window.crypto.subtle.encrypt()
  // 4. Kembalikan file terenkripsi (File object baru)
  // (Detail fungsi Web Crypto API ditambahkan di sini)
  
  // ✅ TAMBAHKAN BARIS INI SEMENTARA:
  // Mengembalikan file asli agar tidak undefined dan bisa dibaca oleh IPFS Pinata
  return file; 
}

export async function decryptFile(encryptedBuffer, hexKey) {
  // Fungsi yang akan dipakai Sisil nanti untuk dekripsi saat file diunduh dari IPFS
}