import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const { label, value, imageUrl, sortOrder, active } = await req.json();
  await prisma.gamePrize.update({
    where: { id },
    data: {
      label,
      value: Number(value),
      imageUrl,
      sortOrder: Number(sortOrder ?? 0),
      active: !!active,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  await prisma.gamePrize.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
