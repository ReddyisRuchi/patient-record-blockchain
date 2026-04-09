import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET);

    // Delete user's records first (FK constraint)
    await prisma.patientRecord.deleteMany({ where: { patientId: decoded.id } });
    await prisma.donation.deleteMany({ where: { patientId: decoded.id } });
    await prisma.user.delete({ where: { id: decoded.id } });

    const res = NextResponse.json({ message: "Account deleted" });
    res.headers.set("Set-Cookie", "token=; Path=/; Max-Age=0");
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
