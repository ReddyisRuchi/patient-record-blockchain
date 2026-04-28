import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get("recordId");

    if (!recordId) {
      return NextResponse.json({ error: "Missing recordId" }, { status: 400 });
    }

    const donation = await prisma.donation.findFirst({
      where: { recordId: Number(recordId) },
    });

    return NextResponse.json({ donation });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch donation" }, { status: 500 });
  }
}