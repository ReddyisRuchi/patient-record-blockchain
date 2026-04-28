import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getContract } from "@/lib/blockchain";

export async function POST(req) {
  try {
    const body = await req.json();
    const { donationId, patientId, recordId } = body;

    if (!donationId || !patientId) {
      return NextResponse.json(
        { error: "Missing donationId or patientId" },
        { status: 400 }
      );
    }

    // 🔍 Get patient name (for better event message)
    const patient = await prisma.user.findUnique({
      where: { id: Number(patientId) },
      select: { name: true },
    });

    // 🔄 Update donation in DB
    const donation = await prisma.donation.update({
      where: { id: Number(donationId) },
      data: {
        patientId: Number(patientId),
        status: "assigned",
        recordId: Number(recordId),
      },
    });

    // ⛓️ Add blockchain event (IMPORTANT: +1000 offset)
    try {
      const contract = await getContract();

      const tx = await contract.addEvent(
        Number(donationId) + 1000,
        donation.currentLocation || "Hospital",
        `Assigned to ${patient?.name || "Unknown"}`
      );

      await tx.wait();
    } catch (blockchainErr) {
      // Do not fail API if blockchain fails
      console.error("Blockchain event failed:", blockchainErr);
    }

    return NextResponse.json({ donation });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to assign donation" },
      { status: 500 }
    );
  }
}