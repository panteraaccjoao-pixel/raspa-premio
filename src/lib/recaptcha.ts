// Verificação do Google reCAPTCHA no servidor.
// Se RECAPTCHA_SECRET_KEY não estiver configurada, a verificação é ignorada
// (permite rodar localmente / antes de configurar as chaves).
export async function verifyRecaptcha(token: string | undefined | null): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // não configurado → não bloqueia
  if (!token) return false;

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}
