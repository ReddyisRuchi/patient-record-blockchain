import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, JWT_SECRET);

    const targetId = userId ? Number(userId) : decoded.id;
    if (decoded.role !== "HEALTHCARE_ADMIN" && decoded.id !== targetId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, dob: true, gender: true, bloodGroup: true,
        address: true, city: true, state: true,
        emergencyName: true, emergencyPhone: true, photoUrl: true, allergies: true,
      },
    });

    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, JWT_SECRET);

    const body = await req.json();
    const { userId, ...data } = body;

    const targetId = userId ? Number(userId) : decoded.id;
    if (decoded.role !== "HEALTHCARE_ADMIN" && decoded.id !== targetId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow safe fields
    const allowed = ["phone","dob","gender","bloodGroup","address","city","state","emergencyName","emergencyPhone","photoUrl","allergies"];
    const update = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));
    if (update.dob) update.dob = new Date(update.dob);

    const user = await prisma.user.update({ where: { id: targetId }, data: update });
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
