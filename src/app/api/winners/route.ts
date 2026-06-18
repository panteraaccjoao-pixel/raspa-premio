import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const plays = await prisma.gamePlay.findMany({
    where: { won: true },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { user: { select: { name: true } } },
  });

  const winners = plays.map((p) => ({
    name: p.user.name.split(" ")[0] + " " + (p.user.name.split(" ")[1]?.[0] ?? "") + ".",
    prize: p.prize,
    game: p.gameId,
  }));

  return NextResponse.json({ winners });
}
