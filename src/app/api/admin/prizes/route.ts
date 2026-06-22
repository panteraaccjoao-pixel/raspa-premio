import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
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
  if (!await isAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { gameId, label, value, imageUrl, sortOrder } = await req.json();
  const id = `gp_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
  await prisma.gamePrize.create({
    data: {
      id,
      gameId,
      label,
      value: Number(value),
      imageUrl: imageUrl ?? "",
      sortOrder: Number(sortOrder ?? 0),
      active: true,
    },
  });
  return NextResponse.json({ ok: true, id });
}
