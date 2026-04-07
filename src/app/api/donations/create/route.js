import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      type,
      bloodGroup,
      currentLocation,
    } = body;

    if (!type || !currentLocation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.create({
      data: {
        type,
        bloodGroup,
        status: "collected",
        collectedAt: new Date(),
        currentLocation,
      },
    });

    return NextResponse.json({ donation });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create donation" },
      { status: 500 }
    );
  }
}