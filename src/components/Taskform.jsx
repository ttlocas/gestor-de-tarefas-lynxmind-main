import React, { useState } from "react";

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_progresso", label: "Em progresso" },
  { value: "concluida", label: "Concluída" },
];

export default function TaskForm({ onAddTask, projects }) {
const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pendente");
  const [priority, setPriority] = useState("media");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      alert("O título é obrigatório.");
      return;
    }

    onAddTask({
      title: title.trim(),
       description: description.trim() || null,
      status,
      priority,
      dueDate: dueDate || null,
       project_id: projectId ? projectId : null,
    });

    setTitle("");
     setDescription("");
    setStatus("pendente");
    setPriority("media");
    setDueDate("");
    setProjectId("");
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>Título *</label>
        <input
          type="text"
          placeholder="Ex: Estudar React"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label>Descrição</label>
        <textarea
          placeholder="Detalhes da tarefa (opcional)"
             value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-grid">
        <div className="form-row">
          <label>Estado</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Prioridade</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>
  <div className="form-row date-field">
          <label>Data limite</label>
          <div className="date-wrapper">
            <input
              id="dateInput"
              type="date"
              value={dueDate || ""}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <button
              type="button"
              className="date-button"
              onClick={() =>
                document.getElementById("dateInput").showPicker?.()
              }
            >
              📅
            </button>
          </div>
        </div>
      </div>

      <div className="form-row">
        <label>Projeto</label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          <option value="">Sem projeto</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn-primary">
        Adicionar tarefa
      </button>
    </form>
  );
}  