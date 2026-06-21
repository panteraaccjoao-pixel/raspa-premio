"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ScratchCard from "@/components/ScratchCard";
import type { Game } from "@/lib/games";

/* Prize showcase items per game */
const PRIZE_ITEMS: Record<string, { label: string; value: number; icon: string }[]> = {
  "pix-turbinado": [
    { label: "R$ 2.500 NO PIX",  value: 2500,  icon: "⚡" },
    { label: "R$ 500 NO PIX",    value: 500,   icon: "💸" },
    { label: "R$ 50 NO PIX",     value: 50,    icon: "💵" },
    { label: "R$ 10 NO PIX",     value: 10,    icon: "💰" },
    { label: "R$ 5 NO PIX",      value: 5,     icon: "🤑" },
    { label: "R$ 2 NO PIX",      value: 2,     icon: "💲" },
  ],
  "sonho-premiado": [
    { label: "R$ 5.000 NO PIX",  value: 5000,  icon: "⭐" },
    { label: "R$ 1.000 NO PIX",  value: 1000,  icon: "🌟" },
    { label: "R$ 100 NO PIX",    value: 100,   icon: "💫" },
    { label: "R$ 20 NO PIX",     value: 20,    icon: "✨" },
    { label: "R$ 10 NO PIX",     value: 10,    icon: "🎯" },
    { label: "R$ 4 NO PIX",      value: 4,     icon: "🎁" },
  ],
  "ostentacao": [
    { label: "iPhone 16 Pro Max", value: 10000, icon: "📱" },
    { label: "MacBook Pro M4",    value: 8000,  icon: "💻" },
    { label: "R$ 2.000 NO PIX",  value: 2000,  icon: "💸" },
    { label: "R$ 250 NO PIX",    value: 250,   icon: "💰" },
    { label: "R$ 50 NO PIX",     value: 50,    icon: "💵" },
    { label: "R$ 10 NO PIX",     value: 10,    icon: "💲" },
  ],
  "mega-black": [
    { label: "Honda PCX 2025",      value: 20000, icon: "🏍️" },
    { label: "MacBook Pro M4",      value: 14000, icon: "💻" },
    { label: "Moto Honda Pop",      value: 12500, icon: "🛵" },
    { label: "Geladeira Smart LG",  value: 9000,  icon: "🧊" },
    { label: "iPhone 16 Pro Max",   value: 7500,  icon: "📱" },
    { label: "R$ 3.000 NO PIX",    value: 3000,  icon: "💸" },
    { label: "PS5 + 2 Controles",   value: 5000,  icon: "🎮" },
    { label: "Smart TV 65\" 4K",    value: 4500,  icon: "📺" },
    { label: "Ar-condicionado 12k", value: 3800,  icon: "❄️" },
    { label: "R$ 2.000 NO PIX",    value: 2000,  icon: "💰" },
    { label: "iPad Pro M4",         value: 6500,  icon: "📲" },
    { label: "R$ 500 NO PIX",      value: 500,   icon: "🤑" },
  ],
};

const HOW_TO = [
  { n: 1, icon: "bi-ticket-perforated-fill", text: 'Comprar e Raspar', sub: "Clique no botão abaixo" },
  { n: 2, icon: "bi-eraser-fill", text: "Raspe a cartela", sub: "Com o mouse ou dedo" },
  { n: 3, icon: "bi-gift-fill", text: "Descubra o prêmio", sub: "Veja se você ganhou!" },
  { n: 4, icon: "bi-send-fill", text: "Receba na hora", sub: "PIX instantâneo" },
];

interface DbPrize { label: string; value: number; imageUrl: string; }

export default function GameClient({ game, dbPrizes }: { game: Game; dbPrizes?: DbPrize[] }) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; balance: number } | null>(null);
  const [state, setState] = useState<"idle" | "playing" | "revealed" | "loading">("idle");
  const [prize, setPrize] = useState(0);
  const [error, setError] = useState("");
  const [key, setKey] = useState(0);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      if (!d.user) { router.replace("/entrar"); return; }
      setUser(d.user);
    });
  }, [router]);

  async function startGame() {
    if (!user) { router.push("/entrar"); return; }
    if (user.balance < game.price) { router.push("/depositar"); return; }
    setState("loading"); setError("");
    const res = await fetch("/api/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: game.id }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erro ao iniciar jogo"); setState("idle"); return; }
    setPrize(data.prize);
    setUser(u => u ? { ...u, balance: data.balance } : u);
    setState("playing");
  }

  function onRevealed() { setState("revealed"); }
  function playAgain() { setKey(k => k + 1); setState("idle"); setPrize(0); }

  const fmt = (n: number) => "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  const items = (dbPrizes && dbPrizes.length > 0)
    ? dbPrizes.map(p => ({ label: p.label, value: p.value, icon: "🎁", imageUrl: p.imageUrl }))
    : (PRIZE_ITEMS[game.id] ?? []).map(p => ({ ...p, imageUrl: "" }));

  /* gradient per game */
  const gradients: Record<string, string> = {
    "pix-turbinado": "linear-gradient(135deg,#064e3b,#065f46,#059669)",
    "sonho-premiado": "linear-gradient(135deg,#4c1d95,#5b21b6,#7c3aed)",
    "ostentacao":     "linear-gradient(135deg,#78350f,#92400e,#d97706)",
    "mega-black":     "linear-gradient(135deg,#111827,#1f2937,#374151)",
  };
  const bannerGrad = gradients[game.id] ?? "linear-gradient(135deg,#1f2937,#111827)";

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .gc{background:#0a0a0a;min-height:100vh;font-family:'Inter',sans-serif;padding-bottom:4rem;}
        .gc-wrap{max-width:560px;margin:0 auto;padding:0 1rem;}

        .gc-back{display:inline-flex;align-items:center;gap:.4rem;color:#6b7280;font-size:.83rem;font-weight:600;text-decoration:none;padding:1.25rem 0 .75rem;transition:color .2s;}
        .gc-back:hover{color:#fff;}

        /* banner */
        .gc-banner{border-radius:18px;overflow:hidden;margin-bottom:1rem;position:relative;min-height:200px;}
        .gc-banner-bg-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}
        .gc-banner-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.82) 45%,rgba(0,0,0,.2) 100%);}
        .gc-banner-inner{padding:2rem 1.5rem 1.5rem;position:relative;z-index:1;flex:1;}
        .gc-banner-img-wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:6rem;opacity:.25;}
        .gc-banner-price{display:inline-flex;align-items:center;gap:.4rem;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:.8rem;font-weight:800;padding:.35rem .9rem;border-radius:50px;margin-bottom:1rem;}
        .gc-banner-title{font-size:1.5rem;font-weight:900;color:#fff;line-height:1.2;margin-bottom:.4rem;text-shadow:0 2px 8px rgba(0,0,0,.5);}
        .gc-banner-desc{color:rgba(255,255,255,.7);font-size:.82rem;}
        .gc-banner-max{display:inline-flex;align-items:center;gap:.4rem;background:rgba(0,0,0,.4);color:#fff;font-size:.75rem;font-weight:700;padding:.3rem .75rem;border-radius:50px;margin-top:.85rem;}

        /* how to */
        .gc-how{margin-bottom:1rem;padding:.85rem .75rem;background:#080808;border-radius:14px;border:1px solid rgba(220,38,38,.18);}
        .gc-how-title{display:none;}
        .gc-how-grid{display:flex;align-items:stretch;gap:0;}
        .gc-how-item{flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;padding:0 .3rem;}
        .gc-how-item:not(:last-child)::after{content:'›';position:absolute;right:-.55rem;top:50%;transform:translateY(-80%);color:rgba(239,68,68,.5);font-size:1.2rem;line-height:1;z-index:1;}
        .gc-how-num{font-size:.55rem;font-weight:900;color:#ef4444;letter-spacing:.1em;text-transform:uppercase;margin-bottom:.35rem;}
        .gc-how-icon{width:42px;height:42px;border-radius:50%;border:1.5px solid rgba(239,68,68,.5);background:rgba(220,38,38,.07);display:flex;align-items:center;justify-content:center;margin-bottom:.4rem;box-shadow:0 0 8px rgba(239,68,68,.2);}
        .gc-how-icon i{color:#ef4444;font-size:.95rem;}
        .gc-how-texts{}
        .gc-how-label{color:#fff;font-size:.65rem;font-weight:700;line-height:1.3;}
        .gc-how-sub{color:#6b7280;font-size:.58rem;margin-top:.15rem;line-height:1.3;}

        /* prizes showcase – scroll vertical */
        .gc-prizes{background:rgba(60,0,0,.35);border:1.5px solid rgba(220,38,38,.2);border-radius:16px;padding:1.1rem 1rem 1rem;margin-bottom:1rem;}
        .gc-prizes-title{color:#fff;font-size:.82rem;font-weight:900;text-transform:uppercase;letter-spacing:.07em;margin-bottom:.85rem;display:flex;align-items:center;justify-content:center;gap:.5rem;}
        .gc-prizes-title i{color:#ef4444;font-size:.9rem;}
        .gc-prizes-scroll{
          max-height:320px;overflow-y:auto;
          padding-right:.4rem;
          scrollbar-width:thin;
          scrollbar-color:#ef4444 rgba(220,38,38,.1);
        }
        .gc-prizes-scroll::-webkit-scrollbar{width:5px;}
        .gc-prizes-scroll::-webkit-scrollbar-track{background:rgba(220,38,38,.08);border-radius:10px;}
        .gc-prizes-scroll::-webkit-scrollbar-thumb{background:#ef4444;border-radius:10px;}
        .gc-prizes-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.55rem;}
        .gc-prize-item{background:rgba(0,0,0,.6);border:1px solid rgba(220,38,38,.2);border-radius:12px;padding:.85rem .5rem .75rem;text-align:center;transition:all .3s ease;position:relative;overflow:hidden;}
        .gc-prize-item:hover{border-color:rgba(220,38,38,.5);transform:translateY(-2px);}
        .gc-prize-icon-wrap{width:64px;height:64px;background:rgba(220,38,38,.08);border-radius:10px;display:flex;align-items:center;justify-content:center;margin:0 auto .6rem;}
        .gc-prize-icon{font-size:2rem;line-height:1;}
        .gc-prize-img{width:64px;height:64px;object-fit:contain;border-radius:10px;background:transparent;padding:0;display:block;margin:0 auto .6rem;}
        .gc-prize-label{color:#fff;font-size:.65rem;font-weight:600;margin-bottom:.3rem;line-height:1.35;}
        .gc-prize-val{color:#ef4444;font-size:.75rem;font-weight:800;}

        /* balance */
        .gc-balance{display:flex;align-items:center;justify-content:space-between;background:rgba(220,38,38,.05);border:1px solid rgba(220,38,38,.15);border-radius:12px;padding:.75rem 1rem;margin-bottom:1rem;}
        .gc-balance span:first-child{color:#6b7280;font-size:.8rem;}
        .gc-balance span:last-child{color:#ef4444;font-weight:900;font-size:1rem;}

        /* scratch area */
        .gc-scratch{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:1.25rem;margin-bottom:1rem;}
        .gc-scratch-title{color:#fff;font-size:.85rem;font-weight:800;margin-bottom:1rem;display:flex;align-items:center;gap:.4rem;}
        .gc-scratch-title i{color:#ef4444;}

        /* idle – 3 zonas raspadinha */
        .gc-idle{
          position:relative;border-radius:16px;overflow:hidden;
          background:linear-gradient(160deg,#0f0f0f,#181818);
          padding:1.25rem 1rem 1.1rem;
          display:flex;flex-direction:column;align-items:center;gap:.85rem;
        }
        .gc-idle::before{
          content:'';position:absolute;inset:0;border-radius:16px;
          background:linear-gradient(135deg,rgba(255,200,0,.06) 0%,transparent 60%);
          pointer-events:none;
        }
        .gc-idle-label{
          color:rgba(255,255,255,.35);font-size:.62rem;font-weight:700;
          letter-spacing:.14em;text-transform:uppercase;
        }
        .gc-idle-prize{
          font-size:2.1rem;font-weight:900;color:#fff;line-height:1;letter-spacing:-.02em;
          text-shadow:0 2px 20px rgba(255,200,0,.25);
        }
        /* 3x3 caixas raspar */
        .gc-idle-boxes{display:grid;grid-template-columns:repeat(3,1fr);gap:.45rem;width:100%;}
        .gc-idle-box{
          border-radius:8px;overflow:hidden;position:relative;
          aspect-ratio:1;
          background:linear-gradient(145deg,#e5e7eb,#ffffff 45%,#d1d5db 70%,#f3f4f6);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.8);
        }
        .gc-idle-box::before{
          content:'';position:absolute;inset:0;
          background:repeating-linear-gradient(50deg,transparent,transparent 4px,rgba(0,0,0,.04) 4px,rgba(0,0,0,.04) 5px);
        }
        .gc-idle-box::after{
          content:'';position:absolute;top:0;left:0;right:0;height:45%;
          background:linear-gradient(180deg,rgba(255,255,255,.5),transparent);
        }
        .gc-idle-box-q{
          position:relative;z-index:1;
          font-size:1.4rem;font-weight:900;color:rgba(0,0,0,.12);
          user-select:none;
        }
        /* hint */
        .gc-idle-hint{
          display:flex;align-items:center;gap:.4rem;
          color:rgba(255,255,255,.3);font-size:.7rem;font-weight:600;
        }
        .gc-idle-hint i{animation:gc-hint-pulse 1.5s ease-in-out infinite alternate;}
        @keyframes gc-hint-pulse{0%{opacity:.3}100%{opacity:1}}

        /* error */
        .gc-err{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:10px;padding:.65rem 1rem;margin-bottom:.75rem;color:#f87171;font-size:.82rem;display:flex;align-items:center;gap:.5rem;}

        /* result */
        .gc-result-win{background:rgba(22,199,91,.08);border:1px solid rgba(22,199,91,.2);border-radius:14px;padding:1.25rem;text-align:center;margin-bottom:.75rem;}
        .gc-result-lose{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1.25rem;text-align:center;margin-bottom:.75rem;}
        .gc-result-emoji{font-size:2rem;margin-bottom:.5rem;}
        .gc-result-win h3{color:#16C75B;font-size:1.2rem;font-weight:900;}
        .gc-result-lose h3{color:#6b7280;font-size:1rem;font-weight:700;}
        .gc-result-sub{font-size:.78rem;color:#6b7280;margin-top:.25rem;}

        /* btn */
        .gc-btn{
          width:100%;padding:1rem;border-radius:14px;border:none;
          font-weight:900;font-size:1rem;font-family:inherit;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:.5rem;
          transition:all .2s;
        }
        .gc-btn-green{background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;box-shadow:0 4px 18px rgba(220,38,38,.4);}
        .gc-btn-green:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 24px rgba(220,38,38,.55);}
        .gc-btn-green:disabled{opacity:.45;cursor:not-allowed;transform:none;}
        .gc-btn-ghost{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:#9ca3af;margin-top:.6rem;}
        .gc-btn-ghost:hover{background:rgba(255,255,255,.07);color:#fff;}

        @keyframes spin-slow{to{transform:rotate(360deg)}}
        .gc-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin-slow .7s linear infinite;}
      `}</style>

      <div className="gc">
        <div className="gc-wrap">

          <Link href="/jogar" className="gc-back">
            <i className="bi bi-arrow-left" /> Voltar aos jogos
          </Link>

          {/* Banner */}
          <div className="gc-banner" style={{ background: bannerGrad }}>
            {game.imageUrl ? (
              <>
                <img src={game.imageUrl} alt={game.name} className="gc-banner-bg-img" />
                <div className="gc-banner-overlay" />
              </>
            ) : (
              <div className="gc-banner-img-wrap">{game.emoji}</div>
            )}
            <div className="gc-banner-inner">
              <div className="gc-banner-price">
                <i className="bi bi-tag-fill" /> R$ {game.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <div className="gc-banner-title">{game.emoji} {game.name.toUpperCase()}</div>
              <div className="gc-banner-desc">{game.description}</div>
              <div className="gc-banner-max">
                🏆 Prêmios de até {fmt(game.maxPrize)}
              </div>
            </div>
          </div>

          {/* Como Jogar */}
          <div className="gc-how">
            <div className="gc-how-title"><i className="bi bi-play-circle-fill" /><span>Como Jogar</span></div>
            <div className="gc-how-grid">
              {HOW_TO.map(h => (
                <div key={h.n} className="gc-how-item" data-n={h.n}>
                  <span className="gc-how-num">PASSO {h.n}</span>
                  <div className="gc-how-icon"><i className={`bi ${h.icon}`} /></div>
                  <div className="gc-how-texts">
                    <div className="gc-how-label">{h.text}</div>
                    <div className="gc-how-sub">{h.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prizes showcase */}
          {items.length > 0 && (
            <div className="gc-prizes">
              <div className="gc-prizes-title"><i className="bi bi-gift-fill" /> Conteúdo dessa Raspadinha:</div>
              <div className="gc-prizes-scroll">
                <div className="gc-prizes-grid">
                  {items.map((item, i) => (
                    <div key={i} className="gc-prize-item">
                      {(item as any).imageUrl ? (
                        <img src={(item as any).imageUrl} alt={item.label} className={`gc-prize-img${(item as any).imageUrl.startsWith("data:image/png") || (item as any).imageUrl.toLowerCase().includes(".png") ? " png-img" : ""}`} />
                      ) : (
                        <div className="gc-prize-icon-wrap">
                          <span className="gc-prize-icon">{item.icon}</span>
                        </div>
                      )}
                      <div className="gc-prize-label">{item.label}</div>
                      <div className="gc-prize-val">{fmt(item.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* Scratch area */}
          <div className="gc-scratch">
            <div className="gc-scratch-title"><i className="bi bi-fire" /> Sua Raspadinha</div>

            {error && (
              <div className="gc-err"><i className="bi bi-exclamation-triangle" /> {error}</div>
            )}

            {/* Idle */}
            {state === "idle" && (
              <div className="gc-idle">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%"}}>
                  <div>
                    <div className="gc-idle-label">Prêmio máximo</div>
                    <div className="gc-idle-prize">{fmt(game.maxPrize)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div className="gc-idle-label">Valor</div>
                    <div className="gc-idle-prize" style={{fontSize:"1.3rem",color:"#ef4444"}}>{fmt(game.price)}</div>
                  </div>
                </div>
                <div className="gc-idle-boxes">
                  {Array(9).fill("?").map((q,i) => (
                    <div key={i} className="gc-idle-box">
                      <span className="gc-idle-box-q">{q}</span>
                    </div>
                  ))}
                </div>
                <div className="gc-idle-hint">
                  <i className="bi bi-cursor-fill" /> Compre e raspe para revelar
                </div>
              </div>
            )}

            {/* Loading */}
            {state === "loading" && (
              <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"3rem",gap:"1rem" }}>
                <div className="gc-spinner" />
                <span style={{ color:"#6b7280",fontSize:".83rem" }}>Gerando sua raspadinha...</span>
              </div>
            )}

            {/* Playing / Revealed */}
            {(state === "playing" || state === "revealed") && (
              <ScratchCard key={key} prize={prize} onRevealed={onRevealed} dbPrizes={items} />
            )}

            {state === "revealed" && (
              <div style={{ marginTop:"1rem" }}>
                {prize > 0 ? (
                  <div className="gc-result-win">
                    <div className="gc-result-emoji" style={{display:"flex",justifyContent:"center"}}><img src="/47_Money-MouthFace-ezgif.com-video-to-apng-converter.png" alt="🤑" style={{width:"5.5rem",height:"5.5rem",mixBlendMode:"screen"}} /></div>
                    <h3>Você ganhou {fmt(prize)}!</h3>
                    <div className="gc-result-sub">Valor creditado no seu saldo</div>
                  </div>
                ) : (
                  <div className="gc-result-lose">
                    <div className="gc-result-emoji" style={{display:"flex",justifyContent:"center"}}><img src="/56_LoudlyCryingFace-ezgif.com-video-to-apng-converter.png" alt="😢" style={{width:"5.5rem",height:"5.5rem",mixBlendMode:"screen"}} /></div>
                    <h3>Não foi dessa vez!</h3>
                    <div className="gc-result-sub">Tente novamente e boa sorte</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CTA button */}
          {(state === "idle" || state === "revealed") && (
            <>
              {!user ? (
                <Link href="/entrar" className="gc-btn gc-btn-green" style={{ textDecoration:"none" }}>
                  <i className="bi bi-person-check" /> Entrar para jogar
                </Link>
              ) : user.balance < game.price ? (
                <Link href="/depositar" className="gc-btn gc-btn-green" style={{ textDecoration:"none" }}>
                  <i className="bi bi-plus-circle" /> Depositar para jogar
                </Link>
              ) : (
                <button className="gc-btn gc-btn-green" onClick={startGame}>
                  <i className="bi bi-grid-3x3-gap" />
                  {state === "revealed" ? "Jogar Novamente" : "Comprar e Raspar"} ({fmt(game.price)})
                </button>
              )}
              {state === "revealed" && (
                <Link href="/jogar" className="gc-btn gc-btn-ghost" style={{ textDecoration:"none" }}>
                  <i className="bi bi-arrow-left" /> Trocar de jogo
                </Link>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}
