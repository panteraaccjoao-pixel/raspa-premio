import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword, signAdminToken, ADMIN_COOKIE } from "@/lib/9bkp-auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`admin-login:${ip}`, 5, 60_000)) {
    return NextResponse.json({ ok: false, error: "Muitas tentativas. Aguarde 1 minuto." }, { status: 429 });
  }

  const { password } = await req.json();
  if (!checkAdminPassword(password ?? "")) {
    return NextResponse.json({ ok: false, error: "Senha incorreta" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, signAdminToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4,
  });
  return res;
}
