import { ethers } from "ethers";
import MedicalRecord from "@/abi/MedicalRecord.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const RPC_URL = "http://127.0.0.1:8545";

export function getContract() {
  if (!process.env.HARDHAT_PRIVATE_KEY) {
    throw new Error("HARDHAT_PRIVATE_KEY not set in .env.local");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const wallet = new ethers.Wallet(
    process.env.HARDHAT_PRIVATE_KEY,
    provider
  );

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    MedicalRecord.abi,
    wallet
  );
}