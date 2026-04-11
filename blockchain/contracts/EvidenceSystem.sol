// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EvidenceSystem
 * @dev Sistem Pencatatan Bukti Awal Kekerasan Seksual Berbasis Blockchain (Satgas PPKS)
 */
contract EvidenceSystem {
    enum Status { Submitted, UnderInvestigation, Resolved }

    struct Report {
        uint256 id;
        address reporter;
        string ipfsHash;
        uint256 timestamp;
        Status status;
    }

    uint256 public nextReportId = 1;
    address public admin;
    
    mapping(uint256 => Report) public reports;
    mapping(address => bool) public isSatgas;
    mapping(address => uint256[]) public reporterToReports;

    event ReportSubmitted(uint256 indexed id, address indexed reporter, string ipfsHash);
    event StatusUpdated(uint256 indexed id, Status newStatus);
    event SatgasWhitelisted(address indexed member, bool status);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier onlySatgas() {
        require(isSatgas[msg.sender], "Only whitelisted Satgas can call this");
        _;
    }

    constructor() {
        admin = msg.sender;
        isSatgas[msg.sender] = true; // Admin is first Satgas
    }

    function whitelistSatgas(address _member, bool _status) external onlyAdmin {
        isSatgas[_member] = _status;
        emit SatgasWhitelisted(_member, _status);
    }

    function submitReport(string calldata _ipfsHash) external returns (uint256) {
        uint256 reportId = nextReportId++;
        
        Report memory newReport = Report({
            id: reportId,
            reporter: msg.sender,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            status: Status.Submitted
        });

        reports[reportId] = newReport;
        reporterToReports[msg.sender].push(reportId);

        emit ReportSubmitted(reportId, msg.sender, _ipfsHash);
        return reportId;
    }

    function updateStatus(uint256 _id, Status _newStatus) external onlySatgas {
        require(reports[_id].id != 0, "Report does not exist");
        reports[_id].status = _newStatus;
        
        emit StatusUpdated(_id, _newStatus);
    }

    function getMyReports() external view returns (uint256[] memory) {
        return reporterToReports[msg.sender];
    }
}
