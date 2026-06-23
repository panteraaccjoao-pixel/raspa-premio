import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { confirmCode } from "@/lib/verification";

// Confirma o código de verificação. Em caso de sucesso, loga o usuário.
export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  if (!email || !code) {
    return NextResponse.json({ error: "Informe email e código" }, { status: 400 });
  }

  const emailNorm = String(email).trim().toLowerCase();
  const ok = await confirmCode(emailNorm, code);
  if (!ok) {
    return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // Verificado: agora pode logar.
  const token = signToken({ id: user.id, email: user.email, name: user.name });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7, path: "/" });
  return res;
}
