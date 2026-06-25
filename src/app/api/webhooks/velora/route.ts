import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";

// Webhook da VeloraPay — chamado quando o pagamento é confirmado.
// Configure a URL no painel da Velora (ou enviamos via webhook_url na criação):
//   https://SEU-DOMINIO/api/webhooks/velora
//
// Validação: header x-webhook-secret comparado com WEBHOOK_SECRET (fallback VELORAPAY_SECRET).
// O segredo NÃO vai na URL — apenas no header.

function validSecret(req: NextRequest): boolean {
  const expected = process.env.WEBHOOK_SECRET || process.env.VELORAPAY_SECRET;
  if (!expected) {
    console.error("[webhook] WEBHOOK_SECRET não configurado — todos os webhooks serão rejeitados");
    return false;
  }
  // Aceita apenas header — query param foi removido por expor o segredo em logs de URL.
  const provided = req.headers.get("x-webhook-secret") || "";
  if (!provided) return false;
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

  // Localiza o depósito pelo id da Velora
  const deposit = await prisma.transaction.findFirst({ where: { pixId: id, type: "deposit" } });
  if (!deposit) return NextResponse.json({ received: true, ignored: true });

  if (isPaid(status)) {
    // updateMany com WHERE status="pending" é atômico — garante que dois webhooks
    // simultâneos não creditam duas vezes (apenas o primeiro muda a linha).
    const updated = await prisma.transaction.updateMany({
      where: { id: deposit.id, status: "pending" },
      data: { status: "completed" },
    });

    if (updated.count === 0) {
      // Outra thread já processou este webhook
      return NextResponse.json({ received: true, already: true });
    }

    // Só credita se esta thread ganhou a corrida acima
    await prisma.user.update({
      where: { id: deposit.userId },
      data: { balance: { increment: deposit.amount } },
    });

    return NextResponse.json({ received: true, credited: true });
  }

  return NextResponse.json({ received: true });
}

// Alguns gateways fazem GET para verificar se a URL do webhook está ativa.
export async function GET() {
  return NextResponse.json({ status: "Webhook ativo" });
}
