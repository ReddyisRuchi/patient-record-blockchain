import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Record ID is required" },
        { status: 400 }
      );
    }

    // Get record from DB
    const record = await prisma.patientRecord.findUnique({
      where: { id: Number(id) },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    // ✅ DEMO RESPONSE (no blockchain)
    return NextResponse.json({
      verified: true,
      dbHash: "demo-db-hash",
      onChainHash: "demo-chain-hash",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}