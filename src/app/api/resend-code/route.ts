import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { issueCode } from "@/lib/verification";
import { sendVerificationCode } from "@/lib/email";

// Reenvia um novo código de verificação para o email.
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Informe o email" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
  if (!user) {
    // Não revela se o email existe ou não
    return NextResponse.json({ ok: true });
  }

  const code = await issueCode(user.email);
  await sendVerificationCode(user.email, user.name, code);
  return NextResponse.json({ ok: true });
}
