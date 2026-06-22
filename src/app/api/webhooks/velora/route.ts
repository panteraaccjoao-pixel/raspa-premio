import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";

// Webhook da VeloraPay — chamado quando o pagamento é confirmado.
// Configure a URL no painel da Velora (ou enviamos via webhook_url na criação):
//   https://SEU-DOMINIO/api/webhooks/velora?s=WEBHOOK_SECRET
//
// Validação: secret por query (?s=) ou header x-webhook-secret, comparado
// com WEBHOOK_SECRET (fallback VELORAPAY_SECRET).

function validSecret(req: NextRequest): boolean {
  const expected = process.env.WEBHOOK_SECRET || process.env.VELORAPAY_SECRET;
  if (!expected) return false;
  const provided = req.headers.get("x-webhook-secret") || req.nextUrl.searchParams.get("s") || "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function isPaid(status: string): boolean {
  const s = status.toLowerCase();
  return (
    ["paid", "approved", "completed", "confirmed", "success", "pago", "aprovado", "concluido"].includes(s) ||
    s.includes("paid") ||
    s.includes("pago") ||
    s.includes("aprov") ||
    s.includes("conclu") ||
    s.includes("complet")
  );
}

export async function POST(req: NextRequest) {
  if (!validSecret(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const payload = await req.json().catch(() => ({} as Record<string, unknown>));
  const tx = (payload.data ?? payload.payment ?? payload.transaction ?? payload) as Record<string, unknown>;

  const id = String(
    tx.transactionId ?? tx.transaction_id ?? tx.id ?? payload.transaction_id ?? payload.id ?? ""
  );
  const status = String(tx.status ?? tx.state ?? payload.status ?? "").toLowerCase();

  if (!id) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });

  // Localiza o depósito pendente pelo id da Velora
  const deposit = await prisma.transaction.findFirst({ where: { pixId: id, type: "deposit" } });
  if (!deposit) return NextResponse.json({ received: true, ignored: true });
  if (deposit.status === "completed") return NextResponse.json({ received: true, already: true });

  if (isPaid(status)) {
    await prisma.$transaction([
      prisma.transaction.update({ where: { id: deposit.id }, data: { status: "completed" } }),
      prisma.user.update({ where: { id: deposit.userId }, data: { balance: { increment: deposit.amount } } }),
    ]);
    return NextResponse.json({ received: true, credited: true });
  }

  return NextResponse.json({ received: true });
}

// Alguns gateways fazem GET para verificar se a URL do webhook está ativa.
export async function GET() {
  return NextResponse.json({ status: "Webhook ativo" });
}
