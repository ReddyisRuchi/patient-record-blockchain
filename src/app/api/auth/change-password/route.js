import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET);
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword)
      return NextResponse.json({ message: "All fields required" }, { status: 400 });

    if (newPassword.length < 6)
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: decoded.id }, data: { password: hashed } });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (e) {
    return NextResponse.json({ message: "Failed to update password" }, { status: 500 });
  }
}
