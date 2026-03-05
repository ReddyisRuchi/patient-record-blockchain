import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import crypto from "crypto";

let contractInstance = null;

async function bootstrap() {
  if (contractInstance) return contractInstance;

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner(0);

  const artifactPath = path.join(
    process.cwd(),
    "artifacts",
    "contracts",
    "MedicalRecord.sol",
    "MedicalRecord.json"
  );

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    signer
  );

  // 🚀 1️⃣ Deploy contract
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  contractInstance = contract;

  console.log("Contract deployed at:", await contract.getAddress());

  // 🚀 2️⃣ SYNC DATABASE RECORDS TO BLOCKCHAIN
  const records = await prisma.patientRecord.findMany();

  for (const record of records) {
    const serialized = JSON.stringify({
      id: record.id,
      patientId: record.patientId,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      createdAt: record.createdAt,
    });

    const hash = crypto
      .createHash("sha256")
      .update(serialized)
      .digest("hex");

    const tx = await contract.storeRecord(record.id, hash);
    await tx.wait();
  }

  console.log("Synced records:", records.length);

  return contractInstance;
}

export async function getContract() {
  if (!contractInstance) {
    await bootstrap();
  }
  return contractInstance;
}