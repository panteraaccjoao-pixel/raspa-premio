import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const MIN_WITHDRAWAL = 20;
const FEE = 5;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { amount, pixKey, pixKeyType } = await req.json();

  if (!amount || amount < MIN_WITHDRAWAL)
    return NextResponse.json({ error: `Valor mínimo de saque é R$ ${MIN_WITHDRAWAL},00` }, { status: 400 });
  if (!pixKey || !pixKeyType)
    return NextResponse.json({ error: "Chave PIX obrigatória" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  if (user.balance < amount)
    return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });

  const netAmount = Math.max(0, amount - FEE);

  await prisma.$transaction([
    prisma.user.update({ where: { id: session.id }, data: { balance: { decrement: amount } } }),
    prisma.transaction.create({
      data: {
        userId: session.id,
        type: "withdrawal",
        amount: netAmount,
        status: "pending",
        pixCode: `${pixKeyType}:${pixKey}`,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
