const { ethers } = require("hardhat");

async function main() {
  const MedicalRecord = await ethers.getContractFactory("MedicalRecord");
  const contract = await MedicalRecord.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("Contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});