import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Resolve o segredo JWT. Em produção, EXIGE a variável (falha fechado) para
// nunca usar um segredo adivinhável que permitiria forjar tokens.
function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET não configurado nas variáveis de ambiente");
  return s;
}

export function signToken(payload: { id: string; email: string; name: string }) {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, getSecret()) as { id: string; email: string; name: string };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
