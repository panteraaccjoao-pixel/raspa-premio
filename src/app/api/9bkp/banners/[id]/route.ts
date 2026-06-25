import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/9bkp-auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const { imageUrl, link, objectFit, sortOrder, active } = await req.json();

  if (link !== undefined && link !== null && link !== "") {
    const l = String(link);
    if (!l.startsWith("/") && !/^https?:\/\//i.test(l)) {
      return NextResponse.json({ error: "link deve ser caminho relativo ou URL http(s)" }, { status: 400 });
    }
  }

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
