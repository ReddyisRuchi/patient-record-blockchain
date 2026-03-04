import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getContract } from "@/lib/blockchain";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("recordId");

    if (!recordId) {
      return NextResponse.json({ error: "recordId required" }, { status: 400 });
    }

    const record = await prisma.patientRecord.findUnique({
      where: { id: Number(recordId) },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // ✅ IMPORTANT: await here
    const contract = await getContract();

    const [onChainHash] = await contract.getRecord(record.id);

    const isValid = record.blockchainHash === onChainHash;

    return NextResponse.json({
      dbHash: record.blockchainHash,
      onChainHash,
      verified: isValid,
    });

  } catch (err) {
    console.error("Verification Error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}