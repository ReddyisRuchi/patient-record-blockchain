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
    if (decoded.role !== "HEALTHCARE_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const records = await prisma.patientRecord.groupBy({
      by: ["department"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    const data = records.map((r) => ({ department: r.department, count: r._count.id }));
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
