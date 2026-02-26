import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { message: "patientId is required." },
        { status: 400 }
      );
    }

    const records = await prisma.patientRecord.findMany({
      where: {
        patientId: Number(patientId),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      { records },
      { status: 200 }
    );

  } catch (error) {
    console.error("Fetch Records Error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}