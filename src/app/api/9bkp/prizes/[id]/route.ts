import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/9bkp-auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const { label, value, imageUrl, sortOrder, active } = await req.json();

  if (label !== undefined && (typeof label !== "string" || label.length < 1 || label.length > 255))
    return NextResponse.json({ error: "label inválido (1-255 chars)" }, { status: 400 });
  if (value !== undefined) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0)
      return NextResponse.json({ error: "value deve ser número não-negativo" }, { status: 400 });
  }

  await prisma.gamePrize.update({
    where: { id },
    data: {
      ...(label !== undefined && { label }),
      ...(value !== undefined && { value: Number(value) }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      ...(active !== undefined && { active: !!active }),
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
