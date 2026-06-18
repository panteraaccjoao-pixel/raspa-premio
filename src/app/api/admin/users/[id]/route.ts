import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, email, phone, balance } = await req.json();
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(balance !== undefined && { balance: Number(balance) }),
    },
    select: { id: true, name: true, email: true, phone: true, balance: true, createdAt: true },
  });
  return NextResponse.json({ user });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  // Remove dependências antes de excluir o usuário
  await prisma.$transaction([
    prisma.gamePlay.deleteMany({ where: { userId: id } }),
    prisma.transaction.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);
  return NextResponse.json({ ok: true });
}
