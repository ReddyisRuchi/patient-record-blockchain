import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role === "PATIENT") {
      const records = await prisma.patientRecord.findMany({
        where: { patientId: decoded.id },
        orderBy: { createdAt: "desc" },
      });
      const lastVisit = records[0]?.createdAt ?? null;
      return NextResponse.json({ role: "PATIENT", totalRecords: records.length, lastVisit });
    }

    if (decoded.role === "HEALTHCARE_ADMIN") {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalRecords, totalPatients, thisMonth] = await Promise.all([
        prisma.patientRecord.count(),
        prisma.user.count({ where: { role: "PATIENT" } }),
        prisma.patientRecord.count({ where: { createdAt: { gte: startOfMonth } } }),
      ]);

      return NextResponse.json({ role: "HEALTHCARE_ADMIN", totalRecords, totalPatients, thisMonth });
    }

    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
