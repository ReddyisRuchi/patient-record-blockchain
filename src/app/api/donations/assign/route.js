import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getContract } from "@/lib/blockchain";

export async function POST(req) {
  try {
    const body = await req.json();
    const { donationId, patientId } = body;

    if (!donationId || !patientId) {
      return NextResponse.json({ error: "Missing donationId or patientId" }, { status: 400 });
    }

    // Get patient name for the event log
    const patient = await prisma.user.findUnique({
      where: { id: Number(patientId) },
      select: { name: true },
    });

    const donation = await prisma.donation.update({
      where: { id: Number(donationId) },
      data: { patientId: Number(patientId), status: "assigned" },
    });

    // Log assignment as a blockchain tracking event
    try {
      const contract = await getContract();
      const tx = await contract.addEvent(
        Number(donationId),
        donation.currentLocation || "Hospital",
        `Assigned to patient: ${patient?.name || "Unknown"}`
      );
      await tx.wait();
    } catch (blockchainErr) {
      // Don't fail the whole request if blockchain is unavailable
      console.error("Blockchain event failed:", blockchainErr);
    }

    return NextResponse.json({ donation });
  } catch (err) {
    return NextResponse.json({ error: "Failed to assign donation" }, { status: 500 });
  }
}
