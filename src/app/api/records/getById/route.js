import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const record = await prisma.patientRecord.findUnique({
      where: { id: Number(id) },
      include: { createdBy: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ record });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}