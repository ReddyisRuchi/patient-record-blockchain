import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    // 1️⃣ Check authentication
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
    const decoded = jwt.verify(token, JWT_SECRET);

    const { searchParams } = new URL(request.url);
    let patientId;

    // 2️⃣ Role-based access control
    if (decoded.role === "PATIENT") {
      // Patient can ONLY see their own records
      patientId = decoded.id;
    } else if (decoded.role === "DOCTOR") {
      // Doctor must provide patientId
      const paramId = searchParams.get("patientId");
      console.log("Decoded token:", decoded);
      if (!paramId) {
        return NextResponse.json(
          { error: "patientId is required" },
          { status: 400 }
        );
      }

      patientId = Number(paramId);
    } else {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // 3️⃣ Fetch records
    const records = await prisma.patientRecord.findMany({
      where: {
        patientId: Number(patientId),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ records });

  } catch (error) {
    console.error("Fetch Records Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}