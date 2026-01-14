import React, { useState } from "react";

export default function ProjectsPanel({ projects, onAddProject, canManageProjects }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      alert("O nome do projeto é obrigatório.");
      return;
    }

    onAddProject({
      name: name.trim(),
      description: description.trim() || "",
    });

    setName("");
    setDescription("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {canManageProjects ? (
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Nome do projeto *</label>
            <input
              type="text"
              placeholder="Ex: Portal Interno da Empresa"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Descrição</label>
            <textarea
              placeholder="Breve descrição do projeto (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary">
            Adicionar projeto
          </button>
        </form>
      ) : (
        <p className="empty">
          Apenas utilizadores com papel <strong>admin</strong> ou{" "}
          <strong>gestor</strong> podem criar projetos.
        </p>
      )}

      {projects.length === 0 ? (
        <p className="empty">Ainda não tens projetos criados.</p>
      ) : (
        <ul className="task-list">
          {projects.map((p) => (
            <li key={p.id} className="task-item">
              <div className="task-main">
                <h3>{p.name}</h3>
                {p.description && (
                  <p className="task-desc">{p.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
