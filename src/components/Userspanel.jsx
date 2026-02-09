import React, { useState } from "react";

export default function UsersPanel({
  currentUser,
  users,
  onUpdateUser,
  onAddUser,
  canManageUsers,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("utilizador");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert("Nome e email são obrigatórios.");
      return;
    }

    onAddUser({ name, email, role });

    setName("");
    setEmail("");
    setRole("utilizador");
  }

  return (
    <div className="users-wrapper">
      {!canManageUsers && (
        <p className="empty" style={{ marginBottom: "1.5rem" }}>
          Apenas o perfil <strong>admin</strong> pode gerir utilizadores.
          Estás autenticado como <strong>{currentUser?.role || "utilizador"}</strong>.
        </p>
      )}

      <div className="users-layout" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* TABELA DE UTILIZADORES */}
        <div className="users-table-card">
          <h3 style={{ marginBottom: "1rem" }}>Lista de utilizadores</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="users-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border-soft)" }}>
                  <th style={{ padding: "0.75rem" }}>Nome</th>
                  <th style={{ padding: "0.75rem" }}>Email</th>
                  <th style={{ padding: "0.75rem" }}>Papel</th>
                  <th style={{ padding: "0.75rem" }}>Estado</th>
                  {canManageUsers && <th style={{ padding: "0.75rem" }}>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={canManageUsers ? 5 : 4} className="empty" style={{ padding: "2rem", textAlign: "center" }}>
                      Nenhum utilizador registado ainda…
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                      <td style={{ padding: "0.75rem" }}>{u.full_name || u.name}</td>
                      <td style={{ padding: "0.75rem" }}>{u.email}</td>
                      <td style={{ padding: "0.75rem" }}>
                        {canManageUsers ? (
                          /* WRAPPER ADICIONADO PARA O SELECT NA TABELA */
                          <div className="select-wrapper" style={{ width: "140px" }}>
                            <select
                              value={u.role}
                              onChange={(e) =>
                                onUpdateUser(u.id, { role: e.target.value })
                              }
                            >
                              <option value="admin">admin</option>
                              <option value="utilizador">utilizador</option>
                            </select>
                          </div>
                        ) : (
                          <span className="pill">{u.role || "utilizador"}</span>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <span className={`pill ${u.active ? "badge-active" : "badge-inactive"}`}>
                          {u.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      {canManageUsers && (
                        <td style={{ padding: "0.75rem" }}>
                          <button
                            className="btn-secondary"
                            onClick={() =>
                              onUpdateUser(u.id, { active: !u.active })
                            }
                          >
                            {u.active ? "Desativar" : "Ativar"}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FORMULÁRIO DE CRIAÇÃO (APENAS ADMIN) */}
        {canManageUsers && (
          <div className="users-form-card" style={{ borderTop: "1px solid var(--border-soft)", paddingTop: "2rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Criar novo utilizador</h3>
            <form className="task-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Nome *</label>
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <label>Email *</label>
                <input
                  type="email"
                  placeholder="utilizador@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-row">
                <label>Papel</label>
                {/* WRAPPER ADICIONADO PARA O SELECT NO FORMULÁRIO */}
                <div className="select-wrapper">
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="admin">admin</option>
                    <option value="utilizador">utilizador</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>
                Adicionar utilizador
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}