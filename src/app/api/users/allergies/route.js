import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, JWT_SECRET);

    const { patientId, allergies } = await req.json();

    // Only admins can update patient allergies, patients can update their own
    if (decoded.role !== "HEALTHCARE_ADMIN" && decoded.id !== patientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.update({
      where: { id: Number(patientId) },
      data: { allergies },
      select: { id: true, allergies: true },
    });

    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
