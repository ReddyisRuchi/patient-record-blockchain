import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function makeCookie(token) {
  const isProd = process.env.NODE_ENV === "production";
  const parts = [`token=${token}`, "HttpOnly", "Path=/", `Max-Age=${7 * 24 * 60 * 60}`, "SameSite=Strict"];
  if (isProd) parts.push("Secure");
  return parts.join("; ");
}

export async function POST(req) {
  try {
    const { walletAddress, signature, name, role } = await req.json();
    if (!walletAddress || !signature) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const addr = walletAddress.toLowerCase();
    const user = await prisma.user.findUnique({ where: { walletAddress: addr } });
    if (!user || !user.walletNonce) return NextResponse.json({ error: "No nonce found. Request a new one." }, { status: 400 });

    // Verify the signature
    const message  = `Sign this message to log in: ${user.walletNonce}`;
    const recovered = ethers.verifyMessage(message, signature).toLowerCase();

    if (recovered !== addr) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

    // Invalidate nonce after use, save name if provided
    await prisma.user.update({ where: { id: user.id }, data: { walletNonce: null, ...(name && { name }), ...(role && { role }) } });

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
    const res   = NextResponse.json({ message: "Login successful", user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    res.headers.set("Set-Cookie", makeCookie(token));
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
