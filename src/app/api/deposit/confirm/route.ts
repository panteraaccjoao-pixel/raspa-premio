// DEV ONLY: simulate deposit confirmation
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { txId } = await req.json();

  const tx = await prisma.transaction.findUnique({ where: { id: txId } });
  if (!tx || tx.status !== "pending") {
    return NextResponse.json({ error: "Transação inválida" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.transaction.update({ where: { id: txId }, data: { status: "completed" } }),
    prisma.user.update({ where: { id: tx.userId }, data: { balance: { increment: tx.amount } } }),
  ]);

  return NextResponse.json({ ok: true });
}
