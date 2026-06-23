import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const MIN_WITHDRAWAL = 20;
const FEE = 5;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const amount = Number(body.amount);
  const { pixKey, pixKeyType } = body;

  if (!Number.isFinite(amount) || amount < MIN_WITHDRAWAL)
    return NextResponse.json({ error: `Valor mínimo de saque é R$ ${MIN_WITHDRAWAL},00` }, { status: 400 });
  if (!pixKey || !pixKeyType)
    return NextResponse.json({ error: "Chave PIX obrigatória" }, { status: 400 });

  // Débito atômico: só decrementa se o saldo for suficiente (evita corrida/double-spend).
  const debited = await prisma.user.updateMany({
    where: { id: session.id, balance: { gte: amount } },
    data: { balance: { decrement: amount } },
  });
  if (debited.count === 0)
    return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });

  const netAmount = Math.max(0, amount - FEE);
  await prisma.transaction.create({
    data: {
      userId: session.id,
      type: "withdrawal",
      amount: netAmount,
      status: "pending",
      pixCode: `${pixKeyType}:${pixKey}`,
    },
  });

  return NextResponse.json({ ok: true });
}
