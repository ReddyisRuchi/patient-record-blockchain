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

    let records;
    if (decoded.role === "PATIENT") {
      records = await prisma.patientRecord.findMany({
        where: { patientId: decoded.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { patient: { select: { name: true } } },
      });
    } else {
      records = await prisma.patientRecord.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { patient: { select: { name: true } } },
      });
    }

    const activity = records.map((r) => ({
      id: r.id,
      label: `Record created for ${r.patient?.name || "Patient"}`,
      sub: `${r.department} · ${r.diagnosis}`,
      date: r.createdAt,
    }));

    return NextResponse.json({ activity });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
