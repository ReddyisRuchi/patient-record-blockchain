import { NextResponse } from "next/server";
import { getContract } from "@/lib/blockchain";

export async function POST(req) {
  try {
    const { donationId, location, action } = await req.json();

    if (!donationId || !location || !action) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const contract = await getContract();

    const tx = await contract.addEvent(
      donationId,
      location,
      action
    );

    await tx.wait();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to add event" },
      { status: 500 }
    );
  }
}