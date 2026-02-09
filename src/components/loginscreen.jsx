import React, { useState } from "react";

export default function LoginScreen({ onLogin, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [isSignupMode, setIsSignupMode] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (isSignupMode) {
      await onSignup(email.trim(), password, nome.trim());
    } else {
      await onLogin(email.trim(), password);
    }
  }

  return (
    <div className="app-container" style={{ maxWidth: 480 }}>
      <header className="app-header">
        <div className="logo-area">
          <svg
            className="logo"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="45" stroke="#00D5A5" strokeWidth="6" />
            <path
              d="M30 60 C40 30, 60 30, 70 60"
              stroke="#38BDF8"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="40" cy="50" r="5" fill="#00D5A5" />
            <circle cx="60" cy="50" r="5" fill="#00D5A5" />
          </svg>

          <h1 className="gradient-title">Lynxmind · Portal Interno</h1>
        </div>

        <p style={{ marginTop: "0.5rem" }}>
          {isSignupMode ? "Criar conta" : "Iniciar sessão"}
        </p>
      </header>

      <section className="card">
        <form className="task-form" onSubmit={handleSubmit}>
          {isSignupMode && (
            <div className="form-row">
              <label>Nome</label>
              <input
                type="text"
                placeholder="O teu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              placeholder="o.teu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%" }}>
            {isSignupMode ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ width: "100%" }}
            onClick={() => setIsSignupMode(!isSignupMode)}
          >
            {isSignupMode
              ? "Já tenho conta → Entrar"
              : "Não tenho conta → Registar"}
          </button>
        </div>

        <div
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            fontSize: "0.85rem",
            color: "#6b7280",
          }}
        >
          <p>Nota: após registo, confirma o email antes de entrar.</p>
        </div>
      </section>
    </div>
  );
}