import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const token = signToken({ id: user.id, email: user.email, name: user.name });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
  return res;
}
