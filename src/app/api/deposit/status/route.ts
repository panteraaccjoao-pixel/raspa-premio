import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPixCharge } from "@/lib/velora";
import { rateLimit } from "@/lib/rate-limit";

// Detecta "pago" de forma tolerante (a Velora manda em maiúsculo, ex: "PAID").
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

// Consulta o status de um depósito. Além de ler o status local, reconcilia
// ativamente com a Velora (necessário em local, onde o webhook não chega).
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`deposit-status:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde 1 minuto." }, { status: 429 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const txId = req.nextUrl.searchParams.get("txId");
  if (!txId) return NextResponse.json({ error: "txId obrigatório" }, { status: 400 });

  const tx = await prisma.transaction.findUnique({ where: { id: txId } });
  if (!tx || tx.userId !== session.id) {
    return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
  }

  if (tx.status === "completed") return NextResponse.json({ status: "completed" });

  // Ainda pendente: pergunta à Velora se já foi pago
  if (tx.pixId) {
    try {
      const remote = await getPixCharge(tx.pixId);
      if (isPaid(remote.status)) {
        // updateMany atômico: só uma thread (webhook ou polling) ganha a corrida.
        const updated = await prisma.transaction.updateMany({
          where: { id: tx.id, status: "pending" },
          data: { status: "completed" },
        });
        if (updated.count > 0) {
          // Esta thread ganhou — crédito único garantido
          await prisma.user.update({
            where: { id: tx.userId },
            data: { balance: { increment: tx.amount } },
          });
        }
        // Mesmo se outra thread já creditou, retorna completed (idempotente)
        return NextResponse.json({ status: "completed" });
      }
    } catch {
      // se a consulta falhar, apenas retorna pending
    }
  }

  return NextResponse.json({ status: tx.status });
}
