"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(data.error || "Erro ao entrar");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0a0a0a", fontFamily: "'Inter', sans-serif", padding: "1rem",
    }}>
      <form onSubmit={submit} style={{
        background: "rgba(20,20,20,0.9)", border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: 20, padding: "2.5rem", width: "100%", maxWidth: 380,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 50px rgba(239,68,68,0.1)",
      }}>
        <div style={{
          width: 60, height: 60, margin: "0 auto 1.5rem",
          background: "linear-gradient(135deg, #ef4444, #dc2626)", borderRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: "1.6rem",
          boxShadow: "0 8px 24px rgba(239,68,68,0.5)",
        }}>
          <i className="bi bi-shield-lock-fill" />
        </div>
        <h1 style={{ textAlign: "center", color: "#fff", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.4rem" }}>
          Painel Admin
        </h1>
        <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
          Digite a senha de administrador
        </p>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171", padding: "0.7rem", borderRadius: 12, fontSize: "0.85rem",
            textAlign: "center", marginBottom: "1rem",
          }}>{error}</div>
        )}

        <input
          type="password"
          autoFocus
          required
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%", boxSizing: "border-box", padding: "0.9rem 1rem",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, color: "#fff", fontSize: "1rem", marginBottom: "1rem",
            fontFamily: "inherit",
          }}
        />

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "0.9rem", border: "none", borderRadius: 12,
          background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff",
          fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          boxShadow: "0 4px 20px rgba(239,68,68,0.4)", opacity: loading ? 0.6 : 1,
        }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
