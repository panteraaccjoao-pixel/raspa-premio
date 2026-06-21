import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const gameId = req.nextUrl.searchParams.get("gameId");
  if (!gameId) return NextResponse.json({ error: "gameId required" }, { status: 400 });
  const prizes = await prisma.$queryRawUnsafe(
    `SELECT id, label, value, imageUrl, sortOrder, active FROM GamePrize WHERE gameId = ? ORDER BY sortOrder ASC`,
    gameId
  );
  return NextResponse.json({ prizes });
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { gameId, label, value, imageUrl, sortOrder } = await req.json();
  const id = `gp_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
  await prisma.$executeRawUnsafe(
    `INSERT INTO GamePrize (id, gameId, label, value, imageUrl, sortOrder, active) VALUES (?, ?, ?, ?, ?, ?, 1)`,
    id, gameId, label, Number(value), imageUrl ?? "", Number(sortOrder ?? 0)
  );
  return NextResponse.json({ ok: true, id });
}
