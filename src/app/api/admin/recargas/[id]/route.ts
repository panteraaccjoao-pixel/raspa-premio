import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

// Aprova ou cancela uma recarga manualmente.
// Ao aprovar uma recarga pendente, credita o saldo do usuário.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json();

  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  if (status === "completed" && tx.status !== "completed") {
    await prisma.$transaction([
      prisma.transaction.update({ where: { id }, data: { status: "completed" } }),
      prisma.user.update({ where: { id: tx.userId }, data: { balance: { increment: tx.amount } } }),
    ]);
  } else if (status === "cancelled" && tx.status === "completed") {
    // Reverte o crédito ao cancelar uma recarga já aprovada
    await prisma.$transaction([
      prisma.transaction.update({ where: { id }, data: { status: "cancelled" } }),
      prisma.user.update({ where: { id: tx.userId }, data: { balance: { decrement: tx.amount } } }),
    ]);
  } else {
    await prisma.transaction.update({ where: { id }, data: { status } });
  }

  return NextResponse.json({ ok: true });
}
