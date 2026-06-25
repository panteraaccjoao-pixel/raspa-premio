import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/9bkp-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [usuarios, depositos, depPendentes, plays, saldoAgg, recentUsers, recentDeps] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.aggregate({ where: { type: "deposit", status: "completed" }, _sum: { amount: true } }),
    prisma.transaction.count({ where: { type: "deposit", status: "pending" } }),
    prisma.gamePlay.aggregate({ _sum: { betAmount: true, prize: true }, _count: true }),
    prisma.user.aggregate({ _sum: { balance: true } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { name: true, email: true, createdAt: true } }),
    prisma.transaction.findMany({
      where: { type: "deposit" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true } } },
    }),
  ]);

  const faturamento = depositos._sum.amount ?? 0;
  const totalApostado = plays._sum.betAmount ?? 0;
  const totalPremios = plays._sum.prize ?? 0;

  return NextResponse.json({
    usuarios,
    faturamento,
    depositosPendentes: depPendentes,
    jogadas: plays._count,
    totalApostado,
    totalPremios,
    margem: totalApostado - totalPremios,
    saldoTotal: saldoAgg._sum.balance ?? 0,
    recentUsers,
    recentDeps: recentDeps.map((d: (typeof recentDeps)[number]) => ({
      id: d.id, user: d.user.name, amount: d.amount, status: d.status, createdAt: d.createdAt,
    })),
  });
}
