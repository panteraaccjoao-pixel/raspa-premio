import { getRaspadinhas } from "@/lib/site-data";
import JogarClient from "./JogarClient";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const games = await getRaspadinhas();
  return <JogarClient games={games} />;
}
