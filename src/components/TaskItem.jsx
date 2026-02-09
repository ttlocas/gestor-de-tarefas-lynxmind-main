import React from "react";

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_progresso", label: "Em progresso" },
  { value: "concluida", label: "Concluída" },
];

export default function TaskItem({
  task,
  onToggleStatus,
  onDelete,
  canDelete,
  projects,
}) {
  const statusLabel =
    STATUS_OPTIONS.find((s) => s.value === task.status)?.label ||
    task.status;

  // Ajustado para bater com o nome da coluna vinda do Supabase (geralmente project_id)
  const project = projects.find((p) => p.id === (task.project_id || task.projectId));
  const projectName = project ? project.name : null;

  return (
    <li className={`task-item ${task.status}`}>
      <div className="task-main">
        <h3>{task.title}</h3>
        {/* Corrigido de task.desc para task.description conforme o seu formulário */}
        {(task.description || task.desc) && (
          <p className="task-desc">{task.description || task.desc}</p>
        )}

        <div className="task-meta" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
          <span className={`pill priority-${task.priority}`}>
            Prioridade: {task.priority}
          </span>

          <span className="pill">
            Estado: <strong>{statusLabel}</strong>
          </span>

          {task.dueDate && (
            <span className="pill">Prazo: {task.dueDate}</span>
          )}

          {projectName && (
            <span className="pill">Projeto: {projectName}</span>
          )}
        </div>
      </div>

      <div className="task-actions" style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <button
          onClick={() => onToggleStatus(task.id)}
          className="btn-secondary"
        >
          {task.status === "concluida"
            ? "Reabrir"
            : "Concluir"}
        </button>

        {canDelete && (
          <button onClick={() => onDelete(task.id)} className="btn-danger">
            Apagar
          </button>
        )}
      </div>
    </li>
  );
}