import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "dev-secret";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const COOKIE = "admin_token";

export function checkAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function signAdminToken(): string {
  return jwt.sign({ role: "admin" }, SECRET, { expiresIn: "2d" });
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return false;
  try {
    const payload = jwt.verify(token, SECRET) as { role?: string };
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE = COOKIE;
