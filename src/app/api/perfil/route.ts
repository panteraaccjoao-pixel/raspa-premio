import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { name, phone, password } = await req.json();

  const data: Record<string, string> = {};
  if (name) data.name = name;
  if (phone !== undefined) data.phone = phone;
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({ where: { id: session.id }, data });
  return NextResponse.json({ ok: true });
}
