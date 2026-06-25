import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/9bkp-auth";
import { getWinnersTotal, setWinnersTotal } from "@/lib/site-data";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const winnersTotal = await getWinnersTotal();
  return NextResponse.json({ winnersTotal });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const allowedKeys = ["winnersTotal"];
  const unknownKeys = Object.keys(body).filter((k) => !allowedKeys.includes(k));
  if (unknownKeys.length > 0)
    return NextResponse.json({ error: `Campos desconhecidos: ${unknownKeys.join(", ")}` }, { status: 400 });

  const { winnersTotal } = body;
  if (winnersTotal !== undefined) {
    const n = Number(winnersTotal);
    if (!Number.isFinite(n) || n < 0)
      return NextResponse.json({ error: "winnersTotal inválido" }, { status: 400 });
    await setWinnersTotal(n);
  }
  return NextResponse.json({ ok: true });
}
