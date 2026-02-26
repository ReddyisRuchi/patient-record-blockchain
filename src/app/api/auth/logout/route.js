import { NextResponse } from "next/server";

function clearCookie() {
  const isProd = process.env.NODE_ENV === "production";
  const parts = [
    `token=deleted`,
    `HttpOnly`,
    `Path=/`,
    `Max-Age=0`,
    `SameSite=Strict`,
  ];
  if (isProd) parts.push("Secure");
  return parts.join("; ");
}

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });
  res.headers.set("Set-Cookie", clearCookie());
  return res;
}
