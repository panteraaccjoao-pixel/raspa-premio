import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { issueCode } from "@/lib/verification";
import { sendVerificationCode } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { name, email, phone, password, captchaToken } = await req.json();

  if (!name || !email || !phone || !password) {
    return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });
  }

  const emailNorm = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }
  if (String(password).length < 6) {
    return NextResponse.json({ error: "A senha deve ter ao menos 6 caracteres" }, { status: 400 });
  }
  if (String(name).trim().length < 2) {
    return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
  }

  if (!(await verifyRecaptcha(captchaToken))) {
    return NextResponse.json({ error: "Verificação anti-robô falhou. Tente novamente." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (existing) {
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: String(name).trim(), email: emailNorm, phone, passwordHash },
  });

  // Gera o código e envia por email. O usuário só é logado após confirmar.
  const code = await issueCode(user.email);
  await sendVerificationCode(user.email, user.name, code);

  return NextResponse.json({ ok: true, needsVerification: true, email: user.email });
}
