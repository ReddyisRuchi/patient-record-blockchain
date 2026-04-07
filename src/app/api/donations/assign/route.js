import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();

    const { donationId, patientId } = body;

    if (!donationId || !patientId) {
      return NextResponse.json(
        { error: "Missing donationId or patientId" },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.update({
      where: { id: Number(donationId) },
      data: {
        patientId: Number(patientId),
        status: "assigned",
      },
    });

    return NextResponse.json({ donation });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to assign donation" },
      { status: 500 }
    );
  }
}