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
  const [role, setRole] = useState("colab");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert("Nome e email são obrigatórios.");
      return;
    }
    onAddUser({ name, email, role });
    setName("");
    setEmail("");
    setRole("colab");
  }

  return (
    <div className="users-wrapper">
      {!canManageUsers && (
        <p className="empty">
          Apenas o perfil <strong>admin</strong> pode gerir utilizadores.
          Estás autenticado como <strong>{currentUser.role}</strong>.
        </p>
      )}

      <div className="users-layout">
        <div className="users-table-card">
          <h3>Lista de utilizadores</h3>
          <table className="users-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Papel</th>
                <th>Estado</th>
                {canManageUsers && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    {canManageUsers ? (
                      <select
                        value={u.role}
                        onChange={(e) =>
                          onUpdateUser(u.id, { role: e.target.value })
                        }
                      >
                        <option value="admin">admin</option>
                        <option value="gestor">gestor</option>
                        <option value="colab">colab</option>
                      </select>
                    ) : (
                      <span className="badge-role">{u.role}</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={
                        u.active ? "badge-active" : "badge-inactive"
                      }
                    >
                      {u.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  {canManageUsers && (
                    <td>
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
              ))}
            </tbody>
          </table>
        </div>

        {canManageUsers && (
          <div className="users-form-card">
            <h3>Criar novo utilizador</h3>
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
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="admin">admin</option>
                  <option value="gestor">gestor</option>
                  <option value="colab">colab</option>
                </select>
              </div>

              <button type="submit" className="btn-primary">
                Adicionar utilizador
              </button>

              <p className="users-note">{/* Adiciona nota se quiseres */}</p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
