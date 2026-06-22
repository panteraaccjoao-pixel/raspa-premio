"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

interface User {
  name: string;
  balance: number;
}

// Logo "RaspaPrêmio" em SVG inline (dado em chamas estilo Blaze + texto) — não depende de arquivo
export function LogoMark({ size = 46 }: { size?: number }) {
  const pips: [number, number][] = [[0.27, 0.27], [0.73, 0.27], [0.5, 0.5], [0.27, 0.73], [0.73, 0.73]];
  const DX = 27, DY = 50, DW = 46; // posição/tamanho do dado
  return (
    <span className="logo-mark">
      <svg className="logo-flower" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="rp-fire" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#ffb938" />
            <stop offset="45%" stopColor="#ff5a1f" />
            <stop offset="100%" stopColor="#e10600" />
          </linearGradient>
          <linearGradient id="rp-fire-in" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#ffe06b" />
            <stop offset="100%" stopColor="#ff7a18" />
          </linearGradient>
          <linearGradient id="rp-die" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff6161" />
            <stop offset="55%" stopColor="#e10600" />
            <stop offset="100%" stopColor="#9e0d0d" />
          </linearGradient>
          <linearGradient id="rp-gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* chama (estilo Blaze, atrás do dado) */}
        <path fill="url(#rp-fire)" d="M52 2 C 60 22 74 32 74 52 C 74 70 62 82 50 82 C 38 82 26 70 26 52 C 26 40 34 34 42 42 C 42 28 50 18 52 2 Z" />
        {/* núcleo claro */}
        <path fill="url(#rp-fire-in)" d="M51 24 C 57 38 64 44 64 56 C 64 66 58 74 50 74 C 42 74 36 66 36 57 C 36 50 41 47 46 53 C 46 44 49 34 51 24 Z" />

        {/* dado (na frente, cobrindo a base das chamas) */}
        <g transform={`rotate(-10 ${DX + DW / 2} ${DY + DW / 2})`}>
          <rect x={DX} y={DY} width={DW} height={DW} rx="13" fill="url(#rp-die)" />
          <rect x={DX + 4} y={DY + 3} width={DW - 8} height={DW * 0.42} rx="10" fill="url(#rp-gloss)" />
          <rect x={DX} y={DY} width={DW} height={DW} rx="13" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="1.4" />
          <g fill="#ffffff">
            {pips.map(([px, py], i) => (
              <circle key={i} cx={DX + px * DW} cy={DY + py * DW} r="4.1" />
            ))}
          </g>
        </g>
      </svg>
      <span className="logo-text">
        <span className="lt-raspa">RASPA</span>
        <span className="lt-premio">PRÊMIO</span>
      </span>
    </span>
  );
}

function playFilterSound() {
  try {
    const audio = new Audio("/denielcz-immersivecontrol-button-click-sound-463065.mp3");
    audio.play().catch(() => {});
  } catch {}
}

function playMenuSound() {
  try {
    const audio = new Audio(encodeURI("/liecio-menu-buttom-pack-190019 (mp3cut.net) (2).mp3"));
    audio.play().catch(() => {});
  } catch {}
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />

      <style>{`
        .header {
          background: #000000;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 9999;
          padding: 1rem 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          display: flex;
          flex-direction: row;
          align-items: center;
          text-decoration: none;
          transition: all 0.3s ease;
          gap: 0.5rem;
        }
        .logo:hover { transform: scale(1.05); }
        .logo-mark { display: flex; align-items: center; gap: 0.5rem; }
        .logo-flower { flex-shrink: 0; filter: drop-shadow(0 2px 6px rgba(225,6,0,0.45)); }
        .logo-icon {
          width: 45px; height: 45px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; color: #fff; font-weight: 800;
          box-shadow: 0 8px 20px rgba(239,68,68,0.5), 0 0 30px rgba(239,68,68,0.25), 0 4px 8px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 0.95;
          gap: 0;
        }
        .logo-text span {
          font-size: 1.15rem; font-weight: 900;
          letter-spacing: 0.06em;
          font-family: 'Arial Narrow', 'Inter', sans-serif;
          transform: scaleY(1.05);
        }
        .lt-raspa { color: #ffffff; }
        .lt-premio { color: #e10600; }
        .mobile-menu-btn {
          display: none;
          color: white; font-size: 1.5rem; cursor: pointer;
          padding: 0.5rem; border-radius: 8px;
          transition: background-color 0.3s ease;
          background: none; border: none;
        }
        .mobile-menu-btn:hover { background: rgba(255,255,255,0.1); }
        .nav-menu {
          display: flex; align-items: center; gap: 2rem; list-style: none;
          margin: 0; padding: 0;
        }
        .nav-link {
          color: #9ca3af; text-decoration: none; font-weight: 500;
          transition: all 0.3s ease; position: relative;
        }
        .nav-link:hover { color: #fff; }
        .nav-link::after {
          content: ''; position: absolute; bottom: -4px; left: 0;
          width: 0; height: 2px; background: #ef4444; transition: width 0.3s ease;
        }
        .nav-link:hover::after { width: 100%; }
        .header-actions { display: flex; align-items: center; gap: 1rem; }
        .btn-login {
          color: #9ca3af; text-decoration: none; font-weight: 500;
          display: flex; align-items: center; gap: 0.5rem;
          transition: color 0.3s ease;
        }
        .btn-login:hover { color: #fff; }
        .btn-register {
          background: #ef4444; color: white; text-decoration: none;
          padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600;
          display: flex; align-items: center; gap: 0.5rem;
          transition: all 0.3s ease; border: none; cursor: pointer;
          font-family: inherit; font-size: 1rem;
          box-shadow: 0 0 12px rgba(239,68,68,0.4), 0 4px 15px rgba(239,68,68,0.3);
        }
        .btn-register:hover {
          background: #dc2626; transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(239,68,68,0.55), 0 6px 20px rgba(239,68,68,0.4);
        }
        .balance-display {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 0.5rem 1rem;
          display: flex; align-items: center; gap: 0.5rem;
          color: #ef4444; font-weight: 600; text-decoration: none;
        }
        .btn-deposit {
          background: #16C75B; color: white; border: none;
          padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600;
          display: flex; align-items: center; gap: 0.5rem;
          cursor: pointer; transition: all 0.3s ease;
          font-family: inherit; font-size: 1rem; text-decoration: none;
          box-shadow: 0 4px 14px rgba(22,163,74,0.35);
        }
        .btn-deposit:hover { background: #12a84d; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(22,163,74,0.5); }
        .user-dropdown { position: relative; }
        .user-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 0.75rem 1rem; color: white;
          display: flex; align-items: center; gap: 0.5rem;
          cursor: pointer; transition: all 0.3s ease; font-family: inherit;
        }
        .user-btn:hover { background: rgba(255,255,255,0.08); }
        .dropdown-arrow { transition: transform 0.3s ease; font-size: 0.8rem; }
        .dropdown-arrow.open { transform: rotate(180deg); }
        .dropdown-menu {
          position: absolute; top: calc(100% + 0.5rem); right: 0;
          min-width: 200px; background: rgba(20,20,20,0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          opacity: 0; visibility: hidden; transform: translateY(-10px);
          transition: all 0.3s ease; z-index: 100;
        }
        .dropdown-menu.open { opacity: 1; visibility: visible; transform: translateY(0); }
        .dropdown-item {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 1rem; color: #e5e7eb;
          text-decoration: none; background: none; border: none;
          width: 100%; text-align: left; cursor: pointer;
          transition: all 0.3s ease; font-size: 0.9rem; font-family: inherit;
        }
        .dropdown-item:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
        .dropdown-item.logout { color: #ef4444; }
        .dropdown-item.logout:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
        .dropdown-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 0.5rem 0; }

        /* Mobile Sidebar */
        .mobile-sidebar {
          position: fixed; top: 0; left: 0;
          width: 280px; height: 100vh;
          background: rgba(15,15,15,0.98);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255,255,255,0.1);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index: 1100; overflow-y: auto;
        }
        .mobile-sidebar.open { transform: translateX(0); }
        .sidebar-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .close-btn {
          background: none; border: none; color: #9ca3af;
          font-size: 1.5rem; cursor: pointer;
        }
        .sidebar-nav { padding: 1rem 0; }
        .sidebar-item {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 1.5rem; color: #e5e7eb;
          text-decoration: none; background: none; border: none;
          width: 100%; text-align: left; cursor: pointer;
          transition: all 0.3s ease; font-family: inherit; font-size: 1rem;
        }
        .sidebar-item:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
        .sidebar-item.logout-item { color: #ef4444; }
        .sidebar-item.logout-item:hover { background: rgba(239,68,68,0.1); }
        .sidebar-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 1rem 0; }
        .mobile-backdrop {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
          opacity: 0; visibility: hidden; transition: all 0.3s ease; z-index: 1050;
        }
        .mobile-backdrop.open { opacity: 1; visibility: visible; }

        /* Bottom Navigation */
        .bottom-navigation {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: rgba(0,0,0,0.98); backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 0.5rem 0; z-index: 999;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
          display: none;
        }
        .bottom-nav-container {
          display: flex; justify-content: space-around;
          align-items: center; padding: 0 1rem;
        }
        .bottom-nav-item {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 0.5rem 0.25rem; text-decoration: none;
          color: #9ca3af; transition: all 0.3s ease;
          border-radius: 12px; min-width: 60px;
          background: none; border: none; cursor: pointer; font-family: inherit;
        }
        .bottom-nav-item i { font-size: 1.2rem; margin-bottom: 0.25rem; }
        .bottom-nav-item span { font-size: 0.7rem; font-weight: 500; }
        .bottom-nav-item:hover, .bottom-nav-item.active { color: #ef4444; }
        .bottom-nav-item.register-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white; border-radius: 16px;
          padding: 0.75rem 0.5rem;
          box-shadow: 0 4px 15px rgba(239,68,68,0.5), 0 0 25px rgba(239,68,68,0.2);
        }
        .bottom-nav-item.register-btn:hover { background: linear-gradient(135deg,#dc2626,#b91c1c); color: white; }
        .bottom-nav-item.register-btn i { font-size: 1.4rem; }
        .bottom-nav-item.register-btn span { font-weight: 600; }

        @media (max-width: 768px) {
          .header-container { padding: 0 1rem; }
          .mobile-menu-btn { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; }
          .nav-menu { display: none; }
          .login-text { display: none; }
          .btn-register { padding: 0.5rem 1rem; font-size: 0.85rem; }
          .bottom-navigation { display: block; }
          .user-name { display: none; }
          .deposit-text { display: none; }
          .balance-display { padding: 0.5rem 0.75rem; font-size: 0.85rem; }
          .btn-deposit { padding: 0.5rem 0.75rem; font-size: 0.85rem; }
          .user-btn { padding: 0.5rem 0.75rem; }
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <div className="header-container">
          <Link href="/" className="logo">
            <LogoMark size={44} />
          </Link>

          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <i className="bi bi-list" />
          </button>

          <nav>
            <ul className="nav-menu">
              <li><Link href="/" className="nav-link" onClick={playMenuSound}>Início</Link></li>
              <li><Link href="/jogar" className="nav-link">Raspadinhas</Link></li>
            </ul>
          </nav>

          <div className="header-actions">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/depositar" className="balance-display">
                      <i className="bi bi-wallet2" />
                      R$ {user.balance.toFixed(2)}
                    </Link>
                    <Link href="/depositar" className="btn-deposit">
                      <i className="bi bi-plus-circle" />
                      <span className="deposit-text">Depositar</span>
                    </Link>
                    <div className="user-dropdown" ref={dropdownRef}>
                      <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                        <i className="bi bi-person-circle" />
                        <span className="user-name">{user.name.split(" ")[0]}</span>
                        <i className={`bi bi-chevron-down dropdown-arrow${dropdownOpen ? " open" : ""}`} />
                      </button>
                      <div className={`dropdown-menu${dropdownOpen ? " open" : ""}`}>
                        <Link href="/jogar" className="dropdown-item" onClick={playFilterSound}>
                          <i className="bi bi-grid-3x3-gap" />
                          Jogar
                        </Link>
                        <Link href="/perfil" className="dropdown-item" onClick={playFilterSound}>
                          <i className="bi bi-person" />
                          Perfil
                        </Link>
                        <Link href="/depositar" className="dropdown-item" onClick={playFilterSound}>
                          <i className="bi bi-plus-circle" />
                          Depósito
                        </Link>
                        <Link href="/sacar" className="dropdown-item" onClick={playFilterSound}>
                          <i className="bi bi-dash-circle" />
                          Saque
                        </Link>
                        <Link href="/transacoes" className="dropdown-item" onClick={playFilterSound}>
                          <i className="bi bi-arrow-left-right" />
                          Transações
                        </Link>
                        <Link href="/jogar" className="dropdown-item" onClick={playFilterSound}>
                          <i className="bi bi-controller" />
                          Apostas
                        </Link>
                        <div className="dropdown-divider" />
                        <button className="dropdown-item logout" onClick={() => { playFilterSound(); logout(); }}>
                          <i className="bi bi-box-arrow-left" />
                          Sair
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/entrar" className="btn-login">
                      <i className="bi bi-person" />
                      <span className="login-text">Entrar</span>
                    </Link>
                    <Link href="/cadastrar" className="btn-register">
                      <i className="bi bi-dice-3-fill" />
                      Registrar
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <aside className={`mobile-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-header">
          <Link href="/" className="logo" onClick={() => setSidebarOpen(false)}>
            <LogoMark size={38} />
          </Link>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            <i className="bi bi-x" />
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link href="/" className="sidebar-item" onClick={() => { playMenuSound(); setSidebarOpen(false); }}>
            <i className="bi bi-house" /> Início
          </Link>
          <Link href="/jogar" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
            <i className="bi bi-grid-3x3-gap" /> Raspadinhas
          </Link>
          <div className="sidebar-divider" />
          {user ? (
            <>
              <Link href="/depositar" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
                <i className="bi bi-plus-circle" /> Depositar
              </Link>
              <Link href="/perfil" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
                <i className="bi bi-person" /> Minha Conta
              </Link>
              <button className="sidebar-item logout-item" onClick={() => { setSidebarOpen(false); logout(); }}>
                <i className="bi bi-box-arrow-left" /> Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/entrar" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
                <i className="bi bi-box-arrow-in-right" /> Entrar
              </Link>
              <Link href="/cadastrar" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
                <i className="bi bi-person-plus" /> Registrar
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Backdrop */}
      <div className={`mobile-backdrop${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Bottom Navigation */}
      <nav className="bottom-navigation">
        <div className="bottom-nav-container">
          {user ? (
            <>
              <Link href="/" className="bottom-nav-item" onClick={playMenuSound}>
                <i className="bi bi-house-fill" /><span>Início</span>
              </Link>
              <Link href="/jogar" className="bottom-nav-item">
                <i className="bi bi-grid-3x3-gap-fill" /><span>Jogar</span>
              </Link>
              <Link href="/depositar" className="bottom-nav-item register-btn">
                <i className="bi bi-plus-circle-fill" /><span>Depositar</span>
              </Link>
              <Link href="/perfil" className="bottom-nav-item">
                <i className="bi bi-person-fill" /><span>Perfil</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className="bottom-nav-item active" onClick={playMenuSound}>
                <i className="bi bi-house-fill" /><span>Início</span>
              </Link>
              <Link href="/jogar" className="bottom-nav-item">
                <i className="bi bi-grid-3x3-gap-fill" /><span>Jogar</span>
              </Link>
              <Link href="/entrar" className="bottom-nav-item">
                <i className="bi bi-person-fill" /><span>Entrar</span>
              </Link>
              <Link href="/cadastrar" className="bottom-nav-item register-btn">
                <i className="bi bi-dice-3-fill" /><span>Registrar</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
