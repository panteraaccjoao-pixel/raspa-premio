import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/9bkp-auth";
import { prisma } from "@/lib/db";
import { GAMES } from "@/lib/games";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const { imageUrl, category, name, price, maxPrize, description, active } = await req.json();
  if (category !== undefined && !["DINHEIRO", "PRODUTOS"].includes(category))
    return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
  const cat = category === "DINHEIRO" ? "DINHEIRO" : "PRODUTOS";
  const nameVal = name ? String(name) : null;
  const descVal = description ? String(description) : null;
  const priceVal = price === "" || price === null || price === undefined ? null : Number(price);
  const maxPrizeVal = maxPrize !== undefined ? Number(maxPrize) : undefined;

  const setting = await (prisma.gameSetting as any).upsert({
    where: { gameId: id },
    update: {
      ...(imageUrl !== undefined && { imageUrl }),
      ...(category !== undefined && { category: cat }),
      ...(name !== undefined && { name: nameVal }),
      ...(price !== undefined && { price: priceVal }),
      ...(maxPrizeVal !== undefined && { maxPrize: maxPrizeVal }),
      ...(description !== undefined && { description: descVal }),
      ...(active !== undefined && { active }),
    },
    create: {
      gameId: id,
      imageUrl: imageUrl || "",
      category: cat,
      name: nameVal,
      price: priceVal,
      maxPrize: maxPrizeVal ?? 1000,
      description: descVal,
      active: true,
    },
  });
  return NextResponse.json({ setting });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const isHardcoded = GAMES.some((g) => g.id === id);
  if (isHardcoded) {
    // Jogos hardcoded: apenas desativa
    await (prisma.gameSetting as any).upsert({
      where: { gameId: id },
      update: { active: false },
      create: { gameId: id, imageUrl: "", active: false },
    });
  } else {
    // Jogos customizados: exclui definitivamente
    await (prisma.gameSetting as any).delete({ where: { gameId: id } });
  }
  return NextResponse.json({ ok: true });
}
