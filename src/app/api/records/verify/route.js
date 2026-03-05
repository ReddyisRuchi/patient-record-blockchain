import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { getContract } from "@/lib/blockchain";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Record id required" }, { status: 400 });
    }

    const record = await prisma.patientRecord.findUnique({
      where: { id: Number(id) },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const serialized = JSON.stringify({
      id: record.id,
      patientId: record.patientId,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      createdAt: record.createdAt,
    });

    const recomputedHash = crypto
      .createHash("sha256")
      .update(serialized)
      .digest("hex");

    const contract = getContract();
    const blockchainRecord = await contract.getRecord(record.id);
    const blockchainHash = blockchainRecord[0];

    const valid = recomputedHash === blockchainHash;

    return NextResponse.json({
      recordId: record.id,
      databaseHash: recomputedHash,
      blockchainHash: blockchainHash,
      status: valid ? "VALID" : "TAMPERED",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}