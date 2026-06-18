import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword, signAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!checkAdminPassword(password ?? "")) {
    return NextResponse.json({ ok: false, error: "Senha incorreta" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, signAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 2,
  });
  return res;
}
