import { Resend } from "resend";

// Remetente: defina RESEND_FROM. Sem domínio próprio, o Resend só entrega para
// o seu próprio email usando onboarding@resend.dev.
const FROM = process.env.RESEND_FROM || "RaspaPrêmio <onboarding@resend.dev>";

// Template do email de verificação — layout em tabela (compatível com Gmail,
// Outlook, Apple Mail) e estilos inline. Tema RaspaPrêmio (vermelho/escuro).
function emailHtml(name: string, code: string): string {
  const cells = code
    .split("")
    .map(
      (d) =>
        `<td style="padding:0 5px;"><div style="width:46px;height:58px;line-height:58px;background:#141414;border:1px solid rgba(239,68,68,0.45);border-radius:12px;color:#ffffff;font-size:30px;font-weight:800;text-align:center;font-family:'Segoe UI',Arial,sans-serif;">${d}</div></td>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#000000;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#0c0c0c;border:1px solid #1c1c1c;border-radius:20px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:28px 32px;text-align:center;">
          <div style="font-family:'Arial Black',Arial,sans-serif;font-size:24px;font-weight:900;letter-spacing:1px;color:#ffffff;">
            RASPA<span style="color:#ffe2e2;">PRÊMIO</span>
          </div>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 32px 16px;font-family:'Segoe UI',Arial,sans-serif;">
          <h1 style="margin:0 0 8px;font-size:20px;color:#ffffff;font-weight:800;">Confirme seu email</h1>
          <p style="margin:0 0 4px;font-size:15px;color:#cbd5e1;line-height:1.5;">Olá${name ? ", " + name : ""}! 👋</p>
          <p style="margin:0;font-size:15px;color:#9ca3af;line-height:1.5;">Use o código abaixo para ativar sua conta:</p>
        </td></tr>
        <!-- Code -->
        <tr><td style="padding:18px 32px 8px;" align="center">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>
        </td></tr>
        <!-- Expiry note -->
        <tr><td style="padding:14px 32px 0;text-align:center;">
          <span style="display:inline-block;background:rgba(239,68,68,0.1);color:#f87171;font-size:12px;font-weight:600;padding:6px 14px;border-radius:50px;font-family:'Segoe UI',Arial,sans-serif;">⏱ Expira em 15 minutos</span>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:28px 32px 32px;font-family:'Segoe UI',Arial,sans-serif;">
          <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5;border-top:1px solid #1c1c1c;padding-top:18px;">
            Se você não criou uma conta no RaspaPrêmio, ignore este email com segurança.
          </p>
        </td></tr>
      </table>
      <p style="max-width:480px;margin:18px auto 0;font-size:11px;color:#4b5563;text-align:center;font-family:'Segoe UI',Arial,sans-serif;">
        © RaspaPrêmio · Jogue com responsabilidade
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

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
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[email] RESEND_API_KEY ausente — código de ${email}: ${code} (apenas log, não enviado).`);
    }
    return false;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `${code} é o seu código RaspaPrêmio`,
      html: emailHtml(name, code),
    });
    return true;
  } catch (e) {
    console.error("[email] Falha ao enviar via Resend:", e);
    return false;
  }
}
