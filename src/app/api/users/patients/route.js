import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const patients = await prisma.user.findMany({
      where: { role: "PATIENT" },
      select: {
        id: true,
        name: true,
        email: true,
        allergies: true,
        bloodGroup: true,
        gender: true,
        records: { select: { department: true } },
      },
    });

    const result = patients.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      allergies: p.allergies,
      bloodGroup: p.bloodGroup,
      gender: p.gender,
      recordCount: p.records.length,
      departments: [...new Set(p.records.map((r) => r.department).filter(Boolean))],
    }));

    return NextResponse.json({ patients: result });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}
