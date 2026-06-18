import { notFound } from "next/navigation";
import { getMergedGame } from "@/lib/site-data";
import GameClient from "./GameClient";

export const dynamic = "force-dynamic";

export default async function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const game = await getMergedGame(gameId);
  if (!game) notFound();

  return <GameClient game={game} />;
}
