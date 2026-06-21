"use client";

import { useRef, useState } from "react";

interface DbPrize { label: string; value: number; imageUrl?: string; }
interface Props { prize: number; onRevealed: () => void; dbPrizes?: DbPrize[]; }

function fmt(n: number) {
  return "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const NADA = null;

// Returns array of 9 cells: null = NADA, DbPrize = show prize
function buildCells(prize: number, dbPrizes: DbPrize[]): (DbPrize | null)[] {
  if (prize > 0) {
    // WIN: 3 células iguais usando imagem de dbPrizes[0] (cédulas) + 1 diferente + 5 NADA
    const iconPrize = dbPrizes[0] ?? { label: "Dinheiro", value: 0, imageUrl: "" };
    const winCell: DbPrize = { label: fmt(prize), value: prize, imageUrl: "__WIN__" + (iconPrize.imageUrl ?? "") };
    const others = dbPrizes.filter((_, i) => i > 0);
    const other = others.length ? others[Math.floor(Math.random() * others.length)] : (dbPrizes[1] ?? iconPrize);
    return shuffle<DbPrize | null>([winCell, winCell, winCell, other, null, null, null, null, null]);
  }
  // LOSE: 5 prêmios de dbPrizes (todos diferentes se possível, nunca 3 iguais) + 4 NADA
  const pool: (DbPrize | null)[] = [];
  if (dbPrizes.length) {
    const shuffled = shuffle([...dbPrizes]);
    // pega 5 prizes ciclando pelos disponíveis, max 2 de cada
    const counts = new Map<string, number>();
    const picks: DbPrize[] = [];
    // primeira passagem: 1 de cada
    for (const p of shuffled) {
      if (picks.length >= 5) break;
      picks.push(p);
      counts.set(p.label, 1);
    }
    // segunda passagem: +1 de cada (max 2) se ainda precisar
    for (const p of shuffled) {
      if (picks.length >= 5) break;
      if ((counts.get(p.label) ?? 0) < 2) {
        picks.push(p);
        counts.set(p.label, (counts.get(p.label) ?? 0) + 1);
      }
    }
    pool.push(...picks);
  }
  while (pool.length < 5) pool.push({ label: "Prêmio", value: 0, imageUrl: "" });
  pool.push(null, null, null, null);
  return shuffle(pool);
}

export default function ScratchCard({ prize, onRevealed, dbPrizes = [] }: Props) {
  const cells = useRef(buildCells(prize, dbPrizes));
  const won = prize > 0;
  const [revealed, setRevealed] = useState<boolean[]>(Array(9).fill(false));
  const doneRef = useRef(false);

  function revealCell(i: number) {
    if (revealed[i]) return;
    const next = [...revealed];
    next[i] = true;
    setRevealed(next);
    if (next.filter(Boolean).length >= 9 && !doneRef.current) {
      doneRef.current = true;
      setTimeout(onRevealed, 400);
    }
  }

  const count = revealed.filter(Boolean).length;

  function renderBack(cell: DbPrize | null, i: number) {
    if (cell === NADA) {
      const nadaPrize = dbPrizes.find(p => p.label.toUpperCase() === "NADA");
      return (
        <>
          {nadaPrize?.imageUrl
            ? <img src={nadaPrize.imageUrl} alt="NADA" style={{ width: 44, height: 44, objectFit: "contain" }} />
            : <span style={{ fontSize: "3.2rem", color: "#dc2626", lineHeight: 1 }}>✕</span>}
          <span style={{ fontSize: ".7rem", fontWeight: 700, color: "#fff", letterSpacing: ".05em" }}>NADA</span>
          <span style={{ fontSize: ".65rem", fontWeight: 800, color: "#ef4444" }}>R$ 0,00</span>
        </>
      );
    }
    // win cell: value matches prize and won
    const isWinCell = won && cell.value === prize && cell.imageUrl?.startsWith("__WIN__");
    if (isWinCell) {
      const winImg = cell.imageUrl!.slice(7);
      return (
        <>
          {winImg
            ? <img src={winImg} alt="Prêmio" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 6 }} />
            : <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>💰</span>}
          <span style={{ fontSize: ".65rem", fontWeight: 900, color: "#4ade80" }}>{cell.label}</span>
          <span style={{ fontSize: ".55rem", fontWeight: 700, color: "#4ade80", opacity: .8 }}>GANHOU!</span>
        </>
      );
    }
    return (
      <>
        {cell.imageUrl
          ? <img src={cell.imageUrl} alt={cell.label} style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 6 }} />
          : <span style={{ fontSize: "1.2rem" }}>🎁</span>}
        <span style={{ fontSize: ".55rem", fontWeight: 700, color: "#9ca3af", textAlign: "center", lineHeight: 1.2, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cell.label}</span>
        <span style={{ fontSize: ".65rem", fontWeight: 900, color: "#ef4444" }}>{fmt(cell.value)}</span>
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".65rem" }}>
      <style>{`
        .sg-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: .45rem; }
        .sg-cell { position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1; cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; }
        .sg-back { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; background: #111; padding: 6px; }
        .sg-back.win-back { background: rgba(22,199,91,.08); border: 1px solid rgba(22,199,91,.25); }
        .sg-cover { position: absolute; inset: 0; background: linear-gradient(145deg,#e5e7eb,#ffffff 45%,#d1d5db 70%,#f3f4f6); display: flex; align-items: center; justify-content: center; transition: opacity .25s ease, transform .25s ease; transform-origin: center; }
        .sg-cover::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(50deg,transparent,transparent 7px,rgba(0,0,0,.05) 7px,rgba(0,0,0,.05) 8px); }
        .sg-cover::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 40%; background: linear-gradient(180deg,rgba(255,255,255,.5),transparent); }
        .sg-cover-q { position: relative; z-index: 1; font-size: 1.3rem; font-weight: 900; color: rgba(0,0,0,.15); }
        .sg-cover.done { opacity: 0; transform: scale(1.15); pointer-events: none; }
        .sg-prog { height: 4px; background: rgba(255,255,255,.08); border-radius: 4px; overflow: hidden; }
        .sg-prog-bar { height: 100%; background: linear-gradient(90deg,#dc2626,#ef4444); border-radius: 4px; transition: width .2s; }
        .sg-hint { text-align: center; color: rgba(255,255,255,.3); font-size: .7rem; }
      `}</style>

      <div className="sg-grid">
        {cells.current.map((cell, i) => {
          const isWinCell = won && cell !== null && cell.value === prize && !cell.imageUrl;
          return (
            <div key={i} className="sg-cell" onClick={() => revealCell(i)} onMouseEnter={e => { if (e.buttons === 1) revealCell(i); }} onTouchStart={() => revealCell(i)}>
              <div className={`sg-back${isWinCell && revealed[i] ? " win-back" : ""}`}>{renderBack(cell, i)}</div>
              <div className={`sg-cover${revealed[i] ? " done" : ""}`}>
                <span className="sg-cover-q">?</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sg-prog">
        <div className="sg-prog-bar" style={{ width: `${(count / 9) * 100}%` }} />
      </div>
      <div className="sg-hint">
        {count === 0 ? "Clique nos quadradinhos para revelar" : count < 9 ? `${count}/9 revelados` : "✓ Revelado!"}
      </div>
    </div>
  );
}
