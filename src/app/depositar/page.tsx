"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fbq } from "@/lib/pixel";

const QUICK_AMOUNTS = [10, 25, 50, 100, 200, 500, 1000];
const MIN = 10;
const MAX = 1000;

export default function DepositPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [custom, setCustom] = useState("");
  const [depError, setDepError] = useState("");
  const [slider, setSlider] = useState(MIN);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<{ txId: string; pixCode: string; qrCodeImage?: string | null; amount: number } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => {
      if (!d.user) router.push("/entrar");
      else setBalance(d.user.balance ?? 0);
    });
  }, [router]);

  // Polling: detecta quando o webhook confirma o pagamento e credita o saldo.
  useEffect(() => {
    if (step !== 2 || !pix || confirmed) return;
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`/api/deposit/status?txId=${pix.txId}`);
        const d = await r.json();
        if (d.status === "completed") {
          clearInterval(interval);
          setConfirmed(true);
          fbq("Purchase", { value: pix!.amount, currency: "BRL" });
          window.dispatchEvent(new Event("balance:update"));
          setTimeout(() => router.push("/jogar"), 2000);
        }
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, [step, pix, confirmed, router]);

  const finalAmount = custom ? parseFloat(custom) || 0 : amount;
  const hasBonus = finalAmount >= 100;
  const bonusAmount = hasBonus ? finalAmount * 0.1 : 0;
  const totalWithBonus = finalAmount + bonusAmount;

  function selectQuick(v: number) {
    setAmount(v);
    setCustom("");
    setSlider(v);
  }

  function handleSlider(v: number) {
    setSlider(v);
    setAmount(v);
    setCustom("");
  }

  function handleCustom(v: string) {
    setCustom(v);
    const n = parseFloat(v);
    if (!isNaN(n)) setSlider(Math.min(Math.max(n, MIN), MAX));
  }

  async function goToPix() {
    setDepError("");
    setLoading(true);
    const res = await fetch("/api/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: finalAmount }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setPix(data);
      setStep(2);
      fbq("InitiateCheckout", { value: finalAmount, currency: "BRL" });
    } else setDepError(data.error || "Erro ao gerar PIX");
  }

  async function confirmDev() {
    if (!pix) return;
    setChecking(true);
    const devToken = process.env.NEXT_PUBLIC_DEV_CONFIRM_TOKEN || "";
    await fetch("/api/deposit/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-dev-token": devToken },
      body: JSON.stringify({ txId: pix.txId }),
    });
    setChecking(false);
    setConfirmed(true);
    window.dispatchEvent(new Event("balance:update"));
    setTimeout(() => router.push("/jogar"), 2000);
  }

  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (confirmed) {
    return (
      <div style={{ minHeight: "calc(100vh - 8rem)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h2 style={{ color: "#4ade80", fontSize: "1.5rem", fontWeight: 900 }}>Depósito confirmado!</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "0.5rem" }}>Redirecionando para os jogos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
      <style>{`
        .dep-page {
          min-height: calc(100vh - 5rem);
          background: #0a0a0a;
          padding: 3rem 1rem 5rem;
          font-family: 'Inter', sans-serif;
        }
        .dep-inner { max-width: 600px; margin: 0 auto; }
        .dep-title { text-align: center; color: #fff; font-size: 1.8rem; font-weight: 900; margin-bottom: 0.4rem; }
        .dep-sub { text-align: center; color: #9ca3af; font-size: 0.95rem; margin-bottom: 2rem; }

        /* Steps */
        .dep-steps {
          display: flex; align-items: center; justify-content: center;
          gap: 0; margin-bottom: 2rem;
        }
        .dep-step { display: flex; align-items: center; gap: 0.5rem; }
        .step-num {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700;
        }
        .step-num.active { background: #ef4444; color: #fff; }
        .step-num.done { background: #16C75B; color: #fff; }
        .step-num.inactive { background: rgba(255,255,255,0.1); color: #9ca3af; }
        .step-label { font-size: 0.85rem; font-weight: 600; color: #fff; }
        .step-label.inactive { color: #9ca3af; }
        .step-line { width: 60px; height: 1px; background: rgba(255,255,255,0.15); margin: 0 0.75rem; }

        /* Info cards */
        .dep-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
        .dep-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 1.1rem 1.25rem;
        }
        .dep-card-label { color: #9ca3af; font-size: 0.78rem; margin-bottom: 0.4rem; display: flex; align-items: center; justify-content: space-between; }
        .dep-card-value { color: #fff; font-size: 1.4rem; font-weight: 800; }
        .dep-card-sub { color: #9ca3af; font-size: 0.72rem; margin-top: 0.25rem; }
        .dep-card.highlight .dep-card-value { color: #16C75B; }

        /* Main box */
        .dep-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px; padding: 1.75rem;
        }
        .dep-box-title {
          display: flex; align-items: center; gap: 0.5rem;
          color: #fff; font-size: 1.05rem; font-weight: 800; margin-bottom: 0.3rem;
        }
        .dep-box-title i { color: #ef4444; }
        .dep-box-sub { color: #9ca3af; font-size: 0.82rem; margin-bottom: 1.5rem; }

        /* Selected display */
        .dep-selected {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 1rem;
          text-align: center; color: #9ca3af;
          font-size: 0.9rem; margin-bottom: 1.5rem;
          min-height: 56px; display: flex; align-items: center; justify-content: center;
        }
        .dep-selected.has-value { color: #fff; font-size: 1.5rem; font-weight: 900; }

        /* Quick amounts */
        .dep-quick-label { color: #fff; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.6rem; }
        .dep-quick { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; margin-bottom: 1.5rem; }
        .dep-quick-btn {
          padding: 0.75rem; border-radius: 10px; font-weight: 700; font-size: 0.9rem;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05); color: #fff;
          cursor: pointer; transition: all 0.2s;
          font-family: inherit;
        }
        .dep-quick-btn:hover { background: rgba(255,255,255,0.1); }
        .dep-quick-btn.active {
          background: #ef4444; border-color: #ef4444; color: #fff;
          box-shadow: 0 4px 14px rgba(239,68,68,0.35);
        }

        /* Slider */
        .dep-slider-label { color: #fff; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dep-slider-wrap { position: relative; margin-bottom: 0.35rem; }
        input[type=range].dep-slider {
          width: 100%; -webkit-appearance: none; appearance: none;
          height: 4px; border-radius: 4px;
          background: linear-gradient(to right, #ef4444 0%, #ef4444 var(--pct), rgba(255,255,255,0.12) var(--pct), rgba(255,255,255,0.12) 100%);
          outline: none; cursor: pointer;
        }
        input[type=range].dep-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px;
          border-radius: 50%; background: #ef4444;
          box-shadow: 0 2px 6px rgba(239,68,68,0.5);
          cursor: pointer;
        }
        .dep-slider-minmax { display: flex; justify-content: space-between; color: #9ca3af; font-size: 0.75rem; margin-bottom: 1.25rem; }

        /* Custom input */
        .dep-custom-label { color: #fff; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.5rem; }
        .dep-custom-input {
          width: 100%; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12); border-radius: 10px;
          padding: 0.75rem 1rem; color: #fff; font-size: 0.95rem;
          font-family: inherit; outline: none; box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .dep-custom-input:focus { border-color: #ef4444; }
        .dep-custom-input::placeholder { color: #6b7280; }
        .dep-custom-hint { color: #ef4444; font-size: 0.72rem; margin-top: 0.35rem; margin-bottom: 1.5rem; }

        /* Submit */
        .dep-submit {
          width: 100%; padding: 1rem; border-radius: 12px;
          font-weight: 700; font-size: 1rem; font-family: inherit;
          border: none; cursor: pointer; transition: all 0.25s;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .dep-submit.ready {
          background: #ef4444; color: #fff;
          box-shadow: 0 4px 16px rgba(239,68,68,0.35);
        }
        .dep-submit.ready:hover { background: #dc2626; transform: translateY(-1px); }
        .dep-submit.disabled { background: rgba(255,255,255,0.06); color: #6b7280; cursor: not-allowed; }

        /* PIX box */
        .pix-amount { text-align: center; color: #16C75B; font-size: 2rem; font-weight: 900; margin-bottom: 0.25rem; }
        .pix-hint { text-align: center; color: #9ca3af; font-size: 0.85rem; margin-bottom: 1.25rem; }
        .pix-code-box {
          background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 1rem; margin-bottom: 1rem;
        }
        .pix-code-label { color: #9ca3af; font-size: 0.72rem; margin-bottom: 0.5rem; }
        .pix-code-text { color: #fff; font-size: 0.72rem; font-family: monospace; word-break: break-all; line-height: 1.5; }
        .pix-copy-btn {
          width: 100%; padding: 0.85rem; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.15); background: none; color: #fff;
          font-family: inherit; font-size: 0.9rem; cursor: pointer;
          transition: background 0.2s; margin-bottom: 0.75rem;
        }
        .pix-copy-btn:hover { background: rgba(255,255,255,0.08); }
        .pix-dev-btn {
          width: 100%; padding: 0.85rem; border-radius: 12px;
          background: #16C75B; color: #fff; border: none;
          font-family: inherit; font-size: 0.9rem; font-weight: 700;
          cursor: pointer; transition: background 0.2s;
        }
        .pix-dev-btn:hover { background: #12a84d; }
        .pix-dev-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .pix-note { text-align: center; color: rgba(255,255,255,0.25); font-size: 0.72rem; margin-top: 0.75rem; }
      `}</style>

      <div className="dep-page">
        <div className="dep-inner">
          <h1 className="dep-title">Recarregar Saldo</h1>
          <p className="dep-sub">Siga os passos abaixo para adicionar créditos à sua conta</p>

          {/* Steps */}
          <div className="dep-steps">
            <div className="dep-step">
              <div className={`step-num ${step === 1 ? "active" : "done"}`}>
                {step === 1 ? "1" : <i className="bi bi-check" />}
              </div>
              <span className="step-label">Valor</span>
            </div>
            <div className="step-line" />
            <div className="dep-step">
              <div className={`step-num ${step === 2 ? "active" : "inactive"}`}>2</div>
              <span className={`step-label ${step === 2 ? "" : "inactive"}`}>Confirmação</span>
            </div>
          </div>

          {/* Info cards */}
          <div className="dep-cards">
            <div className="dep-card">
              <div className="dep-card-label">Saldo Atual <i className="bi bi-currency-dollar" /></div>
              <div className="dep-card-value">R$ {fmt(balance)}</div>
              <div className="dep-card-sub">Disponível na conta</div>
            </div>
            <div className="dep-card highlight">
              <div className="dep-card-label">Saldo Após Recarga <i className="bi bi-clock" /></div>
              <div className="dep-card-value">R$ {fmt(balance + (finalAmount > 0 ? totalWithBonus : 0))}</div>
              <div className="dep-card-sub">
                {finalAmount > 0
                  ? hasBonus
                    ? <span style={{color:"#16C75B"}}>+R$ {fmt(finalAmount)} <span style={{background:"#16C75B",color:"#fff",borderRadius:"4px",padding:"1px 5px",fontSize:"0.68rem",fontWeight:800}}>+10% BÔNUS</span></span>
                    : `+R$ ${fmt(finalAmount)}`
                  : "Selecione um valor"}
              </div>
            </div>
          </div>

          {/* Main box */}
          <div className="dep-box">
            {step === 1 ? (
              <>
                <div className="dep-box-title">
                  <i className="bi bi-currency-dollar" /> Etapa 1: Escolha o valor
                </div>
                <div className="dep-box-sub">Selecione quanto deseja recarregar</div>

                <div className={`dep-selected${finalAmount > 0 ? " has-value" : ""}`}>
                  {finalAmount > 0 ? (
                    <span>
                      R$ {fmt(finalAmount)}
                      {hasBonus && (
                        <span style={{marginLeft:"0.6rem",background:"#16C75B",color:"#fff",borderRadius:"6px",padding:"2px 8px",fontSize:"0.7rem",fontWeight:800,verticalAlign:"middle"}}>
                          +10% BÔNUS = R$ {fmt(totalWithBonus)}
                        </span>
                      )}
                    </span>
                  ) : "Nenhum valor selecionado"}
                </div>

                <div className="dep-quick-label">Valores Rápidos</div>
                <div className="dep-quick">
                  {QUICK_AMOUNTS.map((v, i) => (
                    <button
                      key={v}
                      className={`dep-quick-btn${amount === v && !custom ? " active" : ""}`}
                      onClick={() => selectQuick(v)}
                      style={i === QUICK_AMOUNTS.length - 1 && QUICK_AMOUNTS.length % 3 !== 0 ? { gridColumn: "2" } : undefined}
                    >
                      R$ {v}
                    </button>
                  ))}
                </div>

                <div className="dep-slider-label">Ou ajuste o valor</div>
                <div className="dep-slider-wrap">
                  <input
                    type="range" min={MIN} max={MAX} step={5}
                    value={slider}
                    className="dep-slider"
                    style={{ "--pct": `${((slider - MIN) / (MAX - MIN)) * 100}%` } as React.CSSProperties}
                    onChange={(e) => handleSlider(Number(e.target.value))}
                  />
                </div>
                <div className="dep-slider-minmax">
                  <span>R$ {MIN}</span>
                  <span>R$ {MAX}</span>
                </div>

                <div className="dep-custom-label">Valor personalizado</div>
                <input
                  type="number" min={MIN} max={MAX}
                  placeholder="Ex: 50,00"
                  value={custom}
                  onChange={(e) => handleCustom(e.target.value)}
                  className="dep-custom-input"
                />
                <div className="dep-custom-hint">Mínimo: R$ {MIN},00 · Máximo: R$ {MAX},00</div>

                {depError && (
                  <div style={{ color: "#f87171", fontSize: ".85rem", marginTop: ".75rem", textAlign: "center" }}>
                    {depError}
                  </div>
                )}

                <button
                  className={`dep-submit${finalAmount >= MIN ? " ready" : " disabled"}`}
                  onClick={finalAmount >= MIN ? goToPix : undefined}
                  disabled={loading || finalAmount < MIN}
                >
                  {loading ? "Gerando PIX..." : hasBonus
                    ? `Pagar R$ ${fmt(finalAmount)} via PIX · Receber R$ ${fmt(totalWithBonus)}`
                    : `Pagar R$ ${finalAmount > 0 ? fmt(finalAmount) : "0,00"} via PIX`}
                  {!loading && <i className="bi bi-chevron-right" />}
                </button>
              </>
            ) : pix ? (
              <>
                <div className="dep-box-title">
                  <i className="bi bi-qr-code-scan" /> Detalhes do Pagamento
                </div>
                <div className="dep-box-sub">Escaneie o QR Code ou copie o código para pagar</div>

                {/* QR Code */}
                <div style={{display:"flex",justifyContent:"center",marginBottom:"1.25rem"}}>
                  <div style={{background:"#fff",padding:"12px",borderRadius:"12px",display:"inline-block"}}>
                    <img
                      src={pix.qrCodeImage || `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(pix.pixCode)}&size=180x180`}
                      alt="QR Code PIX"
                      width={180} height={180}
                      style={{display:"block"}}
                    />
                  </div>
                </div>

                {/* Código PIX */}
                <div className="pix-code-box">
                  <div className="pix-code-label">Código PIX Copia e Cola</div>
                  <div className="pix-code-text">{pix.pixCode}</div>
                </div>

                <button className="pix-copy-btn" onClick={() => navigator.clipboard.writeText(pix.pixCode)}>
                  <i className="bi bi-clipboard" style={{marginRight:"0.4rem"}} /> Copiar Código PIX
                </button>

                {/* Como pagar */}
                <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"1rem",marginBottom:"1rem"}}>
                  <div style={{color:"#fff",fontWeight:700,fontSize:"0.85rem",marginBottom:"0.6rem",display:"flex",alignItems:"center",gap:"0.4rem"}}>
                    <i className="bi bi-info-circle" style={{color:"#ef4444"}} /> Como pagar
                  </div>
                  {["Abra o app do seu banco","Escolha pagar com PIX","Escaneie o QR Code ou cole o código","Confirme o pagamento"].map((s,i)=>(
                    <div key={i} style={{color:"#9ca3af",fontSize:"0.82rem",marginBottom:"0.3rem"}}>
                      {i+1}. {s}
                    </div>
                  ))}
                  <div style={{color:"#16C75B",fontSize:"0.8rem",fontWeight:600,marginTop:"0.6rem"}}>
                    Após o pagamento, seu saldo será creditado automaticamente!
                  </div>
                </div>

                {/* Resumo */}
                <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:"0.9rem",marginBottom:"1rem"}}>
                  <div style={{display:"flex",justifyContent:"space-between",color:"#9ca3af",fontSize:"0.85rem",marginBottom:"0.4rem"}}>
                    <span>Valor:</span><span style={{color:"#fff"}}>R$ {fmt(pix.amount)}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:"0.95rem"}}>
                    <span style={{color:"#fff"}}>Total a receber:</span>
                    <span style={{color:"#ef4444"}}>R$ {fmt(hasBonus ? pix.amount * 1.1 : pix.amount)}</span>
                  </div>
                </div>

                {/* Aguardando pagamento */}
                <div style={{
                  background:"rgba(22,199,91,0.07)",
                  border:"1px solid rgba(22,199,91,0.25)",
                  borderRadius:"12px", padding:"1rem",
                  display:"flex", alignItems:"center", gap:"0.75rem",
                  marginBottom:"1rem"
                }}>
                  <div style={{
                    width:"10px", height:"10px", borderRadius:"50%",
                    background:"#16C75B", flexShrink:0,
                    boxShadow:"0 0 8px #16C75B",
                    animation:"pulse-dot 1.5s ease-in-out infinite"
                  }} />
                  <div>
                    <div style={{color:"#16C75B", fontWeight:700, fontSize:"0.85rem"}}>Aguardando pagamento</div>
                    <div style={{color:"#9ca3af", fontSize:"0.75rem", marginTop:"0.1rem"}}>
                      O saldo será creditado automaticamente após a confirmação
                    </div>
                  </div>
                </div>
                <style>{`@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }`}</style>

                {process.env.NEXT_PUBLIC_DEV_CONFIRM_TOKEN && (
                  <button className="pix-dev-btn" onClick={confirmDev} disabled={checking}>
                    {checking ? "Confirmando..." : "✅ [DEV] Simular pagamento recebido"}
                  </button>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
