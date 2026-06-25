import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/9bkp-auth";
import { prisma } from "@/lib/db";
import { ensureBannersSeed } from "@/lib/site-data";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await ensureBannersSeed();
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ banners });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { imageUrl, link, objectFit, sortOrder, active } = await req.json();
  if (!imageUrl) return NextResponse.json({ error: "imageUrl obrigatório" }, { status: 400 });

  if (link !== undefined && link !== null && link !== "") {
    const l = String(link);
    if (!l.startsWith("/") && !/^https?:\/\//i.test(l)) {
      return NextResponse.json({ error: "link deve ser caminho relativo ou URL http(s)" }, { status: 400 });
    }
  }

  const banner = await (prisma.banner as any).create({
    data: {
      imageUrl,
      link: link || null,
      objectFit: objectFit || "cover",
      sortOrder: Number(sortOrder) || 0,
      active: active ?? true,
    },
  });
  return NextResponse.json({ banner });
}
