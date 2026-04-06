import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const patients = await prisma.user.findMany({
      where: {
        role: "PATIENT", // 🔥 IMPORTANT
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}