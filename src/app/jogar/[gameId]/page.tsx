import { notFound } from "next/navigation";
import { getMergedGame } from "@/lib/site-data";
import { prisma } from "@/lib/db";
import GameClient from "./GameClient";

export const dynamic = "force-dynamic";

export default async function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const game = await getMergedGame(gameId);
  if (!game) notFound();

  const dbPrizes = await prisma.$queryRawUnsafe(
    `SELECT id, label, value, imageUrl, sortOrder FROM GamePrize WHERE gameId = ? AND active = 1 ORDER BY value DESC`,
    gameId
  ) as any[];

  const prizes = dbPrizes.map((p: any) => ({
    label: p.label,
    value: p.value,
    imageUrl: p.imageUrl,
  }));

  return <GameClient game={game} dbPrizes={prizes} />;
}
