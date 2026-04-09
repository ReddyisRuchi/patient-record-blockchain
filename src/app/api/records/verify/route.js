import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { getContract } from "@/lib/blockchain";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Record ID is required" }, { status: 400 });
    }

    const record = await prisma.patientRecord.findUnique({
      where: { id: Number(id) },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Recompute hash using exact same serialization as create route
    const serialized = JSON.stringify({
      id: record.id,
      patientId: record.patientId,
      diagnosis: record.diagnosis,
      symptoms: record.symptoms,
      prescription: record.prescription,
      severity: record.severity,
      followUp: record.followUp,
      department: record.department,
      visitType: record.visitType,
      createdAt: record.createdAt,
    });

    const currentHash = crypto.createHash("sha256").update(serialized).digest("hex");

    // Primary: compare against blockchainHash stored in DB
    // (saved immediately after on-chain store, so it's the ground truth)
    const storedHash = record.blockchainHash;


    // Secondary: also try fetching from chain if available
    let onChainHash = storedHash;
    try {
      const contract = await getContract();
      const chainResult = await contract.getRecord(Number(id));
      // getRecord returns (string recordHash, uint256 timestamp)
      const chainHash = chainResult[0];
      if (chainHash && chainHash !== "") {
        onChainHash = chainHash;
      }
    } catch (err) {
      // blockchain unavailable — fall back to DB stored hash
    }

    const valid = Boolean(onChainHash) && currentHash === onChainHash;

    return NextResponse.json({ valid, currentHash, onChainHash: onChainHash || null });

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
