"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  pixCode: string | null;
  createdAt: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:   { label: "Em análise",  color: "#f59e0b" },
  approved:  { label: "Aprovado",    color: "#16C75B" },
  completed: { label: "Concluído",   color: "#16C75B" },
  rejected:  { label: "Recusado",    color: "#ef4444" },
  cancelled: { label: "Cancelado",   color: "#6b7280" },
};

function statusOf(s: string) {
  return STATUS_LABEL[s] ?? { label: s, color: "#9ca3af" };
}

export default function TransacoesPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "deposit" | "withdrawal">("all");

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/entrar"); return; }
    });
    fetch("/api/transacoes").then(r => r.json()).then(d => {
      setTransactions(d.transactions ?? []);
      setLoading(false);
    });
  }, [router]);

  const fmt = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function fmtDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const visible = transactions.filter(t =>
    filter === "all" ? true :
    filter === "deposit" ? t.type === "deposit" :
    t.type === "withdrawal"
  );

  const totalDeposited = transactions.filter(t => t.type === "deposit" && (t.status === "approved" || t.status === "completed")).reduce((a, t) => a + t.amount, 0);
  const totalWithdrawn = transactions.filter(t => t.type === "withdrawal" && (t.status === "approved" || t.status === "completed")).reduce((a, t) => a + t.amount, 0);

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .tx{min-height:calc(100vh - 5rem);background:#080808;font-family:'Inter',sans-serif;padding:2.5rem 1rem 5rem;}
        .tx-wrap{max-width:680px;margin:0 auto;}

        .tx-back{display:inline-flex;align-items:center;gap:.5rem;color:#6b7280;font-size:.85rem;font-weight:600;text-decoration:none;margin-bottom:2rem;transition:color .2s;}
        .tx-back:hover{color:#fff;}

        .tx-title{color:#fff;font-size:1.5rem;font-weight:900;margin-bottom:.25rem;}
        .tx-sub{color:#6b7280;font-size:.85rem;margin-bottom:1.75rem;}

        /* summary */
        .tx-summary{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.5rem;}
        .tx-sum-card{border-radius:16px;padding:1.1rem 1.25rem;display:flex;align-items:center;gap:.85rem;}
        .tx-sum-icon{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;}
        .tx-sum-lbl{color:#6b7280;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.2rem;}
        .tx-sum-val{font-size:1.1rem;font-weight:900;}

        /* filter tabs */
        .tx-filters{display:flex;gap:.4rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:.3rem;margin-bottom:1rem;}
        .tx-filter{flex:1;padding:.55rem;border-radius:10px;border:none;background:none;color:#6b7280;font-weight:700;font-size:.82rem;cursor:pointer;font-family:inherit;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:.35rem;}
        .tx-filter.active{background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.2);}

        /* list */
        .tx-card{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:20px;overflow:hidden;}
        .tx-item{display:flex;align-items:center;gap:1rem;padding:1rem 1.25rem;border-bottom:1px solid rgba(255,255,255,.05);transition:background .15s;}
        .tx-item:last-child{border-bottom:none;}
        .tx-item:hover{background:rgba(255,255,255,.02);}
        .tx-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.05rem;flex-shrink:0;}
        .tx-info{flex:1;min-width:0;}
        .tx-type{color:#fff;font-size:.88rem;font-weight:700;margin-bottom:.2rem;}
        .tx-meta{color:#6b7280;font-size:.72rem;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;}
        .tx-status{font-size:.7rem;font-weight:700;padding:.15rem .55rem;border-radius:50px;background:rgba(255,255,255,.05);}
        .tx-amount{font-size:1rem;font-weight:900;white-space:nowrap;}

        /* empty */
        .tx-empty{text-align:center;padding:4rem 1rem;}
        .tx-empty-icon{font-size:3rem;color:#374151;margin-bottom:1rem;}
        .tx-empty h3{color:#6b7280;font-size:1rem;font-weight:700;margin-bottom:.4rem;}
        .tx-empty p{color:#374151;font-size:.82rem;}

        /* skeleton */
        .tx-skel{height:68px;border-radius:12px;background:rgba(255,255,255,.04);margin-bottom:.5rem;animation:pulse 1.4s ease-in-out infinite;}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}
      `}</style>

      <div className="tx">
        <div className="tx-wrap">

          <Link href="/perfil" className="tx-back">
            <i className="bi bi-arrow-left" /> Voltar ao perfil
          </Link>

          <div className="tx-title">Transações</div>
          <div className="tx-sub">Histórico completo de depósitos e saques</div>

          {/* Summary */}
          <div className="tx-summary">
            <div className="tx-sum-card" style={{ background: "rgba(22,199,91,.06)", border: "1px solid rgba(22,199,91,.12)" }}>
              <div className="tx-sum-icon" style={{ background: "rgba(22,199,91,.12)", color: "#16C75B" }}>
                <i className="bi bi-arrow-down-circle" />
              </div>
              <div>
                <div className="tx-sum-lbl">Depositado</div>
                <div className="tx-sum-val" style={{ color: "#16C75B" }}>R$ {fmt(totalDeposited)}</div>
              </div>
            </div>
            <div className="tx-sum-card" style={{ background: "rgba(239,68,68,.05)", border: "1px solid rgba(239,68,68,.1)" }}>
              <div className="tx-sum-icon" style={{ background: "rgba(239,68,68,.1)", color: "#ef4444" }}>
                <i className="bi bi-arrow-up-circle" />
              </div>
              <div>
                <div className="tx-sum-lbl">Sacado</div>
                <div className="tx-sum-val" style={{ color: "#ef4444" }}>R$ {fmt(totalWithdrawn)}</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="tx-filters">
            <button className={`tx-filter${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
              <i className="bi bi-list-ul" /> Todos
            </button>
            <button className={`tx-filter${filter === "deposit" ? " active" : ""}`} onClick={() => setFilter("deposit")}>
              <i className="bi bi-arrow-down-circle" /> Depósitos
            </button>
            <button className={`tx-filter${filter === "withdrawal" ? " active" : ""}`} onClick={() => setFilter("withdrawal")}>
              <i className="bi bi-arrow-up-circle" /> Saques
            </button>
          </div>

          {/* List */}
          {loading ? (
            <div>
              {[1,2,3].map(i => <div key={i} className="tx-skel" />)}
            </div>
          ) : visible.length === 0 ? (
            <div className="tx-card">
              <div className="tx-empty">
                <div className="tx-empty-icon"><i className="bi bi-inbox" /></div>
                <h3>Nenhuma transação encontrada</h3>
                <p>{filter === "all" ? "Você ainda não fez nenhuma movimentação." : filter === "deposit" ? "Você ainda não fez nenhum depósito." : "Você ainda não fez nenhum saque."}</p>
              </div>
            </div>
          ) : (
            <div className="tx-card">
              {visible.map(t => {
                const isDeposit = t.type === "deposit";
                const st = statusOf(t.status);
                const pixInfo = t.pixCode ? t.pixCode.split(":").slice(1).join(":") : null;
                return (
                  <div key={t.id} className="tx-item">
                    <div
                      className="tx-icon"
                      style={{
                        background: isDeposit ? "rgba(22,199,91,.08)" : "rgba(239,68,68,.08)",
                        color: isDeposit ? "#16C75B" : "#ef4444",
                      }}
                    >
                      <i className={`bi bi-arrow-${isDeposit ? "down" : "up"}-circle`} />
                    </div>
                    <div className="tx-info">
                      <div className="tx-type" style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                        {isDeposit ? "Depósito" : "Saque"}
                        {(t.status === "completed" || t.status === "approved") && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: ".25rem", fontSize: ".68rem", fontWeight: 700, color: "#16C75B", background: "rgba(22,199,91,.1)", border: "1px solid rgba(22,199,91,.2)", borderRadius: "50px", padding: ".1rem .5rem" }}>
                            <i className="bi bi-check-circle-fill" style={{ fontSize: ".65rem" }} /> Concluído
                          </span>
                        )}
                        {t.status === "pending" && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: ".25rem", fontSize: ".68rem", fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.18)", borderRadius: "50px", padding: ".1rem .5rem" }}>
                            <i className="bi bi-clock" style={{ fontSize: ".65rem" }} /> Em análise
                          </span>
                        )}
                        {(t.status === "rejected" || t.status === "cancelled") && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: ".25rem", fontSize: ".68rem", fontWeight: 700, color: "#ef4444", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.18)", borderRadius: "50px", padding: ".1rem .5rem" }}>
                            <i className="bi bi-x-circle" style={{ fontSize: ".65rem" }} /> {st.label}
                          </span>
                        )}
                      </div>
                      <div className="tx-meta">
                        <span>{fmtDate(t.createdAt)}</span>
                        {pixInfo && <><span>·</span><span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pixInfo}</span></>}
                      </div>
                    </div>
                    <div
                      className="tx-amount"
                      style={{ color: isDeposit ? "#16C75B" : "#ef4444" }}
                    >
                      {isDeposit ? "+" : "-"}R$ {fmt(t.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
