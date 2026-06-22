import { prisma } from "@/lib/db";

// Estado de verificação de email guardado na tabela Setting (key/value),
// evitando alterar o schema. Chave: emailverify:<email>.
// Valor (JSON): { code, exp, verified }.

const TTL_MS = 15 * 60 * 1000; // 15 minutos
const key = (email: string) => `emailverify:${email.toLowerCase().trim()}`;

interface VState {
  code: string;
  exp: number;
  verified: boolean;
}

async function read(email: string): Promise<VState | null> {
  const row = await prisma.setting.findUnique({ where: { key: key(email) } });
  if (!row) return null;
  try {
    return JSON.parse(row.value) as VState;
  } catch {
    return null;
  }
}

async function write(email: string, state: VState) {
  await prisma.setting.upsert({
    where: { key: key(email) },
    create: { key: key(email), value: JSON.stringify(state) },
    update: { value: JSON.stringify(state) },
  });
}

function genCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos
}

// Gera e armazena um novo código; retorna o código (para enviar por email).
export async function issueCode(email: string): Promise<string> {
  const code = genCode();
  await write(email, { code, exp: Date.now() + TTL_MS, verified: false });
  return code;
}

// Valida o código. Em caso de sucesso, marca verified=true.
export async function confirmCode(email: string, code: string): Promise<boolean> {
  const state = await read(email);
  if (!state) return false;
  if (state.verified) return true;
  if (Date.now() > state.exp) return false;
  if (String(code).trim() !== state.code) return false;
  await write(email, { ...state, verified: true });
  return true;
}

// Email verificado? Usuários antigos (sem registro) são considerados verificados,
// para não travar quem já existia antes deste sistema.
export async function isEmailVerified(email: string): Promise<boolean> {
  const state = await read(email);
  if (!state) return true;
  return state.verified;
}

// True se há um fluxo de verificação pendente (registro existe e não verificado).
export async function hasPendingVerification(email: string): Promise<boolean> {
  const state = await read(email);
  return !!state && !state.verified;
}
