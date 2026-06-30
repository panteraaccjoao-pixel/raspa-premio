"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type Tab = "dashboard" | "usuarios" | "recargas" | "saques" | "jogadas" | "banners" | "raspadinhas" | "ganhadores" | "premios";

interface Banner { id: string; imageUrl: string; link: string | null; objectFit: string; sortOrder: number; active: boolean; }
interface GameRow { id: string; name: string; price: number; maxPrize: number; description: string; imageUrl: string; category: string; }
interface Winner { id: string; imageUrl: string; name: string; value: number; badge: string; minutesAgo: number; sortOrder: number; active: boolean; }
interface UserRow { id: string; name: string; email: string; phone: string | null; balance: number; createdAt: string; }
interface Recarga { id: string; user: string; email: string; amount: number; status: string; createdAt: string; }
interface Saque { id: string; user: string; email: string; amount: number; pixKey: string; status: string; createdAt: string; }
interface Play { id: string; user: string; game: string; betAmount: number; prize: number; won: boolean; createdAt: string; }

const NAV: { key: Tab; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { key: "usuarios", label: "Usuários", icon: "bi-people-fill" },
  { key: "recargas", label: "Recargas", icon: "bi-wallet2" },
  { key: "saques", label: "Saques", icon: "bi-cash-stack" },
  { key: "jogadas", label: "Jogadas", icon: "bi-controller" },
  { key: "banners", label: "Banners", icon: "bi-images" },
  { key: "raspadinhas", label: "Raspadinhas", icon: "bi-grid-3x3-gap-fill" },
  { key: "ganhadores", label: "Ganhadores", icon: "bi-trophy-fill" },
  { key: "premios", label: "Catálogo de Prêmios", icon: "bi-gift-fill" },
];

const BRL = (n: number) => "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const fmtDate = (s: string) => new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

// Converte um arquivo de imagem em data-URI, redimensionando para não pesar no banco
function fileToDataUrl(file: File, maxW = 1920, removeDarkBg = false, asPng = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        if (removeDarkBg) {
          const data = ctx.getImageData(0, 0, w, h);
          for (let i = 0; i < data.data.length; i += 4) {
            const r = data.data[i], g = data.data[i+1], b = data.data[i+2];
            if (r < 60 && g < 60 && b < 60) data.data[i+3] = 0;
          }
          ctx.putImageData(data, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } else if (asPng) {
          resolve(canvas.toDataURL("image/png"));
        } else {
          resolve(canvas.toDataURL("image/jpeg", 0.97));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function UploadBtn({ onPick, removeDarkBg, asPng }: { onPick: (dataUrl: string) => void; removeDarkBg?: boolean; asPng?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button type="button" className="adm-btn ghost" disabled={busy} onClick={() => ref.current?.click()}>
        <i className="bi bi-upload" /> {busy ? "Enviandoâ€¦" : "Enviar foto"}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) {
            setBusy(true);
            try { onPick(await fileToDataUrl(f, 1920, removeDarkBg, asPng)); } catch {}
            setBusy(false);
          }
          e.target.value = "";
        }}
      />
    </>
  );
}

const FIT_OPTIONS = [
  { value: "cover",   label: "Preencher",  icon: "bi-fullscreen" },
  { value: "contain", label: "Mostrar tudo", icon: "bi-aspect-ratio" },
  { value: "fill",    label: "Esticar",    icon: "bi-arrows-fullscreen" },
];

function FitPicker({ imageUrl, value, onChange }: { imageUrl: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
      {FIT_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              flex: "1 1 140px",
              border: active ? "2px solid #ef4444" : "2px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              background: active ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.03)",
              cursor: "pointer",
              padding: "0.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.2s",
            }}
          >
            <div style={{
              width: "100%", height: 80, borderRadius: 8, overflow: "hidden",
              background: "#111",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {imageUrl ? (
                <img src={imageUrl} alt={opt.label} style={{ width: "100%", height: "100%", objectFit: opt.value as any }} />
              ) : (
                <i className={`bi ${opt.icon}`} style={{ fontSize: "1.8rem", color: "#555" }} />
              )}
            </div>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: active ? "#ef4444" : "#9ca3af" }}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const css = `
  .adm { font-family:'Inter',sans-serif; background:#0a0a0a; min-height:100vh; color:#fff; display:flex; }
  .adm * { box-sizing:border-box; }

  /* Sidebar (estilo REV) */
  .adm-side {
    position:fixed; left:0; top:0; height:100vh; width:256px;
    background:#101010; border-right:1px solid rgba(255,255,255,0.08);
    display:flex; flex-direction:column; z-index:40;
  }
  .adm-logo {
    display:flex; align-items:center; gap:0.6rem; height:64px;
    padding:0 1.5rem; border-bottom:1px solid rgba(255,255,255,0.08);
    font-weight:800; font-size:1.05rem; letter-spacing:-0.01em;
  }
  .adm-logo .box { width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#ef4444,#dc2626);display:flex;align-items:center;justify-content:center;font-size:0.9rem; }
  .adm-nav { flex:1; padding:1rem; display:flex; flex-direction:column; gap:0.25rem; overflow-y:auto; }
  .adm-navitem {
    display:flex; align-items:center; gap:0.75rem;
    padding:0.65rem 0.85rem; border-radius:10px; border:none; cursor:pointer;
    background:none; color:#9ca3af; font-family:inherit; font-weight:600; font-size:0.9rem;
    width:100%; text-align:left; transition:all 0.2s ease;
  }
  .adm-navitem:hover { background:rgba(255,255,255,0.05); color:#fff; }
  .adm-navitem.active { background:rgba(239,68,68,0.12); color:#ef4444; }
  .adm-navitem i { font-size:1.1rem; }
  .adm-side-foot { padding:1rem; border-top:1px solid rgba(255,255,255,0.08); }
  .adm-logout {
    display:flex; align-items:center; gap:0.75rem; width:100%;
    padding:0.65rem 0.85rem; border-radius:10px; border:none; cursor:pointer;
    background:none; color:#9ca3af; font-family:inherit; font-weight:600; font-size:0.9rem;
  }
  .adm-logout:hover { background:rgba(239,68,68,0.12); color:#ef4444; }

  /* Main */
  .adm-main { margin-left:256px; flex:1; padding:2rem; max-width:1200px; }
  .adm-pagehead { margin-bottom:1.5rem; }
  .adm-pagetitle { font-size:1.6rem; font-weight:800; }
  .adm-pagesub { color:#9ca3af; font-size:0.9rem; margin-top:0.25rem; }

  .adm-card { background:#141414; border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:1.25rem; margin-bottom:1rem; }
  .adm-card.new { border-color:rgba(239,68,68,0.25); }
  .adm-cardtitle { font-size:0.8rem; font-weight:700; color:#ef4444; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:1rem; }
  .adm-field { display:flex; flex-direction:column; gap:0.3rem; margin-bottom:0.85rem; }
  .adm-field label { font-size:0.78rem; color:#9ca3af; font-weight:600; }
  .adm-input, .adm-select, .adm-textarea {
    background:#0d0d0d; border:1px solid rgba(255,255,255,0.12);
    border-radius:9px; padding:0.6rem 0.75rem; color:#fff; font-size:0.9rem; font-family:inherit; width:100%;
  }
  .adm-textarea { resize:vertical; min-height:64px; }
  .adm-input:focus, .adm-select:focus, .adm-textarea:focus { outline:none; border-color:#ef4444; }
  .adm-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:0.85rem; }
  .adm-grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:0.85rem; }
  .adm-grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:0.85rem; }
  .adm-actions { display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap; margin-top:0.5rem; }
  .adm-btn { background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; border:none; padding:0.55rem 1.1rem; border-radius:9px; font-weight:700; cursor:pointer; font-family:inherit; font-size:0.86rem; display:inline-flex; align-items:center; gap:0.4rem; }
  .adm-btn:hover { box-shadow:0 4px 16px rgba(239,68,68,0.4); }
  .adm-btn.danger { background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.4); }
  .adm-btn.ghost { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); }
  .adm-btn.ghost:hover { background:rgba(255,255,255,0.1); box-shadow:none; }
  .adm-preview { width:96px; height:60px; border-radius:8px; object-fit:cover; border:1px solid rgba(255,255,255,0.1); background:#0d0d0d; flex-shrink:0; }
  .adm-preview-round { width:50px; height:50px; border-radius:50%; object-fit:cover; border:1px solid rgba(255,255,255,0.1); background:#0d0d0d; flex-shrink:0; }
  .adm-toggle { display:flex; align-items:center; gap:0.4rem; font-size:0.85rem; color:#e5e7eb; cursor:pointer; }
  .adm-saved { color:#22c55e; font-size:0.82rem; font-weight:600; }
  .adm-rowtop { display:flex; align-items:center; gap:0.75rem; margin-bottom:0.85rem; }

  /* Stat cards */
  .adm-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
  .adm-stat { background:#141414; border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:1.1rem 1.25rem; }
  .adm-stat .lbl { color:#9ca3af; font-size:0.8rem; font-weight:600; display:flex; align-items:center; gap:0.4rem; }
  .adm-stat .val { font-size:1.5rem; font-weight:800; margin-top:0.4rem; }
  .adm-stat .val.green { color:#22c55e; }
  .adm-stat .val.red { color:#ef4444; }

  /* Table */
  .adm-table { width:100%; border-collapse:collapse; font-size:0.86rem; }
  .adm-table th { text-align:left; color:#9ca3af; font-weight:600; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.03em; padding:0.6rem 0.75rem; border-bottom:1px solid rgba(255,255,255,0.1); }
  .adm-table td { padding:0.7rem 0.75rem; border-bottom:1px solid rgba(255,255,255,0.05); }
  .adm-table tr:hover td { background:rgba(255,255,255,0.02); }
  .adm-tablewrap { background:#141414; border:1px solid rgba(255,255,255,0.08); border-radius:14px; overflow-x:auto; }
  .adm-pill { font-size:0.7rem; font-weight:700; padding:0.2rem 0.6rem; border-radius:50px; text-transform:uppercase; }
  .adm-pill.ok { background:rgba(34,197,94,0.15); color:#22c55e; }
  .adm-pill.pend { background:rgba(245,158,11,0.15); color:#f59e0b; }
  .adm-pill.cancel { background:rgba(239,68,68,0.15); color:#ef4444; }
  .adm-inline-input { background:#0d0d0d; border:1px solid rgba(255,255,255,0.12); border-radius:7px; padding:0.35rem 0.5rem; color:#fff; font-size:0.82rem; font-family:inherit; width:90px; }
  .adm-mini { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#fff; padding:0.3rem 0.6rem; border-radius:7px; cursor:pointer; font-family:inherit; font-size:0.78rem; }
  .adm-mini:hover { background:rgba(239,68,68,0.15); }
  .adm-mini.green:hover { background:rgba(34,197,94,0.15); }
  .adm-search { background:#0d0d0d; border:1px solid rgba(255,255,255,0.12); border-radius:9px; padding:0.55rem 0.8rem; color:#fff; font-family:inherit; width:280px; max-width:100%; margin-bottom:1rem; }

  @media (max-width:860px){
    .adm-stats { grid-template-columns:1fr 1fr; }
    .adm-side { position:static; width:100%; height:auto; flex-direction:row; flex-wrap:wrap; }
    .adm-logo { width:100%; }
    .adm-nav { flex-direction:row; flex-wrap:wrap; }
    .adm-navitem { width:auto; }
    .adm-side-foot { border-top:none; }
    .adm-main { margin-left:0; padding:1.25rem; }
    .adm-grid2,.adm-grid3,.adm-grid4 { grid-template-columns:1fr; }
  }
`;

export default function AdminPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");

  async function logout() {
    await fetch("/api/9bkp/logout", { method: "POST" });
    router.push("/9bkp/login");
    router.refresh();
  }

  const sub = {
    dashboard: "Visão geral da plataforma",
    usuarios: "Gerencie contas e saldos",
    recargas: "Depósitos via PIX dos Usuários",
    saques: "Pedidos de saque — pague o PIX e marque como pago",
    jogadas: "Histórico de partidas",
    banners: "Gerencie as imagens do carrossel da home",
    raspadinhas: "Edite imagem, Título, valor e Descrição dos produtos",
    ganhadores: "Configure a lista de últimos ganhadores",
    premios: "Cadastre os prêmios uma vez e reutilize em várias raspadinhas",
  }[tab];

  return (
    <div className="adm">
      <style>{css}</style>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />

      {/* Sidebar */}
      <aside className="adm-side">
        <div className="adm-logo">
          <span className="box"><i className="bi bi-dice-3-fill" /></span>
          RaspaPrêmio
        </div>
        <nav className="adm-nav">
          {NAV.map((n) => (
            <button key={n.key} className={`adm-navitem ${tab === n.key ? "active" : ""}`} onClick={() => setTab(n.key)}>
              <i className={`bi ${n.icon}`} /> {n.label}
            </button>
          ))}
        </nav>
        <div className="adm-side-foot">
          <button className="adm-logout" onClick={logout}>
            <i className="bi bi-box-arrow-left" /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="adm-main">
        <div className="adm-pagehead">
          <div className="adm-pagetitle">{NAV.find((n) => n.key === tab)?.label}</div>
          <div className="adm-pagesub">{sub}</div>
        </div>
        {tab === "dashboard" && <DashboardTab />}
        {tab === "usuarios" && <UsuariosTab />}
        {tab === "recargas" && <RecargasTab />}
        {tab === "saques" && <SaquesTab />}
        {tab === "jogadas" && <JogadasTab />}
        {tab === "banners" && <BannersTab />}
        {tab === "raspadinhas" && <RaspadinhasTab />}
        {tab === "ganhadores" && <GanhadoresTab />}
        {tab === "premios" && <PremiosLibraryTab />}
      </main>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
interface StatsData {
  usuarios: number; faturamento: number; depositosPendentes: number; jogadas: number;
  totalApostado: number; totalPremios: number; margem: number; saldoTotal: number;
  recentUsers: { name: string; email: string; createdAt: string }[];
  recentDeps: { id: string; user: string; amount: number; status: string; createdAt: string }[];
}
function DashboardTab() {
  const [s, setS] = useState<StatsData | null>(null);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const r = await fetch("/api/9bkp/stats");
      const d = await r.json();
      if (alive) setS(d);
    };
    load();
    const t = setInterval(load, 8000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  if (!s) return <div className="adm-pagesub">Carregandoâ€¦</div>;

  const cards = [
    { lbl: "Usuários", icon: "bi-people", val: String(s.usuarios), cls: "" },
    { lbl: "Faturamento (Depósitos)", icon: "bi-cash-stack", val: BRL(s.faturamento), cls: "green" },
    { lbl: "Margem (apostas - Prêmios)", icon: "bi-graph-up-arrow", val: BRL(s.margem), cls: s.margem >= 0 ? "green" : "red" },
    { lbl: "Recargas pendentes", icon: "bi-hourglass-split", val: String(s.depositosPendentes), cls: "" },
    { lbl: "Jogadas", icon: "bi-controller", val: String(s.jogadas), cls: "" },
    { lbl: "Total apostado", icon: "bi-coin", val: BRL(s.totalApostado), cls: "" },
    { lbl: "Prêmios pagos", icon: "bi-trophy", val: BRL(s.totalPremios), cls: "red" },
    { lbl: "Saldo em contas", icon: "bi-wallet2", val: BRL(s.saldoTotal), cls: "" },
  ];

  return (
    <div>
      <div className="adm-stats">
        {cards.map((c) => (
          <div className="adm-stat" key={c.lbl}>
            <div className="lbl"><i className={`bi ${c.icon}`} /> {c.lbl}</div>
            <div className={`val ${c.cls}`}>{c.val}</div>
          </div>
        ))}
      </div>

      <div className="adm-grid2">
        <div>
          <div className="adm-cardtitle">Novos Usuários</div>
          <div className="adm-tablewrap">
            <table className="adm-table">
              <thead><tr><th>Nome</th><th>Email</th><th>Data</th></tr></thead>
              <tbody>
                {s.recentUsers.map((u, i) => (
                  <tr key={i}><td>{u.name}</td><td>{u.email}</td><td>{fmtDate(u.createdAt)}</td></tr>
                ))}
                {s.recentUsers.length === 0 && <tr><td colSpan={3} style={{ color: "#9ca3af" }}>Nenhum.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="adm-cardtitle">Recargas recentes</div>
          <div className="adm-tablewrap">
            <table className="adm-table">
              <thead><tr><th>Usuário</th><th>Valor</th><th>Status</th></tr></thead>
              <tbody>
                {s.recentDeps.map((d) => (
                  <tr key={d.id}>
                    <td>{d.user}</td><td>{BRL(d.amount)}</td>
                    <td><StatusPill status={d.status} /></td>
                  </tr>
                ))}
                {s.recentDeps.length === 0 && <tr><td colSpan={3} style={{ color: "#9ca3af" }}>Nenhuma.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "completed") return <span className="adm-pill ok">Aprovado</span>;
  if (status === "cancelled") return <span className="adm-pill cancel">Cancelado</span>;
  return <span className="adm-pill pend">Pendente</span>;
}

/* ---------------- Usuários ---------------- */
function UsuariosTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const load = useCallback(async (query = "") => {
    const r = await fetch(`/api/9bkp/users${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    const d = await r.json();
    setUsers(d.users || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function saveBalance(id: string, balance: number) {
    await fetch(`/api/9bkp/users/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ balance }) });
    load(q);
  }
  async function del(id: string) {
    if (!confirm("Excluir este Usuário e todos os dados dele?")) return;
    await fetch(`/api/9bkp/users/${id}`, { method: "DELETE" });
    load(q);
  }

  return (
    <div>
      <input className="adm-search" placeholder="Buscar por nome, email ou telefoneâ€¦" value={q}
        onChange={(e) => { setQ(e.target.value); load(e.target.value); }} />
      <div className="adm-tablewrap">
        <table className="adm-table">
          <thead><tr><th>Nome</th><th>Email</th><th>Telefone</th><th>Saldo</th><th>Cadastro</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => <UserRowEdit key={u.id} user={u} onSave={saveBalance} onDelete={del} />)}
            {users.length === 0 && <tr><td colSpan={6} style={{ color: "#9ca3af" }}>Nenhum Usuário.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserRowEdit({ user, onSave, onDelete }: { user: UserRow; onSave: (id: string, b: number) => void; onDelete: (id: string) => void; }) {
  const [bal, setBal] = useState(user.balance);
  useEffect(() => setBal(user.balance), [user.balance]);
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>{user.phone || "â€”"}</td>
      <td>
        <input className="adm-inline-input" type="number" step="0.01" value={bal} onChange={(e) => setBal(Number(e.target.value))} />
      </td>
      <td>{fmtDate(user.createdAt)}</td>
      <td style={{ whiteSpace: "nowrap" }}>
        <button className="adm-mini green" onClick={() => onSave(user.id, bal)} title="Salvar saldo"><i className="bi bi-check-lg" /></button>{" "}
        <button className="adm-mini" onClick={() => onDelete(user.id)} title="Excluir"><i className="bi bi-trash" /></button>
      </td>
    </tr>
  );
}

/* ---------------- Recargas ---------------- */
function RecargasTab() {
  const [items, setItems] = useState<Recarga[]>([]);
  const load = useCallback(async () => {
    const r = await fetch("/api/9bkp/recargas");
    const d = await r.json();
    setItems(d.recargas || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/9bkp/recargas/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  }

  return (
    <div className="adm-tablewrap">
      <table className="adm-table">
        <thead><tr><th>Usuário</th><th>Email</th><th>Valor</th><th>Status</th><th>Data</th><th>Ações</th></tr></thead>
        <tbody>
          {items.map((t) => (
            <tr key={t.id}>
              <td>{t.user}</td>
              <td>{t.email}</td>
              <td>{BRL(t.amount)}</td>
              <td><StatusPill status={t.status} /></td>
              <td>{fmtDate(t.createdAt)}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                {t.status !== "completed" && <><button className="adm-mini green" onClick={() => setStatus(t.id, "completed")}>Aprovar</button>{" "}</>}
                {t.status !== "cancelled" && <button className="adm-mini" onClick={() => setStatus(t.id, "cancelled")}>Cancelar</button>}
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6} style={{ color: "#9ca3af" }}>Nenhuma recarga.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Saques ---------------- */
function SaquesTab() {
  const [items, setItems] = useState<Saque[]>([]);
  const load = useCallback(async () => {
    const r = await fetch("/api/9bkp/saques");
    const d = await r.json();
    setItems(d.saques || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function setStatus(id: string, status: string) {
    if (status === "cancelled" && !confirm("Cancelar este saque e devolver o saldo ao Usuário?")) return;
    await fetch(`/api/9bkp/saques/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  }

  return (
    <div className="adm-tablewrap">
      <table className="adm-table">
        <thead><tr><th>Usuário</th><th>Chave PIX</th><th>Valor</th><th>Status</th><th>Data</th><th>Ações</th></tr></thead>
        <tbody>
          {items.map((t) => (
            <tr key={t.id}>
              <td>{t.user}<br /><span style={{ color: "#9ca3af", fontSize: ".8em" }}>{t.email}</span></td>
              <td style={{ fontFamily: "monospace", fontSize: ".85em", wordBreak: "break-all" }}>{t.pixKey}</td>
              <td>{BRL(t.amount)}</td>
              <td><StatusPill status={t.status} /></td>
              <td>{fmtDate(t.createdAt)}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                {t.status !== "completed" && <><button className="adm-mini green" onClick={() => setStatus(t.id, "completed")}>Marcar pago</button>{" "}</>}
                {t.status !== "cancelled" && <button className="adm-mini" onClick={() => setStatus(t.id, "cancelled")}>Cancelar</button>}
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6} style={{ color: "#9ca3af" }}>Nenhum saque.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Jogadas ---------------- */
function JogadasTab() {
  const [items, setItems] = useState<Play[]>([]);
  useEffect(() => {
    fetch("/api/9bkp/plays").then((r) => r.json()).then((d) => setItems(d.plays || []));
  }, []);
  return (
    <div className="adm-tablewrap">
      <table className="adm-table">
        <thead><tr><th>Usuário</th><th>Jogo</th><th>Aposta</th><th>Prêmio</th><th>Resultado</th><th>Data</th></tr></thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.user}</td>
              <td>{p.game}</td>
              <td>{BRL(p.betAmount)}</td>
              <td>{BRL(p.prize)}</td>
              <td>{p.won ? <span className="adm-pill ok">Ganhou</span> : <span className="adm-pill cancel">Perdeu</span>}</td>
              <td>{fmtDate(p.createdAt)}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6} style={{ color: "#9ca3af" }}>Nenhuma jogada.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Banners ---------------- */
function BannersTab() {
  const [items, setItems] = useState<Banner[]>([]);
  const [novo, setNovo] = useState({ imageUrl: "", link: "", objectFit: "cover", sortOrder: 0 });

  const load = useCallback(async () => {
    const r = await fetch("/api/9bkp/banners");
    const d = await r.json();
    setItems(d.banners || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!novo.imageUrl) return;
    await fetch("/api/9bkp/banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(novo) });
    setNovo({ imageUrl: "", link: "", objectFit: "cover", sortOrder: 0 });
    load();
  }
  async function save(b: Banner) {
    await fetch(`/api/9bkp/banners/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
    load();
  }
  async function del(id: string) {
    if (!confirm("Excluir este banner?")) return;
    await fetch(`/api/9bkp/banners/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="adm-card new">
        <div className="adm-cardtitle">Novo banner</div>
        <div className="adm-field">
          <label>Imagem do banner</label>
          <input className="adm-input" placeholder="Cole uma URL ou envie uma fotoâ€¦" value={novo.imageUrl} onChange={(e) => setNovo({ ...novo, imageUrl: e.target.value })} />
          <div className="adm-actions" style={{ marginTop: "0.5rem" }}>
            <UploadBtn onPick={(d) => setNovo({ ...novo, imageUrl: d })} />
          </div>
        </div>
        <div className="adm-field">
          <label>Enquadramento da imagem</label>
          <FitPicker imageUrl={novo.imageUrl} value={novo.objectFit} onChange={(v) => setNovo({ ...novo, objectFit: v })} />
        </div>
        <div className="adm-grid2">
          <div className="adm-field">
            <label>Link ao clicar (opcional)</label>
            <input className="adm-input" placeholder="/jogar/..." value={novo.link} onChange={(e) => setNovo({ ...novo, link: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Ordem</label>
            <input className="adm-input" type="number" value={novo.sortOrder} onChange={(e) => setNovo({ ...novo, sortOrder: Number(e.target.value) })} />
          </div>
        </div>
        <div className="adm-actions">
          {novo.imageUrl && <img className="adm-preview" src={novo.imageUrl} alt="" />}
          <button className="adm-btn" onClick={add}><i className="bi bi-plus-lg" /> Adicionar banner</button>
        </div>
      </div>

      <div className="adm-cardtitle" style={{ marginTop: "1.5rem" }}>
        Banners cadastrados ({items.length})
      </div>
      {items.length === 0 && (
        <div className="adm-card" style={{ color: "#9ca3af" }}>Nenhum banner cadastrado ainda.</div>
      )}
      {items.map((b) => <BannerRow key={b.id} banner={b} onSave={save} onDelete={del} />)}
    </div>
  );
}

function BannerRow({ banner, onSave, onDelete }: { banner: Banner; onSave: (b: Banner) => void; onDelete: (id: string) => void; }) {
  const [b, setB] = useState(banner);
  useEffect(() => setB(banner), [banner]);
  return (
    <div className="adm-card">
      <div className="adm-rowtop">
        <img className="adm-preview" src={b.imageUrl || ""} alt="" />
        <label className="adm-toggle">
          <input type="checkbox" checked={b.active} onChange={(e) => setB({ ...b, active: e.target.checked })} /> Ativo
        </label>
      </div>
      <div className="adm-field">
        <label>Imagem do banner</label>
        <input className="adm-input" value={b.imageUrl} onChange={(e) => setB({ ...b, imageUrl: e.target.value })} />
        <div className="adm-actions" style={{ marginTop: "0.5rem" }}>
          <UploadBtn onPick={(d) => setB({ ...b, imageUrl: d })} />
        </div>
      </div>
      <div className="adm-field">
        <label>Enquadramento da imagem</label>
        <FitPicker imageUrl={b.imageUrl} value={b.objectFit ?? "cover"} onChange={(v) => setB({ ...b, objectFit: v })} />
      </div>
      <div className="adm-grid2">
        <div className="adm-field">
          <label>Link</label>
          <input className="adm-input" value={b.link ?? ""} onChange={(e) => setB({ ...b, link: e.target.value })} />
        </div>
        <div className="adm-field">
          <label>Ordem</label>
          <input className="adm-input" type="number" value={b.sortOrder} onChange={(e) => setB({ ...b, sortOrder: Number(e.target.value) })} />
        </div>
      </div>
      <div className="adm-actions">
        <button className="adm-btn" onClick={() => onSave(b)}><i className="bi bi-check-lg" /> Salvar</button>
        <button className="adm-btn danger" onClick={() => onDelete(b.id)}><i className="bi bi-trash" /> Excluir</button>
      </div>
    </div>
  );
}

/* ---------------- Raspadinhas ---------------- */
const NOVO_GAME_DEFAULT = { name: "", price: 5, maxPrize: 1000, description: "", category: "DINHEIRO", imageUrl: "" };

function RaspadinhasTab() {
  const [items, setItems] = useState<GameRow[]>([]);
  const [novo, setNovo] = useState({ ...NOVO_GAME_DEFAULT });
  const load = useCallback(async () => {
    const r = await fetch("/api/9bkp/games");
    const d = await r.json();
    setItems(d.games || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(g: GameRow) {
    await fetch(`/api/9bkp/games/${g.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: g.imageUrl, category: g.category, name: g.name, price: g.price, maxPrize: g.maxPrize, description: g.description }),
    });
    load();
  }

  async function del(id: string) {
    if (!confirm("Remover esta raspadinha?")) return;
    await fetch(`/api/9bkp/games/${id}`, { method: "DELETE" });
    load();
  }

  async function add() {
    if (!novo.name) return;
    await fetch("/api/9bkp/games", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(novo) });
    setNovo({ ...NOVO_GAME_DEFAULT });
    load();
  }

  return (
    <div>
      <div className="adm-card new">
        <div className="adm-cardtitle">Nova Raspadinha</div>
        <div className="adm-grid2">
          <div className="adm-field">
            <label>Título</label>
            <input className="adm-input" placeholder="Ex: Raspa Milionário" value={novo.name} onChange={(e) => setNovo({ ...novo, name: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Imagem</label>
            <input className="adm-input" placeholder="https://... ou envie abaixo" value={novo.imageUrl} onChange={(e) => setNovo({ ...novo, imageUrl: e.target.value })} />
            <div className="adm-actions" style={{ marginTop: "0.5rem" }}>
              <UploadBtn onPick={(d) => setNovo({ ...novo, imageUrl: d })} />
            </div>
          </div>
        </div>
        <div className="adm-grid2">
          <div className="adm-field">
            <label>Valor (R$)</label>
            <input className="adm-input" type="number" step="0.01" value={novo.price} onChange={(e) => setNovo({ ...novo, price: Number(e.target.value) })} />
          </div>
          <div className="adm-field">
            <label>Prêmio máx. (R$)</label>
            <input className="adm-input" type="number" value={novo.maxPrize} onChange={(e) => setNovo({ ...novo, maxPrize: Number(e.target.value) })} />
          </div>
        </div>
        <div className="adm-grid2">
          <div className="adm-field">
            <label>Categoria</label>
            <select className="adm-select" value={novo.category} onChange={(e) => setNovo({ ...novo, category: e.target.value })}>
              <option value="DINHEIRO">DINHEIRO</option>
              <option value="PRODUTOS">PRODUTOS</option>
            </select>
          </div>
          <div className="adm-field">
            <label>Descrição</label>
            <input className="adm-input" placeholder="Descrição breve" value={novo.description} onChange={(e) => setNovo({ ...novo, description: e.target.value })} />
          </div>
        </div>
        <div className="adm-actions">
          {novo.imageUrl && <img className="adm-preview" src={novo.imageUrl} alt="" />}
          <button className="adm-btn" onClick={add}><i className="bi bi-plus-lg" /> Adicionar raspadinha</button>
        </div>
      </div>

      {items.map((g) => <GameRowEdit key={g.id} game={g} onSave={save} onDelete={del} />)}
    </div>
  );
}

interface GamePrize { id: string; label: string; value: number; imageUrl: string; sortOrder: number; active: boolean; }
interface LibPrize { id: string; label: string; value: number; imageUrl: string; sortOrder: number; }

/* ---------------- Catálogo global de Prêmios ---------------- */
function PremiosLibraryTab() {
  const [prizes, setPrizes] = useState<LibPrize[]>([]);
  const [novo, setNovo] = useState({ label: "", value: 0, imageUrl: "", sortOrder: 0 });

  const load = useCallback(async () => {
    const r = await fetch("/api/9bkp/prize-library");
    const d = await r.json();
    setPrizes(d.prizes || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!novo.label) return;
    await fetch("/api/9bkp/prize-library", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(novo) });
    setNovo({ label: "", value: 0, imageUrl: "", sortOrder: 0 });
    load();
  }
  async function del(id: string) {
    await fetch(`/api/9bkp/prize-library/${id}`, { method: "DELETE" });
    load();
  }
  async function update(p: LibPrize) {
    await fetch(`/api/9bkp/prize-library/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
    load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
      <div style={{ background: "rgba(22,199,91,.05)", border: "1px solid rgba(22,199,91,.12)", borderRadius: 10, padding: ".75rem" }}>
        <div style={{ color: "#16C75B", fontWeight: 700, fontSize: ".8rem", marginBottom: ".5rem" }}>+ Novo Prêmio no Catálogo</div>
        <div className="adm-grid2">
          <div className="adm-field"><label>Nome do Prêmio</label><input className="adm-input" placeholder="Ex: Honda PCX 2025" value={novo.label} onChange={e => setNovo({ ...novo, label: e.target.value })} /></div>
          <div className="adm-field"><label>Valor (R$)</label><input className="adm-input" type="number" value={novo.value} onChange={e => setNovo({ ...novo, value: Number(e.target.value) })} /></div>
        </div>
        <div className="adm-field" style={{ marginBottom: ".5rem" }}>
          <label>Foto do Prêmio</label>
          <input className="adm-input" placeholder="https://... ou envie uma imagem" value={novo.imageUrl} onChange={e => setNovo({ ...novo, imageUrl: e.target.value })} />
          <div style={{ marginTop: ".4rem" }}><UploadBtn onPick={d => setNovo({ ...novo, imageUrl: d })} asPng /></div>
        </div>
        {novo.imageUrl && <img src={novo.imageUrl} alt="" style={{ height: 60, borderRadius: 6, marginBottom: ".5rem", objectFit: "cover" }} />}
        <button className="adm-btn" onClick={add}><i className="bi bi-plus-lg" /> Adicionar ao Catálogo</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: ".75rem" }}>
        {prizes.map(p => <LibPrizeRowEdit key={p.id} prize={p} onSave={update} onDelete={del} />)}
      </div>
      {prizes.length === 0 && <div className="adm-pagesub">Nenhum prêmio cadastrado ainda.</div>}
    </div>
  );
}

function LibPrizeRowEdit({ prize, onSave, onDelete }: { prize: LibPrize; onSave: (p: LibPrize) => void; onDelete: (id: string) => void; }) {
  const [p, setP] = useState(prize);
  useEffect(() => setP(prize), [prize]);
  return (
    <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10, padding: ".65rem .75rem", display: "flex", flexDirection: "column", gap: ".5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
        {p.imageUrl && <img src={p.imageUrl} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />}
        <div style={{ flex: 1 }}>
          <input className="adm-input" value={p.label} onChange={e => setP({ ...p, label: e.target.value })} style={{ marginBottom: ".3rem" }} />
          <input className="adm-input" type="number" value={p.value} onChange={e => setP({ ...p, value: Number(e.target.value) })} placeholder="Valor R$" />
        </div>
      </div>
      <div className="adm-field">
        <input className="adm-input" placeholder="URL da foto" value={p.imageUrl} onChange={e => setP({ ...p, imageUrl: e.target.value })} />
        <div style={{ marginTop: ".3rem" }}><UploadBtn onPick={d => setP({ ...p, imageUrl: d })} asPng /></div>
      </div>
      <div className="adm-actions">
        <button className="adm-btn" onClick={() => onSave(p)}><i className="bi bi-check-lg" /> Salvar</button>
        <button className="adm-btn danger" onClick={() => onDelete(p.id)}><i className="bi bi-trash" /> Remover</button>
      </div>
    </div>
  );
}

function PrizesSection({ gameId }: { gameId: string }) {
  const [prizes, setPrizes] = useState<GamePrize[]>([]);
  const [lib, setLib] = useState<LibPrize[]>([]);
  const [open, setOpen] = useState(false);
  const [novo, setNovo] = useState({ label: "", value: 0, imageUrl: "", sortOrder: 0 });
  const [libPick, setLibPick] = useState("");

  const load = useCallback(async () => {
    const r = await fetch(`/api/9bkp/prizes?gameId=${gameId}`);
    const d = await r.json();
    setPrizes(d.prizes || []);
  }, [gameId]);

  const loadLib = useCallback(async () => {
    const r = await fetch("/api/9bkp/prize-library");
    const d = await r.json();
    setLib(d.prizes || []);
  }, []);

  useEffect(() => { if (open) { load(); loadLib(); } }, [open, load, loadLib]);

  function pickFromLib(id: string) {
    setLibPick(id);
    const p = lib.find(l => l.id === id);
    if (p) setNovo({ label: p.label, value: p.value, imageUrl: p.imageUrl, sortOrder: 0 });
  }

  async function add() {
    if (!novo.label) return;
    await fetch("/api/9bkp/prizes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...novo, gameId }) });
    setNovo({ label: "", value: 0, imageUrl: "", sortOrder: 0 });
    setLibPick("");
    load();
  }
  async function del(id: string) {
    await fetch(`/api/9bkp/prizes/${id}`, { method: "DELETE" });
    load();
  }
  async function update(p: GamePrize) {
    await fetch(`/api/9bkp/prizes/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
    load();
  }

  return (
    <div style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: "1rem" }}>
      <button className="adm-btn" style={{ background: "rgba(22,199,91,.1)", color: "#16C75B", border: "1px solid rgba(22,199,91,.2)" }} onClick={() => setOpen(o => !o)}>
        <i className="bi bi-gift" /> {open ? "Fechar Prêmios" : `Gerenciar Prêmios (${prizes.length || "?"})`}
      </button>
      {open && (
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: ".75rem" }}>
          {/* Novo Prêmio */}
          <div style={{ background: "rgba(22,199,91,.05)", border: "1px solid rgba(22,199,91,.12)", borderRadius: 10, padding: ".75rem" }}>
            <div style={{ color: "#16C75B", fontWeight: 700, fontSize: ".8rem", marginBottom: ".5rem" }}>+ Novo Prêmio</div>
            <div className="adm-field" style={{ marginBottom: ".5rem" }}>
              <label>Usar do Catálogo</label>
              {lib.length > 0 ? (
                <select className="adm-input" value={libPick} onChange={e => pickFromLib(e.target.value)}>
                  <option value="">— escolher prêmio cadastrado —</option>
                  {lib.map(l => <option key={l.id} value={l.id}>{l.label} (R$ {l.value.toLocaleString("pt-BR")})</option>)}
                </select>
              ) : (
                <div className="adm-pagesub">Nenhum prêmio no catálogo ainda — cadastre em &quot;Catálogo de Prêmios&quot; no menu lateral.</div>
              )}
            </div>
            <div className="adm-grid2">
              <div className="adm-field"><label>Nome do Prêmio</label><input className="adm-input" placeholder="Ex: Honda PCX 2025" value={novo.label} onChange={e => setNovo({ ...novo, label: e.target.value })} /></div>
              <div className="adm-field"><label>Valor (R$)</label><input className="adm-input" type="number" value={novo.value} onChange={e => setNovo({ ...novo, value: Number(e.target.value) })} /></div>
            </div>
            <div className="adm-field" style={{ marginBottom: ".5rem" }}>
              <label>Foto do Prêmio</label>
              <input className="adm-input" placeholder="https://... ou envie uma imagem" value={novo.imageUrl} onChange={e => setNovo({ ...novo, imageUrl: e.target.value })} />
              <div style={{ marginTop: ".4rem" }}><UploadBtn onPick={d => setNovo({ ...novo, imageUrl: d })} asPng /></div>
            </div>
            {novo.imageUrl && <img src={novo.imageUrl} alt="" style={{ height: 60, borderRadius: 6, marginBottom: ".5rem", objectFit: "cover" }} />}
            <button className="adm-btn" onClick={add}><i className="bi bi-plus-lg" /> Adicionar</button>
          </div>
          {/* Lista */}
          {prizes.map(p => <PrizeRowEdit key={p.id} prize={p} onSave={update} onDelete={del} />)}
        </div>
      )}
    </div>
  );
}

function PrizeRowEdit({ prize, onSave, onDelete }: { prize: GamePrize; onSave: (p: GamePrize) => void; onDelete: (id: string) => void; }) {
  const [p, setP] = useState(prize);
  useEffect(() => setP(prize), [prize]);
  return (
    <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10, padding: ".65rem .75rem", display: "flex", flexDirection: "column", gap: ".5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
        {p.imageUrl && <img src={p.imageUrl} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />}
        <div style={{ flex: 1 }}>
          <input className="adm-input" value={p.label} onChange={e => setP({ ...p, label: e.target.value })} style={{ marginBottom: ".3rem" }} />
          <input className="adm-input" type="number" value={p.value} onChange={e => setP({ ...p, value: Number(e.target.value) })} placeholder="Valor R$" />
        </div>
      </div>
      <div className="adm-field">
        <input className="adm-input" placeholder="URL da foto" value={p.imageUrl} onChange={e => setP({ ...p, imageUrl: e.target.value })} />
        <div style={{ marginTop: ".3rem" }}><UploadBtn onPick={d => setP({ ...p, imageUrl: d })} asPng /></div>
      </div>
      <div className="adm-actions">
        <button className="adm-btn" onClick={() => onSave(p)}><i className="bi bi-check-lg" /> Salvar</button>
        <button className="adm-btn danger" onClick={() => onDelete(p.id)}><i className="bi bi-trash" /> Remover</button>
      </div>
    </div>
  );
}

function GameRowEdit({ game, onSave, onDelete }: { game: GameRow; onSave: (g: GameRow) => Promise<void>; onDelete: (id: string) => Promise<void>; }) {
  const [g, setG] = useState(game);
  const [saved, setSaved] = useState(false);
  useEffect(() => setG(game), [game]);
  return (
    <div className="adm-card">
      <div className="adm-rowtop">
        <img className="adm-preview" src={g.imageUrl || ""} alt="" />
        <div>
          <div style={{ fontWeight: 800 }}>{g.name}</div>
          <div className="adm-pagesub">id: {g.id} · Prêmio máx. R$ {g.maxPrize.toLocaleString("pt-BR")}</div>
        </div>
      </div>
      <div className="adm-grid2">
        <div className="adm-field">
          <label>Título</label>
          <input className="adm-input" value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} />
        </div>
        <div className="adm-field">
          <label>URL da imagem</label>
          <input className="adm-input" placeholder="https://... ou envie abaixo" value={g.imageUrl} onChange={(e) => setG({ ...g, imageUrl: e.target.value })} />
          <div className="adm-actions" style={{ marginTop: "0.5rem" }}>
            <UploadBtn onPick={(d) => setG({ ...g, imageUrl: d })} removeDarkBg />
          </div>
        </div>
      </div>
      <div className="adm-grid2">
        <div className="adm-field">
          <label>Valor (R$)</label>
          <input className="adm-input" type="number" step="0.01" value={g.price} onChange={(e) => setG({ ...g, price: Number(e.target.value) })} />
        </div>
        <div className="adm-field">
          <label>Prêmio máx. (R$)</label>
          <input className="adm-input" type="number" value={g.maxPrize} onChange={(e) => setG({ ...g, maxPrize: Number(e.target.value) })} />
        </div>
      </div>
      <div className="adm-grid2">
        <div className="adm-field">
          <label>Categoria</label>
          <select className="adm-select" value={g.category} onChange={(e) => setG({ ...g, category: e.target.value })}>
            <option value="DINHEIRO">DINHEIRO</option>
            <option value="PRODUTOS">PRODUTOS</option>
          </select>
        </div>
        <div className="adm-field">
          <label>Descrição</label>
          <textarea className="adm-textarea" value={g.description} onChange={(e) => setG({ ...g, description: e.target.value })} />
        </div>
      </div>
      <div className="adm-actions">
        <button className="adm-btn" onClick={async () => { await onSave(g); setSaved(true); setTimeout(() => setSaved(false), 1500); }}>
          <i className="bi bi-check-lg" /> Salvar
        </button>
        <button className="adm-btn danger" onClick={() => onDelete(g.id)}>
          <i className="bi bi-trash" /> Remover
        </button>
        {saved && <span className="adm-saved"><i className="bi bi-check-circle-fill" /> Salvo!</span>}
      </div>
      <PrizesSection gameId={g.id} />
    </div>
  );
}

/* ---------------- Ganhadores ---------------- */
function GanhadoresTab() {
  const [items, setItems] = useState<Winner[]>([]);
  const [novo, setNovo] = useState({ imageUrl: "", name: "", value: 0, badge: "PIX", minutesAgo: 5, sortOrder: 0 });

  const load = useCallback(async () => {
    const r = await fetch("/api/9bkp/winners");
    const d = await r.json();
    setItems(d.winners || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!novo.name) return;
    await fetch("/api/9bkp/winners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(novo) });
    setNovo({ imageUrl: "", name: "", value: 0, badge: "PIX", minutesAgo: 5, sortOrder: 0 });
    load();
  }
  async function save(w: Winner) {
    await fetch(`/api/9bkp/winners/${w.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(w) });
    load();
  }
  async function del(id: string) {
    if (!confirm("Excluir este ganhador?")) return;
    await fetch(`/api/9bkp/winners/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PremiosDistribuidos />

      <div className="adm-card new">
        <div className="adm-cardtitle">Novo ganhador</div>
        <div className="adm-grid2">
          <div className="adm-field">
            <label>URL da foto do Prêmio</label>
            <input className="adm-input" placeholder="https://... ou envie abaixo" value={novo.imageUrl} onChange={(e) => setNovo({ ...novo, imageUrl: e.target.value })} />
            <div className="adm-actions" style={{ marginTop: "0.5rem" }}>
              <UploadBtn onPick={(d) => setNovo({ ...novo, imageUrl: d })} removeDarkBg />
            </div>
          </div>
          <div className="adm-field">
            <label>Nome (mascarado)</label>
            <input className="adm-input" placeholder="***j*****" value={novo.name} onChange={(e) => setNovo({ ...novo, name: e.target.value })} />
          </div>
        </div>
        <div className="adm-grid4">
          <div className="adm-field">
            <label>Valor (R$)</label>
            <input className="adm-input" type="number" value={novo.value} onChange={(e) => setNovo({ ...novo, value: Number(e.target.value) })} />
          </div>
          <div className="adm-field">
            <label>Badge</label>
            <select className="adm-select" value={novo.badge} onChange={(e) => setNovo({ ...novo, badge: e.target.value })}>
              <option value="PIX">PIX</option>
              <option value="PREMIO">PRÃŠMIO</option>
            </select>
          </div>
          <div className="adm-field">
            <label>Há quantos min</label>
            <input className="adm-input" type="number" value={novo.minutesAgo} onChange={(e) => setNovo({ ...novo, minutesAgo: Number(e.target.value) })} />
          </div>
          <div className="adm-field">
            <label>Ordem</label>
            <input className="adm-input" type="number" value={novo.sortOrder} onChange={(e) => setNovo({ ...novo, sortOrder: Number(e.target.value) })} />
          </div>
        </div>
        <div className="adm-actions">
          {novo.imageUrl && <img className="adm-preview-round" src={novo.imageUrl} alt="" />}
          <button className="adm-btn" onClick={add}><i className="bi bi-plus-lg" /> Adicionar ganhador</button>
        </div>
      </div>

      {items.map((w) => <WinnerRow key={w.id} winner={w} onSave={save} onDelete={del} />)}
    </div>
  );
}

function PremiosDistribuidos() {
  const [value, setValue] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/9bkp/settings").then((r) => r.json()).then((d) => {
      setValue(String(d.winnersTotal ?? 0));
      setLoaded(true);
    });
  }, []);

  async function save() {
    const num = parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
    await fetch("/api/9bkp/settings", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnersTotal: num }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="adm-card new">
      <div className="adm-cardtitle">Prêmios Distribuídos (total exibido na home)</div>
      <div className="adm-grid2">
        <div className="adm-field">
          <label>Valor (R$)</label>
          <input
            className="adm-input"
            type="text"
            inputMode="decimal"
            placeholder="Ex: 35273,50"
            value={loaded ? value : ""}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div className="adm-actions" style={{ alignItems: "flex-end" }}>
          <button className="adm-btn" onClick={save}><i className="bi bi-check-lg" /> Salvar</button>
          {saved && <span className="adm-saved"><i className="bi bi-check-circle-fill" /> Salvo!</span>}
        </div>
      </div>
    </div>
  );
}

function WinnerRow({ winner, onSave, onDelete }: { winner: Winner; onSave: (w: Winner) => void; onDelete: (id: string) => void; }) {
  const [w, setW] = useState(winner);
  useEffect(() => setW(winner), [winner]);
  return (
    <div className="adm-card">
      <div className="adm-rowtop">
        <img className="adm-preview-round" src={w.imageUrl || ""} alt="" />
        <label className="adm-toggle">
          <input type="checkbox" checked={w.active} onChange={(e) => setW({ ...w, active: e.target.checked })} /> Ativo
        </label>
      </div>
      <div className="adm-grid2">
        <div className="adm-field">
          <label>URL da foto</label>
          <input className="adm-input" value={w.imageUrl} onChange={(e) => setW({ ...w, imageUrl: e.target.value })} />
          <div className="adm-actions" style={{ marginTop: "0.5rem" }}>
            <UploadBtn onPick={(d) => setW({ ...w, imageUrl: d })} removeDarkBg />
          </div>
        </div>
        <div className="adm-field">
          <label>Nome</label>
          <input className="adm-input" value={w.name} onChange={(e) => setW({ ...w, name: e.target.value })} />
        </div>
      </div>
      <div className="adm-grid4">
        <div className="adm-field">
          <label>Valor (R$)</label>
          <input className="adm-input" type="number" value={w.value} onChange={(e) => setW({ ...w, value: Number(e.target.value) })} />
        </div>
        <div className="adm-field">
          <label>Badge</label>
          <select className="adm-select" value={w.badge} onChange={(e) => setW({ ...w, badge: e.target.value })}>
            <option value="PIX">PIX</option>
            <option value="PREMIO">PRÃŠMIO</option>
          </select>
        </div>
        <div className="adm-field">
          <label>Há min</label>
          <input className="adm-input" type="number" value={w.minutesAgo} onChange={(e) => setW({ ...w, minutesAgo: Number(e.target.value) })} />
        </div>
        <div className="adm-field">
          <label>Ordem</label>
          <input className="adm-input" type="number" value={w.sortOrder} onChange={(e) => setW({ ...w, sortOrder: Number(e.target.value) })} />
        </div>
      </div>
      <div className="adm-actions">
        <button className="adm-btn" onClick={() => onSave(w)}><i className="bi bi-check-lg" /> Salvar</button>
        <button className="adm-btn danger" onClick={() => onDelete(w.id)}><i className="bi bi-trash" /> Excluir</button>
      </div>
    </div>
  );
}
