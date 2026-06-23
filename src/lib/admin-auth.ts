import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";

const COOKIE = "admin_token";

// Segredo JWT — exige a env em produção (falha fechado).
function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET não configurado");
  }
  return "dev-only-insecure-secret-change-me";
}

// Senha do admin — exige a env em produção (sem fallback adivinhável).
function getAdminPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (p) return p;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PASSWORD não configurado");
  }
  return "admin123";
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
  return jwt.sign({ role: "admin" }, getSecret(), { expiresIn: "2d" });
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
