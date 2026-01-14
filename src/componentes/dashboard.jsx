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
      <p className="dashboard-subtitle">
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

        <div className="dashboard-card dash-warning">
          <span className="dash-label">Em atraso</span>
          <span className="dash-value">{lateTasks}</span>
        </div>
      </div>
    </div>
  );
}
