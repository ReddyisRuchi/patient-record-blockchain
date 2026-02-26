import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const patients = await prisma.user.findMany({
      where: { role: "PATIENT" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // ✅ Debug logs INSIDE function
    console.log("Decoded user:", decoded);
    console.log("Fetched patients:", patients);

    return NextResponse.json({ patients });

  } catch (error) {
    console.error("Patients Route Error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}