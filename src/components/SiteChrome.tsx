"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "";

  // PÃ¡ginas /9bkp tÃªm o prÃ³prio layout, sem header/footer do site
  if (path.startsWith("/9bkp")) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main style={{ paddingTop: "72px", paddingBottom: "85px" }}>{children}</main>
      <footer style={{
        background: "linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 100%)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        marginTop: "4rem",
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "3rem 2rem 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "3rem", marginBottom: "2rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                <div style={{
                  width: 40, height: 40,
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  borderRadius: 10, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "1.2rem", color: "#fff", fontWeight: 800,
                }}>
                  <i className="bi bi-dice-3-fill" />
                </div>
                <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>RaspaPrÃªmio</span>
              </div>
              <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "0.5rem" }}>
                Â© 2025 RaspaPrÃªmio. Todos os direitos reservados.
              </p>
              <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.5 }}>
                Raspadinhas e outros jogos de azar sÃ£o regulamentados e cobertos pela nossa licenÃ§a de jogos. Jogue com responsabilidade.
              </p>
            </div>
            <div>
              <h3 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", borderBottom: "2px solid #ef4444", paddingBottom: "0.5rem", display: "inline-block" }}>Regulamentos</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Jogo responsÃ¡vel", "PolÃ­tica de Privacidade", "Termos de Uso"].map((item) => (
                  <li key={item} style={{ marginBottom: "0.75rem" }}>
                    <a href="#" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "0.95rem" }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", borderBottom: "2px solid #ef4444", paddingBottom: "0.5rem", display: "inline-block" }}>Ajuda</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Perguntas Frequentes", "Como Jogar", "Suporte TÃ©cnico"].map((item) => (
                  <li key={item} style={{ marginBottom: "0.75rem" }}>
                    <a href="#" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "0.95rem" }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
