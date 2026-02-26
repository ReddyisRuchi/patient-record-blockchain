import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function GET() {
  try {
    // `cookies()` may be async in this Next.js version; await to get the store
    const cookieStore = await cookies();
    const token = typeof cookieStore.get === "function" ? cookieStore.get("token")?.value : cookieStore.get?.("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
  where: { id: decoded.id },   // ✅ FIXED
  select: { id: true, name: true, email: true, role: true },
});

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("/api/auth/me error", err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
