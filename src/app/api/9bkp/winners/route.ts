import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/9bkp-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const winners = await prisma.winner.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ winners });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { imageUrl, name, value, badge, minutesAgo, sortOrder, active } = await req.json();
  if (!name) return NextResponse.json({ error: "nome obrigatÃ³rio" }, { status: 400 });
  const winner = await prisma.winner.create({
    data: {
      imageUrl: imageUrl || "",
      name,
      value: Number(value) || 0,
      badge: badge === "PREMIO" ? "PREMIO" : "PIX",
      minutesAgo: Number(minutesAgo) || 0,
      sortOrder: Number(sortOrder) || 0,
      active: active ?? true,
    },
  });
  return NextResponse.json({ winner });
}
