import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

// Lista os pedidos de saque (withdrawal) para processamento manual.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const txs = await prisma.transaction.findMany({
    where: { type: "withdrawal" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });
  return NextResponse.json({
    saques: txs.map((t: (typeof txs)[number]) => ({
      id: t.id,
      user: t.user.name,
      email: t.user.email,
      amount: t.amount,
      pixKey: t.pixCode ?? "",
      status: t.status,
      createdAt: t.createdAt,
    })),
  });
}
