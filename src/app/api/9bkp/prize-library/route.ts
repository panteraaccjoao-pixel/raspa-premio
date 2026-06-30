import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/9bkp-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const prizes = await prisma.prize.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, label: true, value: true, imageUrl: true, sortOrder: true },
  });
  return NextResponse.json({ prizes });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { label, value, imageUrl, sortOrder } = await req.json();

  if (!label || typeof label !== "string" || label.length > 255)
    return NextResponse.json({ error: "label inválido" }, { status: 400 });
  const numValue = Number(value);
  if (!Number.isFinite(numValue) || numValue < 0)
    return NextResponse.json({ error: "value deve ser número não-negativo" }, { status: 400 });
  if (imageUrl !== undefined && imageUrl !== null && (typeof imageUrl !== "string" || imageUrl.length > 2_000_000))
    return NextResponse.json({ error: "imageUrl inválida" }, { status: 400 });

  const prize = await prisma.prize.create({
    data: {
      label,
      value: numValue,
      imageUrl: imageUrl ?? "",
      sortOrder: Number(sortOrder ?? 0),
    },
  });
  return NextResponse.json({ ok: true, id: prize.id });
}
