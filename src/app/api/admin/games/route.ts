import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getRaspadinhas } from "@/lib/site-data";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const games = await getRaspadinhas();
  return NextResponse.json({ games });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { name, price, maxPrize, description, category, imageUrl } = await req.json();
  if (!name) return NextResponse.json({ error: "name obrigatório" }, { status: 400 });

  const gameId = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
  const game = await (prisma.gameSetting as any).create({
    data: {
      gameId,
      name,
      price: Number(price) || 5,
      maxPrize: Number(maxPrize) || 1000,
      description: description || "",
      category: category || "DINHEIRO",
      imageUrl: imageUrl || "",
      active: true,
    },
  });
  return NextResponse.json({ game });
}
