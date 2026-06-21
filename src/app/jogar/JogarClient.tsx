"use client";

import { useState } from "react";
import Link from "next/link";
import type { RaspadinhaData } from "@/lib/site-data";

type Filtro = "TODAS" | "ATE10" | "10A50" | "ACIMA50";

const FILTROS: { key: Filtro; label: string; icon: string }[] = [
  { key: "TODAS", label: "Todas as Raspadinhas", icon: "bi-grid-3x3-gap-fill" },
  { key: "ATE10", label: "Até R$ 10", icon: "bi-coin" },
  { key: "10A50", label: "R$ 10 - R$ 50", icon: "bi-cash-stack" },
  { key: "ACIMA50", label: "Acima de R$ 50", icon: "bi-gem" },
];

export default function JogarClient({ games, winnersTotal }: { games: RaspadinhaData[]; winnersTotal?: number }) {
  const [filtro, setFiltro] = useState<Filtro>("TODAS");

  const totalPremios = winnersTotal ?? games.reduce((s, g) => s + g.maxPrize, 0);

  const filtered = games.filter((g) => {
    if (filtro === "ATE10") return g.price <= 10;
    if (filtro === "10A50") return g.price > 10 && g.price <= 50;
    if (filtro === "ACIMA50") return g.price > 50;
    return true;
  });

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />

      <style>{`
        .jc {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 1250px; margin: 0 auto; padding: 3rem 1.5rem 4rem;
        }
        .jc-head { text-align: center; max-width: 720px; margin: 0 auto 2.5rem; }
        .jc-title { font-size: 2.6rem; font-weight: 900; color: #fff; margin-bottom: 0.6rem; }
        .jc-sub { color: #9ca3af; font-size: 1.05rem; line-height: 1.6; }

        .jc-stats {
          display: flex; justify-content: center; gap: 3.5rem;
          margin: 2.25rem 0 2.5rem; flex-wrap: wrap;
        }
        .jc-stat { text-align: center; }
        .jc-stat .num { font-size: 2rem; font-weight: 900; color: #ef4444; line-height: 1; }
        .jc-stat .lbl { color: #9ca3af; font-size: 0.9rem; margin-top: 0.4rem; }

        .jc-filters {
          display: flex; justify-content: center; gap: 0.75rem;
          flex-wrap: wrap; margin-bottom: 2.5rem;
        }
        .jc-filter {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.7rem 1.3rem; border-radius: 50px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #9ca3af; font-weight: 600; font-size: 0.9rem; cursor: pointer;
          font-family: inherit; transition: all 0.25s ease;
        }
        .jc-filter:hover { color: #fff; border-color: rgba(239,68,68,0.4); }
        .jc-filter.active {
          background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff;
          border-color: transparent;
          box-shadow: 0 0 18px rgba(239,68,68,0.45);
        }

        .jc-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .jc-card {
          background: linear-gradient(145deg, rgba(22,22,22,0.92), rgba(12,12,12,0.96));
          border: 1px solid rgba(255,255,255,0.08); border-radius: 18px;
          overflow: hidden; display: flex; flex-direction: column;
          transition: all 0.3s ease;
        }
        .jc-card:hover {
          transform: translateY(-6px); border-color: rgba(239,68,68,0.4);
          box-shadow: 0 18px 50px rgba(0,0,0,0.45), 0 0 30px rgba(239,68,68,0.12);
        }
        .jc-thumb {
          position: relative; height: 185px; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .jc-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .jc-thumb .emoji { font-size: 4.2rem; }
        .jc-pricetag {
          position: absolute; top: 0.85rem; right: 0.85rem;
          background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff;
          font-weight: 800; font-size: 0.85rem; padding: 0.35rem 0.9rem;
          border-radius: 50px; box-shadow: 0 4px 12px rgba(239,68,68,0.45);
          display: inline-flex; align-items: center; gap: 0.35rem;
        }
        .jc-body { padding: 1.1rem 1.25rem 1.4rem; display: flex; flex-direction: column; flex: 1; }
        .jc-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
        .jc-tag {
          display: inline-flex; align-items: center; gap: 0.3rem;
          font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.6rem;
          border-radius: 50px; background: rgba(239,68,68,0.12);
          color: #fca5a5; border: 1px solid rgba(239,68,68,0.25);
        }
        .jc-name { font-size: 1rem; font-weight: 800; color: #fff; line-height: 1.35; margin-bottom: 0.5rem; }
        .jc-desc { font-size: 0.85rem; color: #9ca3af; line-height: 1.45; flex: 1; }
        .jc-foot {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-top: 1.25rem;
        }
        .jc-max .l { font-size: 0.72rem; color: #6b7280; }
        .jc-max .v { font-size: 1.25rem; font-weight: 900; color: #ef4444; }
        .jc-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff;
          text-decoration: none; padding: 0.6rem 1.5rem; border-radius: 12px;
          font-weight: 700; font-size: 0.9rem; transition: all 0.25s ease;
          box-shadow: 0 4px 14px rgba(239,68,68,0.35);
        }
        .jc-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(239,68,68,0.5); }
        .jc-empty { grid-column: 1/-1; text-align: center; color: #9ca3af; padding: 3rem; }

        @media (max-width: 600px) {
          .jc-title { font-size: 1.9rem; }
          .jc-stats { gap: 2rem; }
        }
      `}</style>

      <div className="jc">
        <div className="jc-head">
          <h1 className="jc-title">Escolha sua Raspadinha</h1>
          <p className="jc-sub">
            Centenas de prêmios esperando por você! Raspe e ganhe na hora com PIX instantâneo.
          </p>
        </div>

        <div className="jc-stats">
          <div className="jc-stat">
            <div className="num">{games.length}</div>
            <div className="lbl">Raspadinhas</div>
          </div>
          <div className="jc-stat">
            <div className="num">R$ {totalPremios.toLocaleString("pt-BR")}</div>
            <div className="lbl">Em Prêmios</div>
          </div>
          <div className="jc-stat">
            <div className="num">24/7</div>
            <div className="lbl">Disponível</div>
          </div>
        </div>

        <div className="jc-filters">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              className={`jc-filter${filtro === f.key ? " active" : ""}`}
              onClick={() => setFiltro(f.key)}
            >
              <i className={`bi ${f.icon}`} /> {f.label}
            </button>
          ))}
        </div>

        <div className="jc-grid">
          {filtered.length === 0 && (
            <div className="jc-empty">Nenhuma raspadinha nessa faixa de preço.</div>
          )}
          {filtered.map((g) => (
            <div className="jc-card" key={g.id}>
              <div className={`jc-thumb bg-gradient-to-br ${g.color}`}>
                {g.imageUrl ? <img src={g.imageUrl} alt={g.name} /> : <span className="emoji">{g.emoji}</span>}
                <span className="jc-pricetag"><i className="bi bi-tag-fill" /> R$ {g.price.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="jc-body">
                <div className="jc-tags">
                  <span className="jc-tag"><i className="bi bi-lightning-charge-fill" /> PIX Instantâneo</span>
                  <span className="jc-tag"><i className="bi bi-star-fill" /> Premium</span>
                </div>
                <h3 className="jc-name">{g.name}</h3>
                <p className="jc-desc">{g.description}</p>
                <div className="jc-foot">
                  <div className="jc-max">
                    <div className="l">Prêmio máximo</div>
                    <div className="v">R$ {g.maxPrize.toLocaleString("pt-BR")}</div>
                  </div>
                  <Link href={`/jogar/${g.id}`} className="jc-btn">Jogar</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
