import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const { label, value, imageUrl, sortOrder, active } = await req.json();
  await prisma.$executeRawUnsafe(
    `UPDATE GamePrize SET label=?, value=?, imageUrl=?, sortOrder=?, active=? WHERE id=?`,
    label, Number(value), imageUrl, Number(sortOrder ?? 0), active ? 1 : 0, id
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  await prisma.$executeRawUnsafe(`DELETE FROM GamePrize WHERE id=?`, id);
  return NextResponse.json({ ok: true });
}
