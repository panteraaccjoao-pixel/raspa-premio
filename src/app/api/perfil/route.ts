import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { name, phone, password } = await req.json();

  const data: Record<string, unknown> = {};
  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (trimmed.length < 2 || trimmed.length > 200)
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
    data.name = trimmed;
  }
  if (phone !== undefined) {
    data.phone = phone ? String(phone).trim().slice(0, 20) : null;
  }
  if (password !== undefined) {
    const pw = String(password);
    if (pw.length < 6)
      return NextResponse.json({ error: "Senha deve ter ao menos 6 caracteres" }, { status: 400 });
    data.passwordHash = await bcrypt.hash(pw, 10);
  }

  await prisma.user.update({ where: { id: session.id }, data });
  return NextResponse.json({ ok: true });
}
