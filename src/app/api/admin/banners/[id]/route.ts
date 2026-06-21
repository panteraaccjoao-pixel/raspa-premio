import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const { imageUrl, link, objectFit, sortOrder, active } = await req.json();
  const banner = await (prisma.banner as any).update({
    where: { id },
    data: {
      ...(imageUrl !== undefined && { imageUrl }),
      ...(link !== undefined && { link: link || null }),
      ...(objectFit !== undefined && { objectFit }),
      ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      ...(active !== undefined && { active }),
    },
  });
  return NextResponse.json({ banner });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.banner.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
