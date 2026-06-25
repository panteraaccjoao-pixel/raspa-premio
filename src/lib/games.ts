import { randomInt } from "crypto";

export type GameCategory = "DINHEIRO" | "PRODUTOS";

export interface Game {
  id: string;
  name: string;
  price: number;
  maxPrize: number;
  color: string;
  emoji: string;
  description: string;
  imageUrl?: string;
  /** Categoria padrão (editável no admin via GameSetting) */
  category: GameCategory;
  prizes: { amount: number; probability: number }[];
}

export const GAMES: Game[] = [
  {
    id: "pix-turbinado",
    name: "PIX Turbinado",
    price: 1,
    maxPrize: 2500,
    color: "from-green-500 to-emerald-700",
    emoji: "⚡",
    description: "Raspe e ganhe PIX na hora!",
    category: "DINHEIRO",
    prizes: [
      { amount: 2500, probability: 0.001 },
      { amount: 500, probability: 0.005 },
      { amount: 50, probability: 0.02 },
      { amount: 10, probability: 0.05 },
      { amount: 5, probability: 0.08 },
      { amount: 2, probability: 0.12 },
      { amount: 0, probability: 0.724 },
    ],
  },
  {
    id: "sonho-premiado",
    name: "Sonho Premiado",
    price: 2,
    maxPrize: 5000,
    color: "from-purple-500 to-violet-700",
    emoji: "⭐",
    description: "Seus sonhos viram realidade!",
    category: "PRODUTOS",
    prizes: [
      { amount: 5000, probability: 0.001 },
      { amount: 1000, probability: 0.005 },
      { amount: 100, probability: 0.02 },
      { amount: 20, probability: 0.05 },
      { amount: 10, probability: 0.08 },
      { amount: 4, probability: 0.12 },
      { amount: 0, probability: 0.724 },
    ],
  },
  {
    id: "ostentacao",
    name: "Ostentação Instantânea",
    price: 5,
    maxPrize: 10000,
    color: "from-yellow-500 to-orange-600",
    emoji: "💎",
    description: "Seja rico de forma instantânea!",
    category: "PRODUTOS",
    prizes: [
      { amount: 10000, probability: 0.001 },
      { amount: 2000, probability: 0.005 },
      { amount: 250, probability: 0.02 },
      { amount: 50, probability: 0.05 },
      { amount: 25, probability: 0.08 },
      { amount: 10, probability: 0.12 },
      { amount: 0, probability: 0.724 },
    ],
  },
  {
    id: "mega-black",
    name: "Mega Raspada Black",
    price: 10,
    maxPrize: 20000,
    color: "from-gray-700 to-black",
    emoji: "🖤",
    description: "O maior prêmio da plataforma!",
    category: "DINHEIRO",
    prizes: [
      { amount: 20000, probability: 0.001 },
      { amount: 5000, probability: 0.005 },
      { amount: 500, probability: 0.02 },
      { amount: 100, probability: 0.05 },
      { amount: 50, probability: 0.08 },
      { amount: 20, probability: 0.12 },
      { amount: 0, probability: 0.724 },
    ],
  },
];

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}

export function rollPrize(game: Game): number {
  const rand = randomInt(0, 1_000_000) / 1_000_000;
  let cumulative = 0;
  for (const prize of game.prizes) {
    cumulative += prize.probability;
    if (rand <= cumulative) return prize.amount;
  }
  return 0;
}
