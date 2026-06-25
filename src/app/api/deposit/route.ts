import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPixCharge } from "@/lib/velora";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { amount } = await req.json();
  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount < 1 || numAmount > 100_000) {
    return NextResponse.json({ error: "Valor inválido (mín R$ 1,00 / máx R$ 100.000,00)" }, { status: 400 });
  }

  // Cria a cobrança PIX na VeloraPay. O CPF do pagador é exigido pela API,
  // mas não pedimos ao usuário — geramos um CPF válido automaticamente.
  let charge;
  try {
    charge = await createPixCharge({
      amount: numAmount,
      payerName: session.name,
      description: `Depósito RaspaPrêmio - ${session.email}`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao gerar PIX";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // Guarda a transação local com o id da Velora (pixId) para o webhook reconciliar
  const tx = await prisma.transaction.create({
    data: {
      userId: session.id,
      type: "deposit",
      amount: numAmount,
      status: "pending",
      pixId: charge.id,
      pixCode: charge.pixCode,
    },
  });

  return NextResponse.json({
    txId: tx.id,
    pixCode: charge.pixCode,
    qrCodeImage: charge.qrCodeImage ?? null,
    amount: numAmount,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });
}
