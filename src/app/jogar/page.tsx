import { getRaspadinhas, getWinnersTotal } from "@/lib/site-data";
import JogarClient from "./JogarClient";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const [games, winnersTotal] = await Promise.all([getRaspadinhas(), getWinnersTotal()]);
  return <JogarClient games={games} winnersTotal={winnersTotal} />;
}
