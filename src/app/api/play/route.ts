import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGame, rollPrize } from "@/lib/games";
import { getMergedGame } from "@/lib/site-data";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { gameId } = await req.json();
  const game = getGame(gameId);
  if (!game) return NextResponse.json({ error: "Jogo inválido" }, { status: 400 });

  // Preço pode ter sido alterado no admin — cobra o valor configurado
  const merged = await getMergedGame(gameId);
  const price = merged?.price ?? game.price;

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  if (user.balance < price) {
    return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
  }

  const prize = rollPrize(game);
  const won = prize > 0;
  const net = prize - price;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { balance: { increment: net } },
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

  return NextResponse.json({ prize, won, balance: updated!.balance });
}
