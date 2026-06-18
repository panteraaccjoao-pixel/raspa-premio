import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const users = await prisma.user.findMany({
    where: q
      ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, name: true, email: true, phone: true, balance: true, createdAt: true },
  });
  return NextResponse.json({ users });
}
