import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const { imageUrl, category, name, price, description } = await req.json();
  const cat = category === "DINHEIRO" ? "DINHEIRO" : "PRODUTOS";
  const nameVal = name ? String(name) : null;
  const descVal = description ? String(description) : null;
  const priceVal =
    price === "" || price === null || price === undefined ? null : Number(price);

  const setting = await prisma.gameSetting.upsert({
    where: { gameId: id },
    update: {
      ...(imageUrl !== undefined && { imageUrl }),
      ...(category !== undefined && { category: cat }),
      ...(name !== undefined && { name: nameVal }),
      ...(price !== undefined && { price: priceVal }),
      ...(description !== undefined && { description: descVal }),
    },
    create: {
      gameId: id,
      imageUrl: imageUrl || "",
      category: cat,
      name: nameVal,
      price: priceVal,
      description: descVal,
    },
  });
  return NextResponse.json({ setting });
}
