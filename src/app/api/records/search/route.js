import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "HEALTHCARE_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase() || "";
    if (!q) return NextResponse.json({ results: [] });

    const records = await prisma.patientRecord.findMany({
      where: {
        OR: [
          { diagnosis:    { contains: q, mode: "insensitive" } },
          { department:   { contains: q, mode: "insensitive" } },
          { prescription: { contains: q, mode: "insensitive" } },
          { symptoms:     { contains: q, mode: "insensitive" } },
          { patient: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const results = records.map((r) => ({
      id: r.id,
      diagnosis: r.diagnosis,
      department: r.department,
      severity: r.severity,
      createdAt: r.createdAt,
      patientId: r.patientId,
      patientName: r.patient?.name,
    }));

    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
