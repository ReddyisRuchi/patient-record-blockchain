import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function makeCookie(token) {
  const isProd = process.env.NODE_ENV === "production";
  const parts = [
    `token=${token}`,
    `HttpOnly`,
    `Path=/`,
    `Max-Age=${7 * 24 * 60 * 60}`,
    `SameSite=Strict`,
  ];
  if (isProd) parts.push("Secure");
  return parts.join("; ");
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
  {
    id: user.id,
    role: user.role,
    email: user.email
  },
  JWT_SECRET,  // ✅ use the constant
  { expiresIn: "1d" }
);
    const res = NextResponse.json({ message: "Login successful", user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    res.headers.set("Set-Cookie", makeCookie(token));
    return res;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
