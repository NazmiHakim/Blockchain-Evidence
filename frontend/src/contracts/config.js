export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export const CONTRACT_ABI = [
  "function submitReport(string calldata _ipfsHash, string calldata _fileType, string calldata _encryptionKey) external returns (uint256)",
  "function isSatgas(address) external view returns (bool)",
  
  "function admin() external view returns (address)",
  "function getReportCount() external view returns (uint256)",
  "function reports(uint256) external view returns (uint256 id, address reporter, string ipfsHash, string fileType, string encryptionKey, uint256 timestamp, uint8 status)",
  "function whitelistSatgas(address _member, bool _status) external"
];