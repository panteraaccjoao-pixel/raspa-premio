import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/9bkp-auth";
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
  if (!name || typeof name !== "string" || name.trim().length < 2 || name.length > 255)
    return NextResponse.json({ error: "name obrigatório (2-255 chars)" }, { status: 400 });
  const numPrice = Number(price);
  if (!Number.isFinite(numPrice) || numPrice <= 0)
    return NextResponse.json({ error: "price deve ser número positivo" }, { status: 400 });

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
