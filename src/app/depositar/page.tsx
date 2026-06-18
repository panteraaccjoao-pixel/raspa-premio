"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AMOUNTS = [5, 10, 20, 50, 100, 200];

export default function DepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState(20);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<{ txId: string; pixCode: string; amount: number } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => {
      if (!d.user) router.push("/entrar");
    });
  }, [router]);

  async function createPix() {
    setLoading(true);
    const val = custom ? parseFloat(custom) : amount;
    const res = await fetch("/api/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: val }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setPix(data);
  }

  async function confirmDev() {
    if (!pix) return;
    setChecking(true);
    await fetch("/api/deposit/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txId: pix.txId }),
    });
    setChecking(false);
    setConfirmed(true);
    setTimeout(() => router.push("/jogar"), 2000);
  }

  if (confirmed) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-black text-green-400">Depósito confirmado!</h2>
          <p className="text-white/50 mt-2">Redirecionando para os jogos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">💳</div>
        <h1 className="text-2xl font-black text-white">Depositar via PIX</h1>
        <p className="text-white/50 text-sm mt-1">Saldo disponível em segundos</p>
      </div>

      {!pix ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-white/60 text-sm block mb-3">Escolha o valor</label>
            <div className="grid grid-cols-3 gap-2">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => { setAmount(a); setCustom(""); }}
                  className={`py-3 rounded-xl font-bold text-sm transition ${
                    amount === a && !custom
                      ? "bg-yellow-400 text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  R$ {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm block mb-2">Ou insira outro valor</label>
            <input
              type="number"
              min="1"
              placeholder="R$ 0,00"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/60 transition"
            />
          </div>

          <button
            onClick={createPix}
            disabled={loading}
            className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {loading ? "Gerando PIX..." : `Depositar R$ ${custom || amount}`}
          </button>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="text-center">
            <div className="text-green-400 font-black text-2xl">R$ {pix.amount.toFixed(2)}</div>
            <p className="text-white/50 text-sm mt-1">Copie o código PIX abaixo</p>
          </div>

          <div className="bg-black/40 rounded-xl p-4">
            <p className="text-white/40 text-xs mb-2">Código PIX Copia e Cola</p>
            <p className="text-white text-xs break-all font-mono leading-relaxed">{pix.pixCode}</p>
          </div>

          <button
            onClick={() => navigator.clipboard.writeText(pix.pixCode)}
            className="w-full border border-white/20 text-white py-3 rounded-xl hover:bg-white/10 transition text-sm"
          >
            📋 Copiar código PIX
          </button>

          {/* DEV: simulate confirmation */}
          <button
            onClick={confirmDev}
            disabled={checking}
            className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-400 transition disabled:opacity-50"
          >
            {checking ? "Confirmando..." : "✅ [DEV] Simular pagamento recebido"}
          </button>

          <p className="text-white/30 text-xs text-center">
            Em produção o saldo é creditado automaticamente após o pagamento
          </p>
        </div>
      )}
    </div>
  );
}
