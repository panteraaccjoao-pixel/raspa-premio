import { notFound } from "next/navigation";
import { getMergedGame } from "@/lib/site-data";
import { prisma } from "@/lib/db";
import GameClient from "./GameClient";

export const dynamic = "force-dynamic";

export default async function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const game = await getMergedGame(gameId);
  if (!game) notFound();

  const dbPrizes = await prisma.gamePrize.findMany({
    where: { gameId, active: true },
    orderBy: { value: "desc" },
    select: { id: true, label: true, value: true, imageUrl: true, sortOrder: true },
  });

  const prizes = dbPrizes.map((p) => ({
    label: p.label,
    value: p.value,
    imageUrl: p.imageUrl,
  }));

  return <GameClient game={game} dbPrizes={prizes} />;
}
