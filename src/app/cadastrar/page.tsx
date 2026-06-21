"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STEPS = [
  { icon: "bi-person-plus", title: "Crie sua conta", desc: "Cadastro rápido e gratuito em menos de 1 minuto." },
  { icon: "bi-wallet2", title: "Faça um depósito", desc: "Deposite via PIX e o saldo cai na hora." },
  { icon: "bi-grid-3x3-gap", title: "Escolha e raspe", desc: "Escolha sua raspadinha favorita e descubra o prêmio." },
  { icon: "bi-cash-coin", title: "Receba na hora", desc: "Ganhou? O prêmio vai direto pro seu PIX." },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.ok) {
      router.push("/");
    } else {
      setError(data.error || "Erro ao cadastrar");
      setLoading(false);
    }
  }

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />

      <style>{`
        .login-section {
          padding: 4rem 0;
          background: #0a0a0a;
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .login-container {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .left-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }

        .brand-content { position: relative; z-index: 2; }

        .brand-title {
          font-size: 3rem;
          font-weight: 900;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ffffff, #9ca3af);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.1;
        }

        .brand-subtitle {
          font-size: 1.1rem;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 3rem;
        }

        .highlight-text {
          color: #ef4444;
          font-weight: 700;
          -webkit-text-fill-color: #ef4444;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #e5e7eb;
          font-size: 1.1rem;
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          background: rgba(239, 68, 68, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ef4444;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .right-section {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-card {
          background: rgba(20, 20, 20, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 3rem;
          width: 100%;
          max-width: 450px;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 150px; height: 150px;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), transparent);
          border-radius: 50%;
          transform: translate(50%, -50%);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
          position: relative;
          z-index: 2;
        }

        .login-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 16px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.25);
        }

        .login-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
        }

        .login-subtitle {
          color: #9ca3af;
          font-size: 1rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
          z-index: 2;
        }

        .form-group { position: relative; }

        .form-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #ef4444;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .form-input::placeholder { color: #6b7280; }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 1rem;
          transition: color 0.3s ease;
          pointer-events: none;
        }

        .form-group:focus-within .input-icon { color: #ef4444; }

        .submit-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.5), 0 0 30px rgba(239, 68, 68, 0.2);
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(239, 68, 68, 0.6), 0 0 50px rgba(239, 68, 68, 0.3);
        }

        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }

        .submit-btn:hover::before { left: 100%; }

        .form-footer {
          text-align: center;
          margin-top: 2rem;
          position: relative;
          z-index: 2;
        }

        .footer-text { color: #6b7280; margin-bottom: 0.5rem; }

        .footer-link {
          color: #ef4444;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .footer-link:hover { color: #dc2626; text-decoration: underline; }

        .divider {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .divider span { padding: 0 1rem; }

        /* Floating dots */
        .floating-elements {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .floating-element {
          position: absolute;
          width: 8px; height: 8px;
          background: rgba(239, 68, 68, 0.3);
          border-radius: 50%;
          animation: floatAnim 6s ease-in-out infinite;
        }

        .floating-element:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
        .floating-element:nth-child(2) { top: 40%; right: 15%; animation-delay: 1s; }
        .floating-element:nth-child(3) { bottom: 30%; left: 20%; animation-delay: 2s; }
        .floating-element:nth-child(4) { bottom: 20%; right: 25%; animation-delay: 3s; }

        @keyframes floatAnim {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }

        .error-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.9rem;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .fade-in { animation: fadeIn 0.6s ease-out forwards; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Steps */
        .steps-section {
          padding: 4rem 2rem;
          background:
            radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(220, 38, 38, 0.03) 0%, transparent 50%);
          font-family: 'Inter', sans-serif;
        }
        .section-head { text-align: center; max-width: 700px; margin: 0 auto 3rem; }
        .section-title { font-size: 2.4rem; font-weight: 900; color: #fff; margin-bottom: 0.75rem; }
        .section-title span { color: #ef4444; }
        .section-sub { color: #9ca3af; font-size: 1.05rem; }
        .steps-container { max-width: 1200px; margin: 0 auto; }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2rem;
        }
        .step-item { text-align: center; transition: all 0.3s ease; }
        .step-item:hover { transform: translateY(-8px); }
        .step-icon {
          width: 100px; height: 100px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(145deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.9) 100%);
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem; color: #ef4444;
          transition: all 0.4s ease; backdrop-filter: blur(20px);
          position: relative;
        }
        .step-num {
          position: absolute; top: -6px; right: -6px;
          width: 30px; height: 30px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; font-weight: 800; color: #fff;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
        .step-item:hover .step-icon {
          border-color: #ef4444; transform: scale(1.05);
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.3), 0 0 60px rgba(239, 68, 68, 0.1);
        }
        .step-title { font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem; }
        .step-description { font-size: 0.95rem; color: #9ca3af; line-height: 1.5; }
        .step-item:hover .step-description { color: #e5e7eb; }

        @media (max-width: 1024px) {
          .login-container { grid-template-columns: 1fr; max-width: 500px; }
          .left-section { display: none; }
        }

        @media (max-width: 768px) {
          .login-card { padding: 2rem; }
          .section-title { font-size: 1.8rem; }
          .steps-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="login-section">
        <div className="floating-elements">
          <div className="floating-element" />
          <div className="floating-element" />
          <div className="floating-element" />
          <div className="floating-element" />
        </div>

        <div className="login-container fade-in">
          {/* Left */}
          <div className="left-section">
            <div className="brand-content">
              <h1 className="brand-title">Crie sua conta grátis!</h1>
              <p className="brand-subtitle">
                Cadastre-se agora e comece a ganhar{" "}
                <span className="highlight-text">prêmios incríveis</span>{" "}
                com nossas raspadinhas!
              </p>

              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon"><i className="bi bi-shield-check" /></div>
                  <span>Cadastro 100% seguro</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon"><i className="bi bi-lightning" /></div>
                  <span>PIX instantâneo</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon"><i className="bi bi-trophy" /></div>
                  <span>Prêmios de até R$ 15.000</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon"><i className="bi bi-headset" /></div>
                  <span>Suporte 24/7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="right-section">
            <div className="login-card">
              <div className="login-header">
                <div className="login-icon">
                  <i className="bi bi-person-plus-fill" />
                </div>
                <h2 className="login-title">Criar sua conta</h2>
                <p className="login-subtitle">Preencha os dados e comece a ganhar</p>
              </div>

              <form onSubmit={submit} className="login-form">
                {error && <div className="error-box">{error}</div>}

                <div className="form-group">
                  <div className="input-icon"><i className="bi bi-person" /></div>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Seu nome completo"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <div className="input-icon"><i className="bi bi-envelope" /></div>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <div className="input-icon"><i className="bi bi-telephone" /></div>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    className="form-input"
                    placeholder="(00) 00000-0000"
                    value={form.phone}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, "").slice(0, 11);
                      const masked = d
                        .replace(/(\d{2})(\d)/, "($1) $2")
                        .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
                      setForm({ ...form, phone: masked });
                    }}
                  />
                </div>

                <div className="form-group">
                  <div className="input-icon"><i className="bi bi-lock" /></div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="form-input"
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  <i className="bi bi-dice-3-fill" />
                  {loading ? "Criando conta..." : "Criar Conta Grátis"}
                </button>
              </form>

              <div className="form-footer">
                <div className="divider"><span>ou</span></div>
                <p className="footer-text">Já tem uma conta?</p>
                <Link href="/entrar" className="footer-link">Entrar</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="steps-section">
        <div className="steps-container">
          <div className="section-head">
            <h2 className="section-title">Como <span>Funciona</span></h2>
            <p className="section-sub">Comece a ganhar em 4 passos simples</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div className="step-item" key={s.title}>
                <div className="step-icon">
                  <i className={`bi ${s.icon}`} />
                  <span className="step-num">{i + 1}</span>
                </div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-description">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
