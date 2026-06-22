import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rollPrize } from "@/lib/games";
import { getMergedGame } from "@/lib/site-data";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { gameId } = await req.json();
  const merged = await getMergedGame(gameId);
  if (!merged) return NextResponse.json({ error: "Jogo inválido" }, { status: 400 });

  const game = merged;
  const price = merged.price;

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  if (user.balance < price) {
    return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
  }

  // 10% chance de ganhar, máximo R$200 (valores altos mais raros)
  const winChance = Math.random() < 0.10;
  const smallPrizes = [2, 5, 5, 10, 10, 10, 20, 20, 50, 50, 100, 200];
  const prize = winChance ? smallPrizes[Math.floor(Math.random() * smallPrizes.length)] : 0;
  const won = prize > 0;

  // Aqui só debita a APOSTA. O prêmio (se houver) é creditado depois, quando
  // o usuário revela a vitória, via /api/play/claim.
  const [, play] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: price } },
    }),
    prisma.gamePlay.create({
      data: {
        userId: user.id,
        gameId: game.id,
        betAmount: price,
        prize,
        won,
      },
    }),
  ]);

  const updated = await prisma.user.findUnique({
    where: { id: user.id },
    select: { balance: true },
  });

  return NextResponse.json({ playId: play.id, prize, won, balance: updated!.balance });
}
