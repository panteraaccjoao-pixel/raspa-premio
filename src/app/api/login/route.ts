import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { hasPendingVerification, issueCode } from "@/lib/verification";
import { sendVerificationCode } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email, password, captchaToken } = await req.json();

  if (!(await verifyRecaptcha(captchaToken))) {
    return NextResponse.json({ error: "Verificação anti-robô falhou. Tente novamente." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  // Email ainda não verificado: reenvia o código e manda pra tela de verificação.
  if (await hasPendingVerification(user.email)) {
    const code = await issueCode(user.email);
    await sendVerificationCode(user.email, user.name, code);
    return NextResponse.json({ needsVerification: true, email: user.email }, { status: 403 });
  }

  const token = signToken({ id: user.id, email: user.email, name: user.name });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
  return res;
}
