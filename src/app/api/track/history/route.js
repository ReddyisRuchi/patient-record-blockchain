import { NextResponse } from "next/server";
import { getContract } from "@/lib/blockchain";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get("id");

    if (!recordId) {
      return NextResponse.json(
        { error: "Record ID is required" },
        { status: 400 }
      );
    }

    const contract = await getContract();

    const events = await contract.getHistory(Number(recordId));

    // ✅ SAFE parsing (works for all ethers versions)
    const formatted = events.map((event) => {
      const location = event.location ?? event[0];
      const action = event.action ?? event[1];
      const timestampRaw = event.timestamp ?? event[2];

      const timestamp = new Date(Number(timestampRaw) * 1000).toLocaleString();

      return {
        location,
        action,
        timestamp,
      };
    });

    return NextResponse.json({
      history: formatted,
    });

  } catch (error) {
    console.error("History API Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}