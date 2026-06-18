import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { amount } = await req.json();
  if (!amount || amount < 1) {
    return NextResponse.json({ error: "Valor mínimo: R$ 1,00" }, { status: 400 });
  }

  // For now, simulate a PIX QR code response
  // In production, integrate with VeloraPay here
  const pixCode = `00020126580014BR.GOV.BCB.PIX01361234567890${Date.now()}5204000053039865406${amount.toFixed(2).replace(".", "")}5802BR5913RaspaSorte6008Brasilia62070503***6304`;

  const tx = await prisma.transaction.create({
    data: {
      userId: session.id,
      type: "deposit",
      amount,
      status: "pending",
      pixCode,
    },
  });

  return NextResponse.json({
    txId: tx.id,
    pixCode,
    amount,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });
}
