// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EvidenceSystem {
    // enum untuk status laporan
    enum Status { Submitted, UnderInvestigation, Resolved }

    struct Report {
        uint256 id;
        address reporter;
        string ipfsHash;
        string fileType; 
        string encryptionKey;
        uint256 timestamp;
        Status status;
    }

    // variabelnya untuk menyimpan total laporan (digunakan sebagai ID auto-increment)
    uint256 private reportCount;

    // mapping untuk menyimpan laporan berdasarkan idnya
    mapping(uint256 => Report) public reports;

    // mapping untuk mengecek apakah sebuah wallet adalah satgas
    mapping(address => bool) public isSatgas;

    // modifier dimana hanya satgas yang bisa memanggil fungsi tertentu
    modifier onlySatgas() {
        require(isSatgas[msg.sender], "Bukan anggota Satgas");
        _;
    }

    // modifier dimana hanya admin/deployer kontrak yang bisa memanggil fungsi tertentu
    address public admin;
    modifier onlyAdmin() {
        require(msg.sender == admin, "Hanya admin yang diizinkan");
        _;
    }

    // admin yang akan mendeploy otomatis setalah kontrak pertama kali dijalankan
    constructor() {
        admin = msg.sender;
    }

    // fungsi 1 untuk pelapor mengirim laporan baru
    function submitReport(
        string calldata _ipfsHash,
        string calldata _fileType,
        string calldata _encKey
    ) external returns (uint256) {
        reportCount++;
        
        reports[reportCount] = Report({
            id: reportCount,
            reporter: msg.sender,
            ipfsHash: _ipfsHash,
            fileType: _fileType,
            encryptionKey: _encKey,
            timestamp: block.timestamp, // Menggunakan waktu dari blockchain
            status: Status.Submitted
        });

        return reportCount;
    }

    // fungsi 2 untuk satgas memperbarui status penanganan
    function updateStatus(uint256 _id, Status _status) external onlySatgas {
        require(_id > 0 && _id <= reportCount, "Laporan tidak ditemukan");
        reports[_id].status = _status;
    }

    // fungsi 3 untuk admin mendaftarkan atau mencabut akses Satgas
    function whitelistSatgas(address _member, bool _status) external onlyAdmin {
        isSatgas[_member] = _status;
    }

    // fungsi 4 untuk mendapatkan total laporan untuk frontend
    function getReportCount() external view returns (uint256) {
        return reportCount;
    }
}