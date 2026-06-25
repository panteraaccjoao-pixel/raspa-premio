// Rate limiter em memória. Funciona por instância de processo.
// Para múltiplos pods, substituir por Redis (ex: Upstash).

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

// Remove entradas expiradas periodicamente para evitar leak de memória.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of store) {
    if (bucket.resetAt < now) store.delete(key);
  }
}, 60_000);

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true; // permitido
  }

  if (bucket.count >= max) return false; // bloqueado

  bucket.count++;
  return true;
}
