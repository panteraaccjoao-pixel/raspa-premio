import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/9bkp-auth";
import { prisma } from "@/lib/db";

// Taxa cobrada no saque (mesma de /api/saque). O saldo é debitado pelo valor
// BRUTO (líquido + taxa) na hora do pedido; ao cancelar, devolvemos o bruto.
const FEE = 5;

// Processa um saque manualmente:
//  - "completed" (pago): apenas marca como pago (o saldo JÁ foi descontado no pedido)
//  - "cancelled": devolve ao usuário o valor bruto descontado (líquido + taxa)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json();

  const validStatuses = ["pending", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx || tx.type !== "withdrawal") {
    return NextResponse.json({ error: "Saque não encontrado" }, { status: 404 });
  }

  if (status === "cancelled" && tx.status !== "cancelled") {
    // Devolve o valor bruto (o que foi efetivamente descontado do saldo)
    await prisma.$transaction([
      prisma.transaction.update({ where: { id }, data: { status: "cancelled" } }),
      prisma.user.update({ where: { id: tx.userId }, data: { balance: { increment: tx.amount + FEE } } }),
    ]);
  } else {
    // Marca como pago/pendente — sem mexer no saldo (já foi descontado no pedido)
    await prisma.transaction.update({ where: { id }, data: { status } });
  }

  return NextResponse.json({ ok: true });
}
