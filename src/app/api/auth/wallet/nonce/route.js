import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { walletAddress, name, role } = await req.json();
    if (!walletAddress) return NextResponse.json({ error: "Wallet address required" }, { status: 400 });

    const nonce = crypto.randomBytes(16).toString("hex");
    const addr  = walletAddress.toLowerCase();

    await prisma.user.upsert({
      where:  { walletAddress: addr },
      update: { walletNonce: nonce, ...(name && { name }), ...(role && { role }) },
      create: {
        walletAddress: addr,
        walletNonce:   nonce,
        name:          name || `Wallet ${addr.slice(0, 6)}...${addr.slice(-4)}`,
        email:         `${addr}@wallet.local`,
        password:      "",
        role:          role || "PATIENT",
      },
    });

    return NextResponse.json({ nonce, message: `Sign this message to log in: ${nonce}` });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
