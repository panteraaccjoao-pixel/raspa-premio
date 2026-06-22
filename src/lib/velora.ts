// Cliente VeloraPay — gateway de DEPÓSITO (PIX in).
// Alinhado com a integração já validada (projeto REV):
//   Base:   https://api.velorapay.com.br
//   Auth:   headers x-api-key + x-api-secret
//   Criar:  POST /payments/create
//   Buscar: GET  /payments/:id
//
// O CPF do pagador (payerDocument) é exigido pela API, mas é um valor fixo
// genérico — o usuário NUNCA informa CPF.
import QRCode from "qrcode";

const BASE_URL = "https://api.velorapay.com.br";

// CPF dummy (válido em formato) — a Velora exige o campo, mas não pedimos ao usuário.
const PAYER_DOCUMENT = "12345678900";

function headers() {
  const apiKey = process.env.VELORAPAY_API_KEY;
  const apiSecret = process.env.VELORAPAY_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("VeloraPay não configurada (VELORAPAY_API_KEY / VELORAPAY_SECRET).");
  }
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-api-key": apiKey,
    "x-api-secret": apiSecret,
  };
}

// URL pública do webhook que a Velora vai chamar quando o PIX for pago.
function webhookUrl(): string | undefined {
  const base = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (!base) return undefined;
  const secret = process.env.WEBHOOK_SECRET || process.env.VELORAPAY_SECRET || "";
  return `${base.replace(/\/$/, "")}/api/webhooks/velora?s=${encodeURIComponent(secret)}`;
}

export interface CreateChargeInput {
  amount: number; // em reais
  payerName: string;
  description: string;
}

export interface PixCharge {
  id: string;
  pixCode: string; // copia-e-cola (EMV)
  qrCodeImage: string; // data:image/png;base64,... (gerado se a API não devolver)
  status: string;
  raw: unknown;
}

export async function createPixCharge(input: CreateChargeInput): Promise<PixCharge> {
  const wh = webhookUrl();
  const res = await fetch(`${BASE_URL}/payments/create`, {
    method: "POST",
    headers: {
      ...headers(),
      "Idempotency-Key": `raspa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    },
    body: JSON.stringify({
      amount: Number(input.amount.toFixed(2)),
      payerName: input.payerName,
      payerDocument: PAYER_DOCUMENT,
      description: input.description,
      source: "raspa-premio",
      ...(wh ? { webhook_url: wh } : {}),
    }),
  });

  const rawText = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(rawText);
  } catch {
    data = {};
  }

  if (!res.ok) {
    const msg = (data?.message || data?.error) as string | undefined;
    throw new Error(msg || `Erro na VeloraPay (HTTP ${res.status})`);
  }

  const tx = (data.data ?? data.payment ?? data.transaction ?? data) as Record<string, unknown>;

  const pixCode = (tx.copyAndPaste ||
    tx.copyPaste ||
    tx.pixCopiaECola ||
    tx.brCode ||
    tx.emv ||
    "") as string;

  let qrCodeImage = (tx.qrCode || tx.qrCodeBase64 || tx.qrCodeImage || "") as string;
  if (qrCodeImage && !qrCodeImage.startsWith("data:") && !qrCodeImage.startsWith("http")) {
    qrCodeImage = `data:image/png;base64,${qrCodeImage}`;
  }
  if (!qrCodeImage && pixCode) {
    try {
      qrCodeImage = await QRCode.toDataURL(pixCode, { width: 300, margin: 1, errorCorrectionLevel: "M" });
    } catch {
      qrCodeImage = "";
    }
  }

  const id = (tx.transactionId || tx.internalId || tx.id || "") as string;
  const status = (tx.status || tx.state || "pending") as string;

  return { id: String(id), pixCode, qrCodeImage, status, raw: data };
}

export async function getPixCharge(id: string): Promise<{ status: string; raw: unknown }> {
  const res = await fetch(`${BASE_URL}/payments/${encodeURIComponent(id)}`, { headers: headers() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error("Transação não encontrada na Velora");
  const tx = (data?.data ?? data?.payment ?? data?.transaction ?? data) as Record<string, unknown>;
  const status = (tx?.status || tx?.state || "pending") as string;
  return { status: String(status), raw: data };
}
