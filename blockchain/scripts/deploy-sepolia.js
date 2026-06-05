const hre = require("hardhat");

async function main() {
  console.log("Mulai deployment ke jaringan Sepolia");

  const EvidenceSystem = await hre.ethers.getContractFactory("EvidenceSystem");
  const contract = await EvidenceSystem.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("Smart Contract sukses ditanam");
  console.log("Alamat Contract:", address);

  // jeda 30 detik agar blok di jaringan sepolia selesai tercatat
  console.log("tunggu 30 detik sebelum verifikasi otomatis ke etherscan");
  await new Promise(resolve => setTimeout(resolve, 30000)); 

  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("Verifikasi Etherscan Sukses");
  } catch (error) {
    console.error("Gagal verifikasi:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});