const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Sistem Pencatatan Bukti Awal Kekerasan Seksual (EvidenceSystem)", function () {
  let EvidenceSystem, evidenceSystem, admin, addr1, addr2;

  // Kode di dalam beforeEach akan dijalankan sebelum setiap test dimulai
  beforeEach(async function () {
    // Mendapatkan beberapa akun wallet palsu dari jaringan lokal Hardhat
    [admin, addr1, addr2] = await ethers.getSigners();
    
    // Membaca kontrak dan mendeploynya ke memori lokal
    EvidenceSystem = await ethers.getContractFactory("EvidenceSystem");
    evidenceSystem = await EvidenceSystem.deploy();
  });

  // Test 1: Mengecek apakah deployer otomatis menjadi admin
  it("Harus mendeploy dengan admin yang benar (Akun deployer)", async function () {
    expect(await evidenceSystem.admin()).to.equal(admin.address);
  });

  // Test 2: Mengecek fungsi pelaporan pelapor
  it("Pelapor dapat mengirim laporan baru dan mendapatkan ID 1", async function () {
    // addr1 bertindak sebagai pelapor
    await evidenceSystem.connect(addr1).submitReport("QmHashIPFSPinata123", "image", "KeyRahasiaAES256");
    
    // Ambil laporan ber-ID 1
    const report = await evidenceSystem.reports(1);
    
    expect(report.reporter).to.equal(addr1.address);
    expect(report.ipfsHash).to.equal("QmHashIPFSPinata123");
    expect(report.fileType).to.equal("image");
    expect(report.encryptionKey).to.equal("KeyRahasiaAES256");
    expect(report.status).to.equal(0); // 0 merepresentasikan enum Status.Submitted
  });

  // Test 3: Mengecek whitelist role Satgas
  it("Admin dapat menambahkan akun Satgas ke dalam whitelist", async function () {
    // Admin memasukkan addr2 sebagai Satgas
    await evidenceSystem.whitelistSatgas(addr2.address, true);
    
    // Cek apakah addr2 benar-benar sudah jadi Satgas
    expect(await evidenceSystem.isSatgas(addr2.address)).to.equal(true);
  });

  // Test 4: Mengecek proses update status oleh Satgas
  it("Hanya anggota Satgas resmi yang dapat memperbarui status laporan", async function () {
    // Jadikan addr2 sebagai Satgas terlebih dahulu
    await evidenceSystem.whitelistSatgas(addr2.address, true);
    
    // addr1 bikin laporan
    await evidenceSystem.connect(addr1).submitReport("QmHash123", "video", "KeyAES");

    // addr2 (Satgas) mengubah status laporan ber-ID 1 menjadi UnderInvestigation (angka 1)
    await evidenceSystem.connect(addr2).updateStatus(1, 1);
    
    const report = await evidenceSystem.reports(1);
    expect(report.status).to.equal(1); // 1 = Status.UnderInvestigation
  });

  // Test 5: Pengecekan keamanan (Edge case / pembatasan akses)
  it("Transaksi harus gagal (Revert) jika bukan Satgas yang memperbarui status", async function () {
    // addr1 bikin laporan
    await evidenceSystem.connect(addr1).submitReport("QmHash123", "audio", "KeyAES");
    
    // addr1 (Bukan Satgas) mencoba secara ilegal mengubah status laporannya sendiri
    await expect(
      evidenceSystem.connect(addr1).updateStatus(1, 2) // 2 = Status.Resolved
    ).to.be.revertedWith("Bukan anggota Satgas");
  });
});