import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/9bkp-auth";
import { prisma } from "@/lib/db";
import { GAMES } from "@/lib/games";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const plays = await prisma.gamePlay.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true } } },
  });
  const gameName = (id: string) => GAMES.find((g) => g.id === id)?.name ?? id;
  return NextResponse.json({
    plays: plays.map((p: (typeof plays)[number]) => ({
      id: p.id,
      user: p.user.name,
      game: gameName(p.gameId),
      betAmount: p.betAmount,
      prize: p.prize,
      won: p.won,
      createdAt: p.createdAt,
    })),
  });
}
