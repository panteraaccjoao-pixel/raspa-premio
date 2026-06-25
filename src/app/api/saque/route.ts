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

  if (!Number.isFinite(amount) || amount <= 0)
    return NextResponse.json({ error: "Valor de saque inválido" }, { status: 400 });
  if (amount < MIN_WITHDRAWAL + FEE)
    return NextResponse.json({ error: `Valor mínimo de saque é R$ ${MIN_WITHDRAWAL + FEE},00 (incluso taxa de R$ ${FEE},00)` }, { status: 400 });
  const validPixKeyTypes = ["CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM"];
  if (!pixKey || !pixKeyType || !validPixKeyTypes.includes(String(pixKeyType).toUpperCase())) {
    return NextResponse.json({ error: "Tipo de chave PIX inválido" }, { status: 400 });
  }

  const pixKeyStr = String(pixKey).trim();
  const pixKeyTypeNorm = String(pixKeyType).toUpperCase();

  const pixKeyPatterns: Record<string, RegExp> = {
    CPF: /^\d{11}$/,
    CNPJ: /^\d{14}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?\d{10,15}$/,
    RANDOM: /^[a-f0-9-]{32,36}$/i,
  };
  if (!pixKeyPatterns[pixKeyTypeNorm]?.test(pixKeyStr)) {
    return NextResponse.json({ error: "Formato de chave PIX inválido" }, { status: 400 });
  }

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
      pixCode: `${pixKeyTypeNorm}:${pixKeyStr}`,
    },
  });

  return NextResponse.json({ ok: true });
}
