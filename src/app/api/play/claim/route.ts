import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Credita o prêmio de uma jogada — chamado quando a tela de vitória aparece.
// Idempotente: usa uma Transaction (type "prize", pixId = playId) como marca,
// então creditar duas vezes a mesma jogada não duplica o saldo.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { playId } = await req.json();
  if (!playId) return NextResponse.json({ error: "playId obrigatório" }, { status: 400 });

  const play = await prisma.gamePlay.findUnique({ where: { id: playId } });
  if (!play || play.userId !== session.id) {
    return NextResponse.json({ error: "Jogada não encontrada" }, { status: 404 });
  }

  // Sem prêmio: nada a creditar
  if (play.prize <= 0) {
    const u = await prisma.user.findUnique({ where: { id: session.id }, select: { balance: true } });
    return NextResponse.json({ credited: false, balance: u?.balance ?? 0 });
  }

  // Credita o prêmio de forma atômica. A constraint UNIQUE em (type, pixId)
  // garante que dois requests simultâneos não criem duplicata — o segundo falha
  // no create e cai no catch, retornando "already" sem duplo crédito.
  let credited = false;
  try {
    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId: session.id,
          type: "prize",
          amount: play.prize,
          status: "completed",
          pixId: playId,
        },
      }),
      prisma.user.update({
        where: { id: session.id },
        data: { balance: { increment: play.prize } },
      }),
    ]);
    credited = true;
  } catch (e: unknown) {
    // Unique constraint violada = já foi creditado por outro request concorrente.
    const msg = e instanceof Error ? e.message : "";
    const isDuplicate = msg.includes("Unique constraint") || msg.includes("unique") || msg.includes("P2002");
    if (!isDuplicate) throw e;
  }

  const updated = await prisma.user.findUnique({ where: { id: session.id }, select: { balance: true } });
  if (!credited) {
    return NextResponse.json({ credited: false, already: true, balance: updated?.balance ?? 0 });
  }
  return NextResponse.json({ credited: true, balance: updated!.balance });
}
