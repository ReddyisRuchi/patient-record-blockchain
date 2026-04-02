import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { getContract } from "@/lib/blockchain";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      patientId,
      diagnosis,
      symptoms,
      prescription,
      severity,
      followUp,
      department,
      visitType
    } = body;

    // Basic validation
    if (!patientId || !diagnosis || !symptoms || !prescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Create record in database
    const created = await prisma.patientRecord.create({
      data: {
        patientId,
        diagnosis,
        symptoms,
        prescription,
        severity,
        followUp,
        department,
        visitType
      }
    });

    // 2️⃣ Serialize record for hashing
    const serialized = JSON.stringify({
      id: created.id,
      patientId: created.patientId,
      diagnosis: created.diagnosis,
      symptoms: created.symptoms,
      prescription: created.prescription,
      severity: created.severity,
      followUp: created.followUp,
      department: created.department,
      visitType: created.visitType,
      createdAt: created.createdAt
    });

    // 3️⃣ Generate SHA256 hash
    const hash = crypto
      .createHash("sha256")
      .update(serialized)
      .digest("hex");

    // 4️⃣ Store hash on blockchain
    const contract = await getContract();
    const tx = await contract.storeRecord(created.id, hash);
    await tx.wait();

    // 5️⃣ Save blockchain hash in database
    await prisma.patientRecord.update({
      where: { id: created.id },
      data: { blockchainHash: hash }
    });

    return NextResponse.json({
      message: "Record created successfully",
      record: created,
      blockchainHash: hash,
      blockchainTransaction: tx.hash
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create record" },
      { status: 500 }
    );
  }
}