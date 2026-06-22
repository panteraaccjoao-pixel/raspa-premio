import { Resend } from "resend";

// Remetente: defina RESEND_FROM. Sem domínio próprio, o Resend só entrega para
// o seu próprio email usando onboarding@resend.dev.
const FROM = process.env.RESEND_FROM || "RaspaPrêmio <onboarding@resend.dev>";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// Envia o código de verificação. Retorna true se enviou; false se o Resend não
// está configurado (para não quebrar o cadastro em ambiente local).
export async function sendVerificationCode(email: string, name: string, code: string): Promise<boolean> {
  const resend = getClient();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY ausente — código de ${email}: ${code} (apenas log, não enviado).`);
    return false;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Seu código de verificação - RaspaPrêmio",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0a0a0a;border-radius:16px;color:#fff">
          <h2 style="color:#ef4444;margin:0 0 8px">RaspaPrêmio</h2>
          <p style="color:#cbd5e1;font-size:15px">Olá, ${name}! Use o código abaixo para confirmar seu email:</p>
          <div style="font-size:38px;font-weight:900;letter-spacing:10px;color:#fff;background:#1a1a1a;border:1px solid rgba(239,68,68,.4);border-radius:12px;padding:18px;text-align:center;margin:18px 0">
            ${code}
          </div>
          <p style="color:#6b7280;font-size:13px">O código expira em 15 minutos. Se você não criou esta conta, ignore este email.</p>
        </div>
      `,
    });
    return true;
  } catch (e) {
    console.error("[email] Falha ao enviar via Resend:", e);
    return false;
  }
}
