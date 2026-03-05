import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { getContract } from "@/lib/blockchain";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function getUserFromReq(request) {
  const auth = request.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) {
    return auth.replace("Bearer ", "");
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|; )token=([^;]+)/);
  if (match) return match[1];

  return null;
}

export async function POST(request) {
  try {
    const token = getUserFromReq(request);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

if (!["DOCTOR", "PATIENT"].includes(decoded.role)) {
  return NextResponse.json(
    { message: "Access denied" },
    { status: 403 }
  );
}
    const body = await request.json();

    const {
      patientId,
      department,
      visitType,
      symptoms,
      diagnosis,
      prescription,
      severity,
      followUp,
      notes,
    } = body;

    if (!patientId || !diagnosis || !prescription || !department) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Create record in database
    const created = await prisma.patientRecord.create({
      data: {
        patientId,
        diagnosis,
        treatment
      }
    });

    // 2️⃣ Serialize record
    const serialized = JSON.stringify({
      id: created.id,
      patientId: created.patientId,
      diagnosis: created.diagnosis,
      treatment: created.treatment,
      createdAt: created.createdAt,
    });

    // 3️⃣ Generate SHA256 hash
    const hash = crypto
      .createHash("sha256")
      .update(serialized)
      .digest("hex");

    // 4️⃣ Store hash on blockchain
    const contract = getContract();
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