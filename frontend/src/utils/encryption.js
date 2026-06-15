export async function generateKey() {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exported)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Mengimpor kunci dari format hex string ke CryptoKey AES-GCM
async function importKey(hexKey) {
  const rawKey = new Uint8Array(hexKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  return await window.crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptFile(file, hexKey) {
  try {
    const cryptoKey = await importKey(hexKey);
    const fileBytes = await file.arrayBuffer();

    // Generate IV 12-byte acak
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Lakukan enkripsi
    const cipherBytes = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      fileBytes
    );

    // Gabungkan IV dan data terenkripsi (IV diletakkan di 12 byte pertama)
    const resultBuffer = new Uint8Array(12 + cipherBytes.byteLength);
    resultBuffer.set(iv, 0);
    resultBuffer.set(new Uint8Array(cipherBytes), 12);

    // Mengembalikan file terenkripsi dengan nama asli dan tipe biner umum
    return new File([resultBuffer], `${file.name}.enc`, { type: 'application/octet-stream' });
  } catch (err) {
    console.error("Gagal melakukan enkripsi file:", err);
    throw err;
  }
}

export async function decryptFile(encryptedBuffer, hexKey) {
  try {
    const cryptoKey = await importKey(hexKey);

    // Ekstrak IV 12-byte pertama
    const iv = new Uint8Array(encryptedBuffer, 0, 12);

    // Ekstrak data biner terenkripsi (mulai byte ke-12)
    const cipherBytes = new Uint8Array(encryptedBuffer, 12);

    // Lakukan dekripsi
    const plainBytes = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      cipherBytes
    );

    return plainBytes; // Mengembalikan ArrayBuffer file yang terdekripsi
  } catch (err) {
    console.error("Gagal melakukan dekripsi file:", err);
    throw err;
  }
}