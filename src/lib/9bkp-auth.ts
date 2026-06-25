import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";

const COOKIE = "admin_token";

// Segredo JWT — sempre exigido, sem fallback.
function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET não configurado nas variáveis de ambiente");
  return s;
}

// Senha do admin — sempre exigida, sem fallback.
function getAdminPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (!p) throw new Error("ADMIN_PASSWORD não configurado nas variáveis de ambiente");
  return p;
}

// Comparação em tempo constante (evita timing attack).
export function checkAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  const a = Buffer.from(String(password));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function signAdminToken(): string {
  return jwt.sign({ role: "admin" }, getSecret(), { expiresIn: "4h" });
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return false;
  try {
    const payload = jwt.verify(token, getSecret()) as { role?: string };
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE = COOKIE;
