import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { patientId, diagnosis, treatment } = body;

    // Basic validation
    if (!patientId || !diagnosis || !treatment) {
      return NextResponse.json(
        { message: "patientId, diagnosis and treatment are required." },
        { status: 400 }
      );
    }

    const record = await prisma.patientRecord.create({
      data: {
        patientId: Number(patientId),
        diagnosis,
        treatment,
      },
    });

    return NextResponse.json(
      { message: "Record created successfully!", record },
      { status: 201 }
    );

  } catch (error) {
    console.error("Create Record Error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}