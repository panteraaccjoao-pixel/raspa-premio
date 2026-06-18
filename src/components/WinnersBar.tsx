"use client";

import type { WinnerData } from "@/lib/site-data";

function timeAgo(min: number) {
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  return `há ${h}h`;
}

export default function WinnersBar({
  winners,
  total,
}: {
  winners: WinnerData[];
  total: number;
}) {
  return (
    <>
      <style>{`
        .winners {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin-top: 2.5rem;
        }
        .winners-head {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap;
        }
        .winners-title { font-size: 1.9rem; font-weight: 900; color: #fff; }
        .winners-total { text-align: right; }
        .winners-total .label { color: #9ca3af; font-size: 0.95rem; }
        .winners-total .value {
          color: #22c55e; font-size: 1.7rem; font-weight: 900;
          line-height: 1.1;
        }

        .winners-viewport {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
        }
        .winners-track {
          display: flex; gap: 1rem;
          width: max-content;
          animation: winnersScroll 40s linear infinite;
        }
        .winners-track:hover { animation-play-state: paused; }
        @keyframes winnersScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .winner-card {
          flex: 0 0 auto;
          min-width: 250px;
          display: flex; align-items: center; gap: 0.85rem;
          background: linear-gradient(145deg, rgba(22,22,22,0.9), rgba(12,12,12,0.95));
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 1rem 1.15rem;
          transition: border-color 0.25s ease;
        }
        .winner-card:hover { border-color: rgba(239,68,68,0.35); }
        .winner-avatar {
          width: 46px; height: 46px; border-radius: 50%;
          flex-shrink: 0; overflow: hidden;
          border: 2px solid rgba(34,197,94,0.5);
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: #fff; font-size: 1.2rem;
        }
        .winner-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .winner-info { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
        .winner-name { color: #fff; font-weight: 700; font-size: 0.9rem; }
        .winner-time { color: #9ca3af; font-size: 0.8rem; }
        .winner-right {
          margin-left: auto; text-align: right;
          display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem;
        }
        .winner-value { color: #22c55e; font-weight: 800; font-size: 1rem; white-space: nowrap; }
        .winner-badge {
          font-size: 0.65rem; font-weight: 800; letter-spacing: 0.04em;
          padding: 0.2rem 0.6rem; border-radius: 50px; text-transform: uppercase;
          color: #fff;
        }
        .winner-badge.pix { background: #22c55e; }
        .winner-badge.premio { background: linear-gradient(135deg, #f59e0b, #d97706); }
      `}</style>

      <div className="winners">
        <div className="winners-head">
          <h2 className="winners-title">Últimos Ganhadores</h2>
          <div className="winners-total">
            <div className="label">Prêmios Distribuídos</div>
            <div className="value">
              R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="winners-viewport">
          <div className="winners-track">
            {[...winners, ...winners].map((w, i) => (
              <div className="winner-card" key={`${w.id}-${i}`}>
                <div className="winner-avatar">
                  {w.imageUrl ? (
                    <img src={w.imageUrl} alt="Prêmio" />
                  ) : (
                    <i className="bi bi-gift-fill" />
                  )}
                </div>
                <div className="winner-info">
                  <span className="winner-name">{w.name}</span>
                  <span className="winner-time">{timeAgo(w.minutesAgo)}</span>
                </div>
                <div className="winner-right">
                  <span className="winner-value">
                    R$ {w.value.toLocaleString("pt-BR")}
                  </span>
                  <span className={`winner-badge ${w.badge === "PREMIO" ? "premio" : "pix"}`}>
                    {w.badge === "PREMIO" ? "Prêmio" : "PIX"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
