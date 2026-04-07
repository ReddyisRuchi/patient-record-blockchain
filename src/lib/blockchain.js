import { ethers } from "ethers";
import fs from "fs";
import path from "path";

let contractInstance = null;

export async function getContract() {
  if (contractInstance) {
    return contractInstance;
  }

  const provider = new ethers.JsonRpcProvider(
    process.env.SEPOLIA_RPC_URL
  );

  const signer = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
  );

  const artifactPath = path.join(
    process.cwd(),
    "artifacts",
    "contracts",
    "MedicalRecord.sol",
    "MedicalRecord.json"
  );

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  const contract = new ethers.Contract(
    contractAddress,
    artifact.abi,
    signer
  );

  contractInstance = contract;

  return contractInstance;
}