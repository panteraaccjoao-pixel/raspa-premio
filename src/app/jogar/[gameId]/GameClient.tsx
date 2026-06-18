"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ScratchCard from "@/components/ScratchCard";
import type { Game } from "@/lib/games";

export default function GameClient({ game }: { game: Game }) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; balance: number } | null>(null);
  const [state, setState] = useState<"idle" | "playing" | "revealed" | "loading">("idle");
  const [prize, setPrize] = useState(0);
  const [error, setError] = useState("");
  const [key, setKey] = useState(0);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);

  async function startGame() {
    if (!user) {
      router.push("/entrar");
      return;
    }
    if (user.balance < game.price) {
      router.push("/depositar");
      return;
    }

    setState("loading");
    setError("");

    const res = await fetch("/api/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: game.id }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao iniciar jogo");
      setState("idle");
      return;
    }

    setPrize(data.prize);
    setUser((u) => u ? { ...u, balance: data.balance } : u);
    setState("playing");
  }

  function onRevealed() {
    setState("revealed");
  }

  function playAgain() {
    setKey((k) => k + 1);
    setState("idle");
    setPrize(0);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      {/* Back */}
      <Link href="/jogar" className="text-white/40 text-sm hover:text-white transition flex items-center gap-1 mb-6">
        ← Voltar aos jogos
      </Link>

      {/* Game header */}
      <div className={`rounded-2xl bg-gradient-to-br ${game.color} p-6 text-center mb-6`}>
        <div className="text-5xl mb-2">{game.emoji}</div>
        <h1 className="text-2xl font-black text-white">{game.name}</h1>
        <p className="text-white/70 text-sm mt-1">{game.description}</p>
        <div className="mt-3 flex justify-center gap-4 text-sm">
          <span className="bg-black/30 px-3 py-1 rounded-full text-white">
            💳 Custo: <strong>R$ {game.price}</strong>
          </span>
          <span className="bg-black/30 px-3 py-1 rounded-full text-white">
            🏆 Máx: <strong>R$ {game.maxPrize.toLocaleString("pt-BR")}</strong>
          </span>
        </div>
      </div>

      {/* Balance */}
      {user && (
        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6">
          <span className="text-white/50 text-sm">Seu saldo</span>
          <span className="font-black text-green-400 text-lg">
            R$ {user.balance.toFixed(2)}
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Scratch card or CTA */}
      {state === "idle" && (
        <div className="text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
            <div className="text-6xl mb-4 float">🎫</div>
            <p className="text-white/50">Clique abaixo para comprar sua raspadinha e revelar o prêmio!</p>
          </div>
          {!user ? (
            <Link
              href="/entrar"
              className="block w-full bg-yellow-400 text-black font-bold text-lg py-4 rounded-2xl hover:bg-yellow-300 transition"
            >
              Entrar para jogar
            </Link>
          ) : user.balance < game.price ? (
            <Link
              href="/depositar"
              className="block w-full bg-green-500 text-white font-bold text-lg py-4 rounded-2xl hover:bg-green-400 transition"
            >
              💳 Depositar para jogar
            </Link>
          ) : (
            <button
              onClick={startGame}
              className="w-full bg-yellow-400 text-black font-bold text-lg py-4 rounded-2xl hover:bg-yellow-300 transition"
            >
              🎰 Comprar Raspadinha — R$ {game.price}
            </button>
          )}
        </div>
      )}

      {state === "loading" && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3 animate-spin">⚙️</div>
          <p className="text-white/50">Gerando sua raspadinha...</p>
        </div>
      )}

      {(state === "playing" || state === "revealed") && (
        <div>
          <ScratchCard key={key} prize={prize} onRevealed={onRevealed} />

          {state === "revealed" && (
            <div className="mt-6 text-center space-y-3">
              {prize > 0 ? (
                <div className="bg-green-500/20 border border-green-500/40 rounded-2xl p-5">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="text-green-400 font-black text-xl">
                    Você ganhou R$ {prize.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}!
                  </p>
                  <p className="text-white/50 text-sm mt-1">Valor creditado no seu saldo</p>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="text-3xl mb-2">😔</div>
                  <p className="text-white/60">Não foi dessa vez, tente novamente!</p>
                </div>
              )}
              <button
                onClick={startGame}
                className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition"
              >
                🎰 Jogar Novamente — R$ {game.price}
              </button>
              <Link
                href="/jogar"
                className="block w-full border border-white/20 text-white/60 py-3 rounded-xl hover:bg-white/5 transition text-sm"
              >
                Trocar de jogo
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
