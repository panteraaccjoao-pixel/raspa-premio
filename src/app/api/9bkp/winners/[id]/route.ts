import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/9bkp-auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const { imageUrl, name, value, badge, minutesAgo, sortOrder, active } = await req.json();
  const winner = await prisma.winner.update({
    where: { id },
    data: {
      ...(imageUrl !== undefined && { imageUrl }),
      ...(name !== undefined && { name }),
      ...(value !== undefined && { value: Number(value) }),
      ...(badge !== undefined && { badge: badge === "PREMIO" ? "PREMIO" : "PIX" }),
      ...(minutesAgo !== undefined && { minutesAgo: Number(minutesAgo) }),
      ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      ...(active !== undefined && { active }),
    },
  });
  return NextResponse.json({ winner });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.winner.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
