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

  const project = projects.find((p) => p.id === task.projectId);
  const projectName = project ? project.name : null;

  return (
    <li className={`task-item ${task.status}`}>
      <div className="task-main">
        <h3>{task.title}</h3>
        {task.desc && <p className="task-desc">{task.desc}</p>}

        <div className="task-meta">
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

      <div className="task-actions">
        <button
          onClick={() => onToggleStatus(task.id)}
          className="btn-secondary"
        >
          {task.status === "concluida"
            ? "Marcar como pendente"
            : "Marcar como concluída"}
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
