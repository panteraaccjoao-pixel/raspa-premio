// Verificação do Google reCAPTCHA no servidor.
// Se RECAPTCHA_SECRET_KEY não estiver configurada, a verificação é ignorada
// (permite rodar localmente / antes de configurar as chaves).
export async function verifyRecaptcha(token: string | undefined | null): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  console.log("[recaptcha] secret configurado:", !!secret, "| token recebido:", !!token, typeof token);
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RECAPTCHA_SECRET_KEY não configurado");
    }
    return true; // permite apenas em desenvolvimento
  }
  if (!token || typeof token !== "string" || token.length > 4096) {
    console.error("[recaptcha] token inválido:", { token: typeof token, length: (token as string)?.length });
    return false;
  }

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json();
    if (!data.success) {
      console.error("[recaptcha] falhou:", JSON.stringify(data));
    }
    return !!data.success;
  } catch (e) {
    console.error("[recaptcha] erro fetch:", e);
    return false;
  }
}
