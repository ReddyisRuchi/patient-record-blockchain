import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
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

    // 🔒 Only doctors can create records
    if (decoded.role !== "DOCTOR") {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { patientId, diagnosis, treatment } = body;

    if (!patientId || !diagnosis || !treatment) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Create record in DB first
    const created = await prisma.patientRecord.create({
      data: {
        patientId: Number(patientId),
        diagnosis,
        treatment,
      },
    });

    // 🔐 Serialize record for hashing
    const serialized = JSON.stringify({
      id: created.id,
      patientId: created.patientId,
      diagnosis: created.diagnosis,
      treatment: created.treatment,
      createdAt: created.createdAt,
    });

    // 🔐 Generate SHA-256 hash
    const hash = crypto
      .createHash("sha256")
      .update(serialized)
      .digest("hex");

    // ⛓ Store hash on blockchain
    const contract = getContract();

    const tx = await contract.storeRecord(created.id, hash);
    await tx.wait();

    return NextResponse.json(
      {
        message: "Record created successfully!",
        record: created,
        blockchainHash: hash,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Record Error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}