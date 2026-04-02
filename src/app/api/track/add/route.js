import { NextResponse } from "next/server";
import { getContract } from "@/lib/blockchain";

export async function POST(req) {
  try {
    const body = await req.json();
    const { recordId, location, action } = body;

    const numericId = Number(recordId); // ✅ fix

    const contract = await getContract();

    const tx = await contract.addEvent(numericId, location, action);
    await tx.wait();

    return NextResponse.json({
      message: "Event added successfully",
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}