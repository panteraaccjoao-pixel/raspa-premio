"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User { id: string; name: string; email: string; phone?: string; balance: number; }

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/entrar"); return; }
      setUser(d.user);
      setName(d.user.name);
      setPhone(d.user.phone ?? "");
    });
  }, [router]);

  const initials = user
    ? user.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : "";

  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const body: Record<string, string> = { name, phone };
    if (showPass && password) body.password = password;
    const res = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) { setMsg({ type: "ok", text: "Perfil atualizado!" }); setPassword(""); setShowPass(false); }
    else setMsg({ type: "err", text: "Erro ao atualizar." });
  }

  if (!user) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #ef4444", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}

        .pp{
          min-height:calc(100vh - 5rem);
          background:#080808;
          font-family:'Inter',sans-serif;
          padding-bottom:6rem;
        }

        /* ─── HERO BANNER ─── */
        .pp-hero{
          position:relative;
          padding:3.5rem 1.5rem 5rem;
          text-align:center;
          overflow:hidden;
        }
        .pp-hero-bg{
          position:absolute;inset:0;
          background:radial-gradient(ellipse 80% 60% at 50% 0%, rgba(239,68,68,0.18) 0%, transparent 70%);
          pointer-events:none;
        }
        .pp-hero-bg::after{
          content:'';position:absolute;inset:0;
          background:linear-gradient(to bottom, transparent 60%, #080808 100%);
        }
        .pp-avatar-ring{
          position:relative;display:inline-flex;align-items:center;justify-content:center;
          width:96px;height:96px;margin-bottom:1.25rem;
        }
        .pp-avatar-ring::before{
          content:'';position:absolute;inset:-3px;border-radius:50%;
          background:linear-gradient(135deg,#ef4444,#7f1d1d,#ef4444);
          animation:spin-ring 4s linear infinite;
        }
        @keyframes spin-ring{to{transform:rotate(360deg)}}
        .pp-avatar{
          position:relative;z-index:1;
          width:90px;height:90px;border-radius:50%;
          background:linear-gradient(135deg,#1a0000,#3f0000);
          border:3px solid #0a0a0a;
          display:flex;align-items:center;justify-content:center;
          font-size:1.8rem;font-weight:900;color:#ef4444;
          letter-spacing:0.02em;
        }
        .pp-hero-name{
          position:relative;z-index:1;
          font-size:1.6rem;font-weight:900;color:#fff;margin-bottom:0.3rem;
        }
        .pp-hero-email{
          position:relative;z-index:1;
          font-size:0.82rem;color:#6b7280;
        }
        .pp-hero-badge{
          position:relative;z-index:1;
          display:inline-flex;align-items:center;gap:0.4rem;
          background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);
          color:#ef4444;font-size:0.72rem;font-weight:700;
          padding:0.3rem 0.85rem;border-radius:50px;margin-top:0.75rem;
        }

        /* ─── CONTENT ─── */
        .pp-content{
          max-width:700px;margin:0 auto;padding:0 1rem;
          position:relative;margin-top:-2.5rem;z-index:2;
        }

        /* ─── STATS ─── */
        .pp-stats{
          display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;
          margin-bottom:1.5rem;
        }
        .pp-stat{
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:16px;padding:1.1rem;
          display:flex;flex-direction:column;gap:0.6rem;
          position:relative;overflow:hidden;
          transition:border-color .2s,transform .2s;
        }
        .pp-stat:hover{transform:translateY(-2px);}
        .pp-stat-glow{
          position:absolute;top:-20px;right:-20px;
          width:70px;height:70px;border-radius:50%;
          filter:blur(24px);opacity:0.12;
        }
        .pp-stat-icon{
          width:36px;height:36px;border-radius:10px;
          display:flex;align-items:center;justify-content:center;font-size:1rem;
        }
        .pp-stat-val{font-size:1.1rem;font-weight:900;color:#fff;}
        .pp-stat-lbl{font-size:0.68rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;}

        /* ─── TABS ─── */
        .pp-tabs{
          display:flex;gap:0.5rem;
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:14px;padding:0.35rem;
          margin-bottom:1rem;
        }
        .pp-tab{
          flex:1;padding:0.65rem;border-radius:10px;
          border:none;background:none;
          color:#6b7280;font-weight:600;font-size:0.85rem;
          cursor:pointer;transition:all .2s;font-family:inherit;
          display:flex;align-items:center;justify-content:center;gap:0.4rem;
        }
        .pp-tab.active{
          background:rgba(239,68,68,0.12);
          color:#ef4444;border:1px solid rgba(239,68,68,0.2);
        }

        /* ─── CARD ─── */
        .pp-card{
          background:rgba(255,255,255,0.025);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:20px;padding:1.75rem;
          margin-bottom:1rem;
        }

        /* ─── FIELD ─── */
        .pp-field-label{
          font-size:0.72rem;font-weight:700;color:#6b7280;
          text-transform:uppercase;letter-spacing:.05em;
          margin-bottom:0.4rem;
        }
        .pp-field{position:relative;margin-bottom:1.1rem;}
        .pp-field-icon{
          position:absolute;left:1rem;top:50%;transform:translateY(-50%);
          color:#4b5563;font-size:0.9rem;pointer-events:none;
        }
        .pp-input{
          width:100%;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:12px;
          padding:.85rem 1rem .85rem 2.75rem;
          color:#fff;font-size:0.9rem;font-family:inherit;
          outline:none;transition:border-color .2s,background .2s;
        }
        .pp-input:focus{border-color:#ef4444;background:rgba(239,68,68,0.05);}
        .pp-input:disabled{color:#374151;cursor:not-allowed;}
        .pp-input::placeholder{color:#374151;}

        /* ─── DIVIDER ─── */
        .pp-divider{
          display:flex;align-items:center;gap:0.75rem;
          margin:1.25rem 0;color:#374151;font-size:0.75rem;
        }
        .pp-divider::before,.pp-divider::after{
          content:'';flex:1;height:1px;background:rgba(255,255,255,0.06);
        }

        /* ─── BTN ─── */
        .pp-btn{
          width:100%;padding:.9rem;border-radius:12px;
          border:none;font-weight:700;font-size:0.95rem;font-family:inherit;
          cursor:pointer;transition:all .2s;
          display:flex;align-items:center;justify-content:center;gap:0.5rem;
        }
        .pp-btn-primary{
          background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;
          box-shadow:0 4px 18px rgba(239,68,68,0.35);
        }
        .pp-btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 24px rgba(239,68,68,0.5);}
        .pp-btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;}

        /* ─── SECURITY ─── */
        .pp-toggle-pass{
          background:none;border:none;padding:0;
          color:#ef4444;font-size:0.82rem;font-weight:600;
          cursor:pointer;font-family:inherit;
          display:inline-flex;align-items:center;gap:.4rem;
          margin-bottom:.85rem;
        }
        .pp-toggle-pass:hover{color:#dc2626;}

        /* ─── MSG ─── */
        .pp-msg{
          border-radius:10px;padding:.7rem 1rem;
          font-size:.82rem;font-weight:600;margin-bottom:1rem;
          display:flex;align-items:center;gap:.5rem;
        }
        .pp-msg.ok{background:rgba(22,199,91,.08);border:1px solid rgba(22,199,91,.2);color:#16C75B;}
        .pp-msg.err{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);color:#f87171;}

        /* ─── TIPS ─── */
        .pp-tips{
          margin-top:1.25rem;
          background:rgba(59,130,246,0.04);
          border:1px solid rgba(59,130,246,0.1);
          border-radius:14px;padding:1rem 1.1rem;
        }
        .pp-tips-title{
          color:#60a5fa;font-size:0.78rem;font-weight:700;
          margin-bottom:.6rem;display:flex;align-items:center;gap:.4rem;
        }
        .pp-tips ul{list-style:none;display:flex;flex-direction:column;gap:.3rem;}
        .pp-tips li{color:#6b7280;font-size:.78rem;display:flex;align-items:flex-start;gap:.5rem;}
        .pp-tips li::before{content:"✓";color:#60a5fa;font-weight:700;flex-shrink:0;margin-top:.05rem;}

        /* ─── QUICK LINKS ─── */
        .pp-actions{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;}
        .pp-action{
          background:rgba(255,255,255,0.025);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:16px;padding:1.1rem;
          display:flex;flex-direction:column;gap:.5rem;
          text-decoration:none;transition:all .2s;
        }
        .pp-action:hover{
          background:rgba(239,68,68,0.06);
          border-color:rgba(239,68,68,0.2);
          transform:translateY(-2px);
        }
        .pp-action-icon{
          width:38px;height:38px;border-radius:10px;
          background:rgba(239,68,68,0.1);
          display:flex;align-items:center;justify-content:center;
          color:#ef4444;font-size:1rem;
        }
        .pp-action-label{color:#fff;font-size:.85rem;font-weight:700;}
        .pp-action-sub{color:#6b7280;font-size:.72rem;}

        @media(max-width:500px){
          .pp-stats{grid-template-columns:1fr;}
          .pp-actions{grid-template-columns:1fr;}
        }
      `}</style>

      <div className="pp">

        {/* Hero */}
        <div className="pp-hero">
          <div className="pp-hero-bg" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="pp-avatar-ring">
              <div className="pp-avatar">{initials}</div>
            </div>
            <div className="pp-hero-name">{user.name}</div>
            <div className="pp-hero-email">{user.email}</div>
            <div>
              <span className="pp-hero-badge">
                <i className="bi bi-patch-check-fill" /> Conta Ativa
              </span>
            </div>
          </div>
        </div>

        <div className="pp-content">

          {/* Stats */}
          <div className="pp-stats">
            <div className="pp-stat" style={{ borderColor: "rgba(22,199,91,0.15)" }}>
              <div className="pp-stat-glow" style={{ background: "#16C75B" }} />
              <div className="pp-stat-icon" style={{ background: "rgba(22,199,91,0.1)", color: "#16C75B" }}>
                <i className="bi bi-wallet2" />
              </div>
              <div className="pp-stat-val">R$ {fmt(user.balance)}</div>
              <div className="pp-stat-lbl" style={{ color: "#16C75B" }}>Saldo</div>
            </div>
            <div className="pp-stat" style={{ borderColor: "rgba(99,102,241,0.15)" }}>
              <div className="pp-stat-glow" style={{ background: "#6366f1" }} />
              <div className="pp-stat-icon" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
                <i className="bi bi-arrow-down-circle" />
              </div>
              <div className="pp-stat-val">R$ 0,00</div>
              <div className="pp-stat-lbl" style={{ color: "#6366f1" }}>Depósitos</div>
            </div>
            <div className="pp-stat" style={{ borderColor: "rgba(245,158,11,0.15)" }}>
              <div className="pp-stat-glow" style={{ background: "#f59e0b" }} />
              <div className="pp-stat-icon" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                <i className="bi bi-arrow-up-circle" />
              </div>
              <div className="pp-stat-val">R$ 0,00</div>
              <div className="pp-stat-lbl" style={{ color: "#f59e0b" }}>Saques</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="pp-tabs">
            <button className={`pp-tab${activeTab === "info" ? " active" : ""}`} onClick={() => setActiveTab("info")}>
              <i className="bi bi-person" /> Informações
            </button>
            <button className={`pp-tab${activeTab === "security" ? " active" : ""}`} onClick={() => setActiveTab("security")}>
              <i className="bi bi-shield-lock" /> Segurança
            </button>
          </div>

          {/* Card */}
          <div className="pp-card">
            {msg && (
              <div className={`pp-msg ${msg.type}`}>
                <i className={`bi bi-${msg.type === "ok" ? "check-circle" : "exclamation-triangle"}`} />
                {msg.text}
              </div>
            )}

            <form onSubmit={save}>
              {activeTab === "info" ? (
                <>
                  <div className="pp-field">
                    <div className="pp-field-label">Nome completo</div>
                    <div style={{ position: "relative" }}>
                      <i className="bi bi-person pp-field-icon" />
                      <input className="pp-input" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" required />
                    </div>
                  </div>
                  <div className="pp-field">
                    <div className="pp-field-label">Telefone</div>
                    <div style={{ position: "relative" }}>
                      <i className="bi bi-telephone pp-field-icon" />
                      <input className="pp-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                  <div className="pp-field">
                    <div className="pp-field-label">E-mail</div>
                    <div style={{ position: "relative" }}>
                      <i className="bi bi-envelope pp-field-icon" />
                      <input className="pp-input" value={user.email} disabled />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: "12px", padding: "1rem" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "10px", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", fontSize: "1.1rem", flexShrink: 0 }}>
                        <i className="bi bi-shield-lock" />
                      </div>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.88rem" }}>Alterar Senha</div>
                        <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>Recomendamos trocar sua senha periodicamente</div>
                      </div>
                    </div>
                  </div>
                  <div className="pp-field">
                    <div className="pp-field-label">Nova senha</div>
                    <div style={{ position: "relative" }}>
                      <i className="bi bi-lock pp-field-icon" />
                      <input className="pp-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" minLength={8} />
                    </div>
                  </div>
                  <div className="pp-tips">
                    <div className="pp-tips-title"><i className="bi bi-info-circle" /> Dicas de Segurança</div>
                    <ul>
                      <li>Use letras maiúsculas, minúsculas e números</li>
                      <li>Nunca compartilhe sua senha</li>
                      <li>Evite datas de aniversário ou sequências simples</li>
                      <li>Use um e-mail válido para recuperação</li>
                    </ul>
                  </div>
                </>
              )}

              <div className="pp-divider">ou</div>

              <button className="pp-btn pp-btn-primary" type="submit" disabled={saving}>
                <i className="bi bi-check2-circle" />
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </form>
          </div>

          {/* Quick actions */}
          <div className="pp-actions">
            <Link href="/depositar" className="pp-action">
              <div className="pp-action-icon"><i className="bi bi-plus-circle" /></div>
              <div className="pp-action-label">Depositar</div>
              <div className="pp-action-sub">Adicionar saldo via PIX</div>
            </Link>
            <Link href="/sacar" className="pp-action">
              <div className="pp-action-icon"><i className="bi bi-dash-circle" /></div>
              <div className="pp-action-label">Sacar</div>
              <div className="pp-action-sub">Retirar seus ganhos</div>
            </Link>
            <Link href="/transacoes" className="pp-action">
              <div className="pp-action-icon"><i className="bi bi-arrow-left-right" /></div>
              <div className="pp-action-label">Transações</div>
              <div className="pp-action-sub">Histórico completo</div>
            </Link>
            <Link href="/apostas" className="pp-action">
              <div className="pp-action-icon"><i className="bi bi-controller" /></div>
              <div className="pp-action-label">Apostas</div>
              <div className="pp-action-sub">Seu histórico de jogos</div>
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
