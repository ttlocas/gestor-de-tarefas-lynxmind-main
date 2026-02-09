import React from "react";

export default function Dashboard({
  totalProjects,
  totalTasks,
  tasksPending,
  tasksInProgress,
  tasksDone,
  lateTasks,
}) {
  return (
    <div>
      <h2>Resumo geral</h2>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
        Indicadores rápidos do portal (projetos, tarefas e atrasos)
      </p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <span className="dash-label">Projetos ativos</span>
          <span className="dash-value">{totalProjects}</span>
        </div>

        <div className="dashboard-card">
          <span className="dash-label">Total de tarefas</span>
          <span className="dash-value">{totalTasks}</span>
        </div>

        <div className="dashboard-card">
          <span className="dash-label">Pendentes</span>
          <span className="dash-value">{tasksPending}</span>
        </div>

        <div className="dashboard-card">
          <span className="dash-label">Em progresso</span>
          <span className="dash-value">{tasksInProgress}</span>
        </div>

        <div className="dashboard-card">
          <span className="dash-label">Concluídas</span>
          <span className="dash-value">{tasksDone}</span>
        </div>

        {/* Adicionei um estilo condicional para o card de atraso se destacar */}
        <div className={`dashboard-card ${lateTasks > 0 ? 'dash-warning' : ''}`} 
             style={lateTasks > 0 ? { borderLeft: "4px solid var(--danger)" } : {}}>
          <span className="dash-label">Em atraso</span>
          <span className="dash-value" style={lateTasks > 0 ? { color: "var(--danger)" } : {}}>
            {lateTasks}
          </span>
        </div>
      </div>
    </div>
  );
}