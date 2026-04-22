import { NextResponse } from "next/server";
import { getContract } from "@/lib/blockchain";

export async function GET() {
  try {
    const contract = await getContract();
    // Simple call to check connectivity
    await contract.runner.provider.getBlockNumber();
    return NextResponse.json({ status: "online" });
  } catch {
    return NextResponse.json({ status: "offline" });
  }
}
