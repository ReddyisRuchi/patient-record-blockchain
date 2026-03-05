import { ethers } from "ethers";
import contractABI from "../abi/MedicalRecord.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Hardhat account #0 private key
const privateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const wallet = new ethers.Wallet(privateKey, provider);

const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

export async function storeRecordHash(recordId, recordHash) {
  const tx = await contract.storeRecord(recordId, recordHash);
  await tx.wait();
  return tx.hash;
}

export async function getRecordHash(recordId) {
  const result = await contract.getRecord(recordId);
  return {
    hash: result[0],
    timestamp: result[1],
  };
}