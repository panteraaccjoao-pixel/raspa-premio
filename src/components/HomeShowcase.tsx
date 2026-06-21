"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import WinnersBar from "./WinnersBar";
import type { BannerData, RaspadinhaData, WinnerData } from "@/lib/site-data";

type Filter = "TODOS" | "DINHEIRO";

export default function HomeShowcase({
  banners,
  games,
  winners,
  winnersTotal,
}: {
  banners: BannerData[];
  games: RaspadinhaData[];
  winners: WinnerData[];
  winnersTotal: number;
}) {
  const [current, setCurrent] = useState(0);
  const [filter, setFilter] = useState<Filter>("TODOS");

  const total = Math.max(banners.length, 1);

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  // Auto-avança a cada 6s (só se houver mais de um banner)
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [banners.length, next]);

  const filtered =
    filter === "TODOS" ? games : games.filter((g) => g.category === "DINHEIRO");

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />

      <style>{`
        .showcase {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0a0a0a;
          max-width: 1300px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 4rem;
        }

        /* Banner carousel (fade + zoom-in) */
        .banner-wrap { position: relative; border-radius: 24px; overflow: hidden; background: #0a0a0a; }
        .banner-viewport {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
        }
        /* A imagem do slide ativo define a altura — sem altura fixa */
        .banner-slide {
          display: none;
        }
        .banner-slide.active {
          display: block;
          position: relative;
          z-index: 1;
          animation: bannerFadeIn 0.6s ease forwards;
        }
        @keyframes bannerFadeIn {
          from { opacity: 0; transform: scale(1.02); }
          to   { opacity: 1; transform: scale(1); }
        }
        .banner-slide img {
          width: 100%;
          height: auto;
          display: block;
          max-height: 720px;
        }
        /* fallback p/ banner padrão (sem imagem) */
        .banner-default-wrap {
          border-radius: 24px; overflow: hidden; aspect-ratio: 1100 / 460;
          display: flex; align-items: center;
          background: linear-gradient(135deg, #2a0808 0%, #7f1d1d 45%, #b91c1c 100%);
        }
        .banner-default {
          position: relative; z-index: 2;
          width: 100%; padding: 0 8%;
          display: flex; flex-direction: column; gap: 0.25rem;
        }
        .banner-default h2 {
          font-size: clamp(1.8rem, 4.5vw, 3.4rem);
          font-weight: 900; color: #fff; line-height: 1.05;
          text-shadow: 2px 2px 6px rgba(0,0,0,0.35);
        }
        .banner-default h2 span { color: #fca5a5; }
        .banner-default p {
          font-size: clamp(1rem, 2vw, 1.5rem);
          font-weight: 700; color: #fee2e2; margin-top: 0.5rem;
        }

        .banner-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(239,68,68,0.5);
          color: #fff; font-size: 1.1rem;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 3;
          transition: all 0.25s ease; backdrop-filter: blur(4px);
        }
        .banner-arrow:hover { background: #ef4444; border-color: #ef4444; }
        .banner-arrow.left { left: 1rem; }
        .banner-arrow.right { right: 1rem; }

        .banner-dots {
          position: absolute; bottom: 1rem; left: 50%;
          transform: translateX(-50%);
          display: flex; gap: 0.5rem; z-index: 3;
        }
        .banner-dots button {
          width: 10px; height: 10px; border-radius: 50%;
          border: none; cursor: pointer;
          background: rgba(255,255,255,0.4);
          transition: all 0.25s ease;
        }
        .banner-dots button.active { background: #ffffff; width: 26px; border-radius: 5px; }

        /* Raspadinhas */
        .rasp-head {
          display: flex; align-items: center; justify-content: space-between;
          margin: 3rem 0 1.75rem; flex-wrap: wrap; gap: 1rem;
        }
        .rasp-title { font-size: 2.2rem; font-weight: 900; color: #ef4444; }
        .rasp-filter {
          display: flex; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(239,68,68,0.3); border-radius: 50px;
          padding: 0.3rem;
        }
        .rasp-filter button {
          padding: 0.5rem 1.4rem; border-radius: 50px; border: none;
          background: none; color: #9ca3af; font-weight: 600;
          font-size: 0.9rem; cursor: pointer; transition: all 0.25s ease;
          font-family: inherit;
        }
        .rasp-filter button.active {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
          box-shadow: 0 0 16px rgba(239,68,68,0.4);
        }

        .rasp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 1.5rem;
        }
        .rasp-card {
          background: linear-gradient(145deg, rgba(22,22,22,0.9), rgba(12,12,12,0.95));
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px; overflow: hidden;
          display: flex; flex-direction: column;
          transition: all 0.3s ease;
        }
        .rasp-card:hover {
          transform: translateY(-6px);
          border-color: rgba(239,68,68,0.4);
          box-shadow: 0 18px 50px rgba(0,0,0,0.4), 0 0 30px rgba(239,68,68,0.12);
        }
        .rasp-thumb {
          position: relative; height: 175px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .rasp-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .rasp-thumb .emoji { font-size: 4rem; }
        .rasp-badge {
          position: absolute; top: 0.85rem; left: 0.85rem;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff; font-size: 0.7rem; font-weight: 800;
          letter-spacing: 0.05em; padding: 0.35rem 0.85rem;
          border-radius: 50px; text-transform: uppercase;
          box-shadow: 0 4px 12px rgba(239,68,68,0.4);
        }
        .rasp-body { padding: 1.25rem; display: flex; flex-direction: column; flex: 1; }
        .rasp-name { font-size: 1rem; font-weight: 800; color: #fff; line-height: 1.3; margin-bottom: 0.5rem; }
        .rasp-desc { font-size: 0.85rem; color: #9ca3af; line-height: 1.45; flex: 1; }
        .rasp-foot {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 1.25rem;
        }
        .rasp-price { color: #ef4444; font-weight: 900; font-size: 1.4rem; }
        .rasp-price small { font-size: 0.8rem; font-weight: 600; color: #9ca3af; margin-right: 0.15rem; }
        .rasp-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff; text-decoration: none;
          padding: 0.6rem 1.5rem; border-radius: 12px;
          font-weight: 700; font-size: 0.9rem;
          transition: all 0.25s ease;
          box-shadow: 0 4px 14px rgba(239,68,68,0.35);
        }
        .rasp-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(239,68,68,0.5);
        }
        .rasp-empty { color: #9ca3af; text-align: center; padding: 3rem; grid-column: 1/-1; }

        @media (max-width: 600px) {
          .rasp-title { font-size: 1.6rem; }
          .banner-arrow { width: 36px; height: 36px; }
        }
      `}</style>

      <div className="showcase">
        {/* Banner carousel */}
        <div className="banner-wrap">
          {banners.length > 0 ? (
            <div className="banner-viewport">
              {banners.map((b, i) => (
                <div className={`banner-slide${i === current ? " active" : ""}`} key={b.id}>
                  {b.link ? (
                    <Link href={b.link}>
                      <img src={b.imageUrl} alt="Banner promocional" style={{ objectFit: b.objectFit as any }} />
                    </Link>
                  ) : (
                    <img src={b.imageUrl} alt="Banner promocional" style={{ objectFit: b.objectFit as any }} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="banner-default-wrap">
              <div className="banner-default">
                <h2><span>Ganhe</span> os prêmios dos seus sonhos</h2>
                <p>De iPhone à sua moto 0km!</p>
              </div>
            </div>
          )}

          {banners.length > 1 && (
            <>
              <button className="banner-arrow left" onClick={prev} aria-label="Anterior">
                <i className="bi bi-chevron-left" />
              </button>
              <button className="banner-arrow right" onClick={next} aria-label="Próximo">
                <i className="bi bi-chevron-right" />
              </button>
            </>
          )}
        </div>

        {/* Últimos Ganhadores */}
        <WinnersBar winners={winners} total={winnersTotal} />

        {/* Raspadinhas */}
        <div className="rasp-head">
          <h2 className="rasp-title">Raspadinhas</h2>
          <div className="rasp-filter">
            <button
              className={filter === "TODOS" ? "active" : ""}
              onClick={() => setFilter("TODOS")}
            >
              Todos
            </button>
            <button
              className={filter === "DINHEIRO" ? "active" : ""}
              onClick={() => setFilter("DINHEIRO")}
            >
              Dinheiro
            </button>
          </div>
        </div>

        <div className="rasp-grid">
          {filtered.length === 0 && (
            <div className="rasp-empty">Nenhuma raspadinha nessa categoria.</div>
          )}
          {filtered.map((g) => (
            <div className="rasp-card" key={g.id}>
              <div className={`rasp-thumb bg-gradient-to-br ${g.color}`}>
                {g.imageUrl ? (
                  <img src={g.imageUrl} alt={g.name} />
                ) : (
                  <span className="emoji">{g.emoji}</span>
                )}
                <span className="rasp-badge">{g.category}</span>
              </div>
              <div className="rasp-body">
                <h3 className="rasp-name">{g.name}</h3>
                <p className="rasp-desc">{g.description}</p>
                <div className="rasp-foot">
                  <span className="rasp-price">
                    <small>R$</small>{g.price.toFixed(2).replace(".", ",")}
                  </span>
                  <Link href="/jogar" className="rasp-btn">Jogar</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
