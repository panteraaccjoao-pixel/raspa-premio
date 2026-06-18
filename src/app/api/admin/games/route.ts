import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getRaspadinhas } from "@/lib/site-data";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const games = await getRaspadinhas();
  return NextResponse.json({ games });
}
