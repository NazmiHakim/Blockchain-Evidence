const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Persiapkan deployment kontrak EvidenceSystem");

  // mengambil kontrak yang sudah dicompile
  const EvidenceSystem = await hre.ethers.getContractFactory("EvidenceSystem");
  
  // melakukan deploy ke jaringan
  const evidenceSystem = await EvidenceSystem.deploy();
  await evidenceSystem.waitForDeployment();

  const contractAddress = evidenceSystem.target;
  console.log(`\nEvidenceSystem berhasil dideploy ke alamat: ${contractAddress}`);

  // mengekstrak abi dan menyimpannya ke folder frontend
  const artifactsPath = path.join(__dirname, "../artifacts/contracts/EvidenceSystem.sol/EvidenceSystem.json");
  const frontendContractsPath = path.join(__dirname, "../frontend/src/contracts/EvidenceSystem.json");

  // membaca file abi bawaan hardhat
  const contractArtifact = JSON.parse(fs.readFileSync(artifactsPath, "utf8"));
  
  // menyimpan abi beserta alamat kontraknya untuk dipakai frontend
  const frontendData = {
    address: contractAddress,
    abi: contractArtifact.abi
  };

  fs.writeFileSync(
    frontendContractsPath,
    JSON.stringify(frontendData, null, 2)
  );

  console.log(`File ABI berhasil disalin ke: frontend/src/contracts/EvidenceSystem.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});