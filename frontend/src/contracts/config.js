export const CONTRACT_ADDRESS = '0x_ALAMAT_KONTRAK_DARI_ARJUN'; // Sesuaikan alamatnya

export const CONTRACT_ABI = [
  "function submitReport(string calldata _ipfsHash, string calldata _fileType, string calldata _encryptionKey) external returns (uint256)",
  "function isSatgas(address) external view returns (bool)"
  // Tambahkan fungsi lain sesuai ABI dari Arjun
];