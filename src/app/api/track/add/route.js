import { NextResponse } from "next/server";
import { getContract } from "@/lib/blockchain";

export async function POST(req) {
  try {
    const body = await req.json();
    const { location, action } = body;
    // Accept either recordId or donationId
    const id = body.recordId ?? body.donationId;

    if (!id || !location || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const contract = await getContract();
    const tx = await contract.addEvent(Number(id)+1000, location, action);
    await tx.wait();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add event" }, { status: 500 });
  }
}
