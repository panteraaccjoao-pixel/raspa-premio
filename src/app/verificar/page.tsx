"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) router.replace("/entrar");
  }, [email, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function setDigit(i: number, v: string) {
    const clean = v.replace(/\D/g, "");
    if (!clean) {
      setDigits((d) => { const n = [...d]; n[i] = ""; return n; });
      return;
    }
    setDigits((d) => {
      const n = [...d];
      // permite colar vários dígitos
      const chars = clean.split("");
      let idx = i;
      for (const c of chars) {
        if (idx > 5) break;
        n[idx] = c;
        idx++;
      }
      const next = Math.min(idx, 5);
      inputs.current[next]?.focus();
      return n;
    });
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  async function submit(code: string) {
    setLoading(true);
    setError("");
    const res = await fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (data.ok) {
      window.location.href = "/";
    } else {
      setError(data.error || "Código inválido");
      setLoading(false);
      setDigits(Array(6).fill(""));
      inputs.current[0]?.focus();
    }
  }

  const code = digits.join("");
  useEffect(() => {
    if (code.length === 6 && !loading) submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function resend() {
    if (cooldown > 0) return;
    setResent(false);
    await fetch("/api/resend-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResent(true);
    setCooldown(30);
  }

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
      <style>{`
        .vf-section{min-height:calc(100vh - 80px);background:#0a0a0a;display:flex;align-items:center;justify-content:center;padding:3rem 1rem;font-family:'Inter',sans-serif;}
        .vf-card{background:rgba(20,20,20,.85);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:3rem 2.5rem;width:100%;max-width:460px;box-shadow:0 20px 60px rgba(0,0,0,.5);text-align:center;}
        .vf-icon{width:64px;height:64px;background:linear-gradient(135deg,#ef4444,#dc2626);border-radius:16px;margin:0 auto 1.5rem;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.6rem;box-shadow:0 8px 24px rgba(239,68,68,.5);}
        .vf-title{font-size:1.6rem;font-weight:800;color:#fff;margin-bottom:.5rem;}
        .vf-sub{color:#9ca3af;font-size:.95rem;margin-bottom:.35rem;line-height:1.5;}
        .vf-email{color:#ef4444;font-weight:700;word-break:break-all;}
        .vf-inputs{display:flex;gap:.6rem;justify-content:center;margin:2rem 0 1.25rem;}
        .vf-inputs input{width:48px;height:58px;text-align:center;font-size:1.6rem;font-weight:800;color:#fff;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;transition:all .2s;}
        .vf-inputs input:focus{outline:none;border-color:#ef4444;background:rgba(255,255,255,.08);box-shadow:0 0 0 3px rgba(239,68,68,.12);}
        .vf-error{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#f87171;padding:.7rem 1rem;border-radius:12px;font-size:.88rem;margin-bottom:1rem;}
        .vf-spin{width:22px;height:22px;border:3px solid rgba(239,68,68,.25);border-top-color:#ef4444;border-radius:50%;animation:vfspin .7s linear infinite;margin:.5rem auto;}
        @keyframes vfspin{to{transform:rotate(360deg)}}
        .vf-resend{color:#9ca3af;font-size:.88rem;margin-top:1.25rem;}
        .vf-resend button{background:none;border:none;color:#ef4444;font-weight:700;cursor:pointer;font-family:inherit;font-size:.88rem;}
        .vf-resend button:disabled{color:#6b7280;cursor:not-allowed;}
        .vf-ok{color:#16C75B;font-size:.85rem;margin-top:.6rem;}
      `}</style>

      <section className="vf-section">
        <div className="vf-card">
          <div className="vf-icon"><i className="bi bi-envelope-check-fill" /></div>
          <h1 className="vf-title">Verifique seu email</h1>
          <p className="vf-sub">Enviamos um código de 6 dígitos para</p>
          <p className="vf-email">{email}</p>

          <div className="vf-inputs">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                inputMode="numeric"
                maxLength={6}
                value={d}
                disabled={loading}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {error && <div className="vf-error">{error}</div>}
          {loading && <div className="vf-spin" />}

          <div className="vf-resend">
            Não recebeu?{" "}
            <button onClick={resend} disabled={cooldown > 0}>
              {cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar código"}
            </button>
          </div>
          {resent && <div className="vf-ok">Novo código enviado!</div>}
        </div>
      </section>
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}
