import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getWinnersTotal, setWinnersTotal } from "@/lib/site-data";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const winnersTotal = await getWinnersTotal();
  return NextResponse.json({ winnersTotal });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { winnersTotal } = await req.json();
  if (winnersTotal !== undefined) await setWinnersTotal(Number(winnersTotal) || 0);
  return NextResponse.json({ ok: true });
}
