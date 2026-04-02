import { NextResponse } from "next/server";
import { getContract } from "@/lib/blockchain";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get("id");

    const numericId = Number(recordId);

    const contract = await getContract();

    const history = await contract.getHistory(numericId);

    const formatted = history.map((event) => {
  const rawTimestamp = Number(event[2]);

  const readableTime = new Date(rawTimestamp * 1000).toLocaleString();

  return {
    location: event[0],
    action: event[1],
    timestamp: readableTime
  };
});

    return NextResponse.json({
      history: formatted,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}