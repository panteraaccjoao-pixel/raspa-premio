import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/9bkp-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const gameId = req.nextUrl.searchParams.get("gameId");
  if (!gameId) return NextResponse.json({ error: "gameId required" }, { status: 400 });
  const prizes = await prisma.gamePrize.findMany({
    where: { gameId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, label: true, value: true, imageUrl: true, sortOrder: true, active: true },
  });
  return NextResponse.json({ prizes });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { gameId, label, value, imageUrl, sortOrder } = await req.json();

  if (!gameId || typeof gameId !== "string" || gameId.length > 200)
    return NextResponse.json({ error: "gameId inválido" }, { status: 400 });
  if (!label || typeof label !== "string" || label.length > 255)
    return NextResponse.json({ error: "label inválido" }, { status: 400 });
  const numValue = Number(value);
  if (!Number.isFinite(numValue) || numValue < 0)
    return NextResponse.json({ error: "value deve ser número não-negativo" }, { status: 400 });
  if (imageUrl !== undefined && imageUrl !== null && (typeof imageUrl !== "string" || imageUrl.length > 2_000_000))
    return NextResponse.json({ error: "imageUrl inválida" }, { status: 400 });

  const id = `gp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  await prisma.gamePrize.create({
    data: {
      id,
      gameId,
      label,
      value: numValue,
      imageUrl: imageUrl ?? "",
      sortOrder: Number(sortOrder ?? 0),
      active: true,
    },
  });
  return NextResponse.json({ ok: true, id });
}
