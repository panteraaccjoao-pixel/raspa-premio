"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User { name: string; email: string; balance: number; }

const PIX_TYPES = [
  { value: "cpf",    label: "CPF",       icon: "bi-person-badge",  placeholder: "000.000.000-00" },
  { value: "cnpj",   label: "CNPJ",      icon: "bi-building",      placeholder: "00.000.000/0000-00" },
  { value: "email",  label: "E-mail",    icon: "bi-envelope",      placeholder: "seu@email.com" },
  { value: "phone",  label: "Telefone",  icon: "bi-telephone",     placeholder: "+55 (00) 00000-0000" },
  { value: "random", label: "Aleatória", icon: "bi-shuffle",       placeholder: "Chave aleatória (UUID)" },
];

function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskCnpj(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 13);
  const local = d.startsWith("55") ? d : "55" + d;
  const n = local.slice(0, 13);
  return n
    .replace(/^(\d{2})(\d)/, "+$1 ($2")
    .replace(/\((\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function applyMask(type: string, raw: string) {
  if (type === "cpf")   return maskCpf(raw);
  if (type === "cnpj")  return maskCnpj(raw);
  if (type === "phone") return maskPhone(raw);
  return raw;
}

const QUICK_AMOUNTS = [20, 50, 100, 200, 500];
const MIN = 20;
const FEE = 5;

export default function SacarPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState(50);
  const [inputVal, setInputVal] = useState("50,00");
  const [pixType, setPixType] = useState("cpf");
  const [pixKey, setPixKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/entrar"); return; }
      setUser(d.user);
    });
  }, [router]);

  const fmt = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function handleInput(v: string) {
    const digits = v.replace(/\D/g, "");
    const num = parseInt(digits || "0") / 100;
    setInputVal(num.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
    setAmount(num);
  }

  function pickQuick(v: number) {
    setAmount(v);
    setInputVal(fmt(v));
  }

  async function submit() {
    setLoading(true); setError("");
    const res = await fetch("/api/saque", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, pixKey, pixKeyType: pixType }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) setDone(true);
    else setError(data.error || "Erro ao solicitar saque.");
  }

  const max = user?.balance ?? 0;
  const canProceed = amount >= MIN && amount <= max && !loading;
  const selectedType = PIX_TYPES.find(t => t.value === pixType)!;

  if (!user) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
      <div style={{ width:36, height:36, border:"3px solid #ef4444", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .sw{min-height:calc(100vh - 5rem);background:#080808;font-family:'Inter',sans-serif;padding:2.5rem 1rem 5rem;}

        .sw-wrap{max-width:520px;margin:0 auto;}

        /* back */
        .sw-back{display:inline-flex;align-items:center;gap:.5rem;color:#6b7280;font-size:.85rem;font-weight:600;text-decoration:none;margin-bottom:2rem;transition:color .2s;}
        .sw-back:hover{color:#fff;}

        /* steps */
        .sw-steps{display:flex;align-items:center;gap:.5rem;margin-bottom:2rem;}
        .sw-step{display:flex;align-items:center;gap:.4rem;font-size:.78rem;font-weight:700;}
        .sw-step-num{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:900;flex-shrink:0;}
        .sw-step.done .sw-step-num{background:#16C75B;color:#fff;}
        .sw-step.active .sw-step-num{background:#ef4444;color:#fff;}
        .sw-step.idle .sw-step-num{background:rgba(255,255,255,0.06);color:#6b7280;}
        .sw-step.done .sw-step-label,.sw-step.active .sw-step-label{color:#fff;}
        .sw-step.idle .sw-step-label{color:#6b7280;}
        .sw-step-line{flex:1;height:1px;background:rgba(255,255,255,.07);}

        /* balance card */
        .sw-bal{
          background:linear-gradient(135deg,rgba(239,68,68,0.08),rgba(127,29,29,0.04));
          border:1px solid rgba(239,68,68,0.15);
          border-radius:18px;padding:1.25rem 1.5rem;margin-bottom:1.25rem;
          display:flex;align-items:center;justify-content:space-between;
        }
        .sw-bal-left{display:flex;align-items:center;gap:.75rem;}
        .sw-bal-icon{width:42px;height:42px;border-radius:12px;background:rgba(22,199,91,0.1);display:flex;align-items:center;justify-content:center;color:#16C75B;font-size:1.1rem;}
        .sw-bal-lbl{color:#6b7280;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.2rem;}
        .sw-bal-val{color:#fff;font-size:1.3rem;font-weight:900;}
        .sw-bal-badge{background:rgba(22,199,91,.1);border:1px solid rgba(22,199,91,.2);color:#16C75B;font-size:.72rem;font-weight:700;padding:.25rem .7rem;border-radius:50px;}

        /* card */
        .sw-card{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:1.5rem;margin-bottom:1rem;}
        .sw-card-title{color:#fff;font-size:.95rem;font-weight:800;margin-bottom:1.25rem;display:flex;align-items:center;gap:.5rem;}
        .sw-card-title i{color:#ef4444;}

        /* quick amounts */
        .sw-quick{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1.25rem;}
        .sw-quick-btn{
          flex:1;min-width:70px;padding:.55rem;border-radius:10px;
          border:1px solid rgba(255,255,255,.08);
          background:rgba(255,255,255,.03);
          color:#9ca3af;font-size:.82rem;font-weight:700;font-family:inherit;
          cursor:pointer;transition:all .15s;
        }
        .sw-quick-btn:hover{border-color:rgba(239,68,68,.3);color:#fff;}
        .sw-quick-btn.active{background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.4);color:#ef4444;}
        .sw-quick-btn:disabled{opacity:.3;cursor:not-allowed;}

        /* amount input */
        .sw-amount-wrap{position:relative;margin-bottom:1rem;}
        .sw-amount-prefix{position:absolute;left:1rem;top:50%;transform:translateY(-50%);color:#6b7280;font-size:.9rem;font-weight:700;}
        .sw-amount-input{
          width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);
          border-radius:12px;padding:.9rem 1rem .9rem 3.2rem;
          color:#fff;font-size:1.4rem;font-weight:900;font-family:inherit;outline:none;
          transition:border-color .2s;
        }
        .sw-amount-input:focus{border-color:#ef4444;}

        /* pix type tabs */
        .sw-pix-types{display:flex;gap:.4rem;margin-bottom:1.25rem;overflow-x:auto;padding-bottom:.2rem;}
        .sw-pix-types::-webkit-scrollbar{display:none;}
        .sw-pix-type{
          display:flex;flex-direction:column;align-items:center;gap:.3rem;
          min-width:60px;padding:.55rem .5rem;border-radius:12px;
          border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);
          color:#6b7280;font-size:.65rem;font-weight:700;cursor:pointer;font-family:inherit;
          transition:all .15s;white-space:nowrap;
        }
        .sw-pix-type i{font-size:1rem;}
        .sw-pix-type:hover{border-color:rgba(239,68,68,.25);color:#fff;}
        .sw-pix-type.active{background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.35);color:#ef4444;}

        /* field */
        .sw-field{position:relative;margin-bottom:1rem;}
        .sw-field-icon{position:absolute;left:1rem;top:50%;transform:translateY(-50%);color:#4b5563;font-size:.9rem;pointer-events:none;}
        .sw-input{
          width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
          border-radius:12px;padding:.85rem 1rem .85rem 2.75rem;
          color:#fff;font-size:.9rem;font-family:inherit;outline:none;
          transition:border-color .2s;
        }
        .sw-input:focus{border-color:#ef4444;}
        .sw-input::placeholder{color:#374151;}

        /* summary */
        .sw-summary{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:1rem;margin-bottom:1.25rem;}
        .sw-summary-row{display:flex;justify-content:space-between;align-items:center;padding:.3rem 0;font-size:.83rem;}
        .sw-summary-row:not(:last-child){border-bottom:1px solid rgba(255,255,255,.05);}
        .sw-summary-row span:first-child{color:#6b7280;}
        .sw-summary-row span:last-child{color:#fff;font-weight:700;}
        .sw-summary-row.total span:last-child{color:#ef4444;font-size:1rem;font-weight:900;}

        /* slider */
        .sw-slider-wrap{margin-bottom:1.25rem;}
        .sw-slider-labels{display:flex;justify-content:space-between;font-size:.72rem;color:#6b7280;margin-bottom:.5rem;}
        .sw-slider{
          -webkit-appearance:none;appearance:none;
          width:100%;height:5px;border-radius:99px;outline:none;cursor:pointer;
          background:rgba(255,255,255,.07);
        }
        .sw-slider::-webkit-slider-thumb{
          -webkit-appearance:none;width:20px;height:20px;border-radius:50%;
          background:linear-gradient(135deg,#ef4444,#dc2626);
          box-shadow:0 0 0 3px rgba(239,68,68,.2),0 2px 8px rgba(239,68,68,.5);
          cursor:pointer;
        }
        .sw-slider::-moz-range-thumb{
          width:20px;height:20px;border-radius:50%;border:none;
          background:linear-gradient(135deg,#ef4444,#dc2626);
          box-shadow:0 0 0 3px rgba(239,68,68,.2),0 2px 8px rgba(239,68,68,.5);
          cursor:pointer;
        }
        .sw-net-preview{
          display:flex;justify-content:space-between;align-items:center;
          background:rgba(22,199,91,.05);border:1px solid rgba(22,199,91,.12);
          border-radius:10px;padding:.7rem 1rem;margin-bottom:1rem;font-size:.83rem;
        }
        .sw-net-preview span:first-child{color:#6b7280;}
        .sw-net-preview span:last-child{color:#16C75B;font-weight:800;}

        /* warning */
        .sw-warn{background:rgba(245,158,11,.05);border:1px solid rgba(245,158,11,.15);border-radius:12px;padding:.85rem 1rem;margin-bottom:1.25rem;display:flex;gap:.6rem;align-items:flex-start;}
        .sw-warn i{color:#f59e0b;font-size:.95rem;flex-shrink:0;margin-top:.05rem;}
        .sw-warn p{color:#9ca3af;font-size:.78rem;line-height:1.5;}
        .sw-warn strong{color:#f59e0b;}

        /* error */
        .sw-err{background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);border-radius:10px;padding:.65rem 1rem;margin-bottom:1rem;color:#f87171;font-size:.82rem;display:flex;align-items:center;gap:.5rem;}

        /* btn */
        .sw-btn{
          width:100%;padding:.95rem;border-radius:12px;border:none;
          font-weight:800;font-size:.95rem;font-family:inherit;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:.5rem;transition:all .2s;
        }
        .sw-btn-red{background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;box-shadow:0 4px 18px rgba(239,68,68,.35);}
        .sw-btn-red:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 24px rgba(239,68,68,.5);}
        .sw-btn-red:disabled{opacity:.4;cursor:not-allowed;transform:none;}
        .sw-btn-ghost{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:#9ca3af;}
        .sw-btn-ghost:hover{background:rgba(255,255,255,.07);color:#fff;}

        /* success */
        .sw-success{text-align:center;padding:2.5rem 1rem;}
        .sw-success-ring{
          width:90px;height:90px;border-radius:50%;margin:0 auto 1.5rem;
          background:rgba(22,199,91,.08);border:2px solid rgba(22,199,91,.25);
          display:flex;align-items:center;justify-content:center;
          color:#16C75B;font-size:2.5rem;
          animation:pop .4s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
        .sw-success h2{color:#fff;font-size:1.4rem;font-weight:900;margin-bottom:.5rem;}
        .sw-success p{color:#6b7280;font-size:.88rem;line-height:1.6;margin-bottom:2rem;}
        .sw-success-detail{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1rem;text-align:left;margin-bottom:1.5rem;}
        .sw-success-detail-row{display:flex;justify-content:space-between;padding:.35rem 0;font-size:.83rem;border-bottom:1px solid rgba(255,255,255,.05);}
        .sw-success-detail-row:last-child{border:none;}
        .sw-success-detail-row span:first-child{color:#6b7280;}
        .sw-success-detail-row span:last-child{color:#fff;font-weight:700;}

        @media(max-width:480px){.sw-pix-types{gap:.3rem;}}
      `}</style>

      <div className="sw">
        <div className="sw-wrap">

          <Link href="/perfil" className="sw-back">
            <i className="bi bi-arrow-left" /> Voltar ao perfil
          </Link>

          {/* Steps */}
          <div className="sw-steps">
            <div className={`sw-step ${step > 1 ? "done" : "active"}`}>
              <div className="sw-step-num">{step > 1 ? <i className="bi bi-check" /> : "1"}</div>
              <span className="sw-step-label">Valor</span>
            </div>
            <div className="sw-step-line" />
            <div className={`sw-step ${step === 2 ? (done ? "done" : "active") : "idle"}`}>
              <div className="sw-step-num">{done ? <i className="bi bi-check" /> : "2"}</div>
              <span className="sw-step-label">Chave PIX</span>
            </div>
          </div>

          {/* Balance */}
          <div className="sw-bal">
            <div className="sw-bal-left">
              <div className="sw-bal-icon"><i className="bi bi-wallet2" /></div>
              <div>
                <div className="sw-bal-lbl">Saldo disponível</div>
                <div className="sw-bal-val">R$ {fmt(max)}</div>
              </div>
            </div>
            <div className="sw-bal-badge">Disponível</div>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="sw-card">
              <div className="sw-card-title">
                <i className="bi bi-cash-coin" /> Quanto deseja sacar?
              </div>

              <div className="sw-quick">
                {QUICK_AMOUNTS.map(v => (
                  <button
                    key={v}
                    className={`sw-quick-btn${amount === v ? " active" : ""}`}
                    onClick={() => pickQuick(v)}
                    disabled={v > max}
                  >
                    R$ {v}
                  </button>
                ))}
                <button
                  className={`sw-quick-btn${amount === max && max > 0 ? " active" : ""}`}
                  onClick={() => pickQuick(max)}
                  disabled={max <= 0}
                >
                  Tudo
                </button>
              </div>

              <div className="sw-amount-wrap">
                <span className="sw-amount-prefix">R$</span>
                <input
                  className="sw-amount-input"
                  type="text"
                  inputMode="numeric"
                  value={inputVal}
                  onChange={e => handleInput(e.target.value)}
                />
              </div>

              {/* Slider */}
              {max >= MIN && (
                <div className="sw-slider-wrap">
                  <div className="sw-slider-labels">
                    <span>R$ {MIN}</span>
                    <span>R$ {fmt(max)}</span>
                  </div>
                  <input
                    className="sw-slider"
                    type="range"
                    min={MIN}
                    max={max}
                    step={1}
                    value={Math.min(Math.max(amount, MIN), max)}
                    style={{
                      background: `linear-gradient(to right, #ef4444 ${((Math.min(Math.max(amount, MIN), max) - MIN) / (max - MIN)) * 100}%, rgba(255,255,255,0.07) 0%)`,
                    }}
                    onChange={e => { const v = Number(e.target.value); setAmount(v); setInputVal(fmt(v)); }}
                  />
                </div>
              )}

              {/* Net preview */}
              {amount >= MIN && amount <= max && (
                <div className="sw-net-preview">
                  <span>Você receberá (após taxa)</span>
                  <span>R$ {fmt(Math.max(0, amount - FEE))}</span>
                </div>
              )}

              {amount > 0 && amount < MIN && (
                <div className="sw-err">
                  <i className="bi bi-exclamation-triangle" />
                  Valor mínimo de saque: R$ {MIN},00
                </div>
              )}
              {amount > max && (
                <div className="sw-err">
                  <i className="bi bi-exclamation-triangle" />
                  Valor maior que seu saldo disponível.
                </div>
              )}

              <div style={{ marginTop: ".75rem" }}>
                <button
                  className="sw-btn sw-btn-red"
                  onClick={() => setStep(2)}
                  disabled={!canProceed}
                >
                  Continuar <i className="bi bi-arrow-right" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && !done && (
            <>
              <div className="sw-card">
                <div className="sw-card-title">
                  <i className="bi bi-key" /> Informe sua chave PIX
                </div>

                {/* Type selector */}
                <div className="sw-pix-types">
                  {PIX_TYPES.map(t => (
                    <button
                      key={t.value}
                      className={`sw-pix-type${pixType === t.value ? " active" : ""}`}
                      onClick={() => { setPixType(t.value); setPixKey(""); }}
                    >
                      <i className={`bi ${t.icon}`} />
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Key input */}
                <div className="sw-field">
                  <i className={`bi ${selectedType.icon} sw-field-icon`} />
                  <input
                    className="sw-input"
                    type={pixType === "email" ? "email" : "text"}
                    inputMode={pixType === "cpf" || pixType === "cnpj" || pixType === "phone" ? "numeric" : "text"}
                    placeholder={selectedType.placeholder}
                    value={pixKey}
                    onChange={e => setPixKey(applyMask(pixType, e.target.value))}
                  />
                </div>

                {/* Summary */}
                <div className="sw-summary">
                  <div className="sw-summary-row">
                    <span>Tipo de chave</span>
                    <span>{selectedType.label}</span>
                  </div>
                  <div className="sw-summary-row">
                    <span>Valor solicitado</span>
                    <span>R$ {fmt(amount)}</span>
                  </div>
                  <div className="sw-summary-row">
                    <span>Taxa de processamento</span>
                    <span style={{ color: "#f87171" }}>- R$ {fmt(FEE)}</span>
                  </div>
                  <div className="sw-summary-row">
                    <span>Prazo estimado</span>
                    <span>Até 5 minutos</span>
                  </div>
                  <div className="sw-summary-row total">
                    <span>Você receberá</span>
                    <span>R$ {fmt(Math.max(0, amount - FEE))}</span>
                  </div>
                </div>

                <div className="sw-warn">
                  <i className="bi bi-info-circle-fill" />
                  <p>
                    Certifique-se de que a chave PIX é <strong>sua</strong>. Saques para chaves de terceiros não são permitidos e podem ser cancelados.
                  </p>
                </div>

                {error && (
                  <div className="sw-err">
                    <i className="bi bi-exclamation-triangle" /> {error}
                  </div>
                )}

                <div style={{ display: "flex", gap: ".75rem" }}>
                  <button className="sw-btn sw-btn-ghost" style={{ flex: "0 0 auto", width: "44px", padding: 0 }} onClick={() => { setStep(1); setError(""); }}>
                    <i className="bi bi-arrow-left" />
                  </button>
                  <button
                    className="sw-btn sw-btn-red"
                    onClick={submit}
                    disabled={!pixKey.trim() || loading}
                    style={{ flex: 1 }}
                  >
                    {loading ? <><span style={{ width:16,height:16,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block" }} /></> : <><i className="bi bi-check2-circle" /> Confirmar Saque</>}
                  </button>
                </div>
              </div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </>
          )}

          {/* ── SUCCESS ── */}
          {done && (
            <div className="sw-card">
              <div className="sw-success">
                <div className="sw-success-ring"><i className="bi bi-check-lg" /></div>
                <h2>Saque solicitado!</h2>
                <p>Seu saque foi registrado com sucesso e será processado em breve via PIX.</p>

                <div className="sw-success-detail">
                  <div className="sw-success-detail-row">
                    <span>Valor solicitado</span>
                    <span>R$ {fmt(amount)}</span>
                  </div>
                  <div className="sw-success-detail-row">
                    <span>Taxa de processamento</span>
                    <span style={{ color: "#f87171" }}>- R$ {fmt(FEE)}</span>
                  </div>
                  <div className="sw-success-detail-row">
                    <span>Valor recebido</span>
                    <span style={{ color: "#16C75B" }}>R$ {fmt(Math.max(0, amount - FEE))}</span>
                  </div>
                  <div className="sw-success-detail-row">
                    <span>Chave PIX</span>
                    <span style={{ maxWidth: "60%", textAlign: "right", wordBreak: "break-all" }}>{pixKey}</span>
                  </div>
                  <div className="sw-success-detail-row">
                    <span>Tipo</span>
                    <span>{selectedType.label}</span>
                  </div>
                  <div className="sw-success-detail-row">
                    <span>Prazo</span>
                    <span>Até 5 minutos</span>
                  </div>
                  <div className="sw-success-detail-row">
                    <span>Status</span>
                    <span style={{ color: "#f59e0b" }}>Em análise</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
                  <Link href="/transacoes" className="sw-btn sw-btn-red" style={{ textDecoration: "none" }}>
                    <i className="bi bi-arrow-left-right" /> Ver Transações
                  </Link>
                  <Link href="/" className="sw-btn sw-btn-ghost" style={{ textDecoration: "none" }}>
                    <i className="bi bi-house" /> Início
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
