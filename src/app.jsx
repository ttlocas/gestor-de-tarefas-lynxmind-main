import React, { useState, useEffect } from "react";
import { supabase } from './supabaseClient'; // Importa o cliente Supabase (cria este ficheiro se ainda não tens)

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_progresso", label: "Em progresso" },
  { value: "concluida", label: "Concluída" },
];

const API_URL = "http://localhost:3001";

function App() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // lista de utilizadores para “gestão” (sem passwords)
  const [userList, setUserList] = useState([]);

  // carregar sessão + dados do servidor
  useEffect(() => {
    // Verifica se já existe sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Escuta mudanças de login/logout
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user ?? null);
        setAuthLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    async function fetchData() {
      setLoading(true);
      try {
        const [resTasks, resProjects] = await Promise.all([
          fetch(`${API_URL}/tasks`),
          fetch(`${API_URL}/projects`),
        ]);

        if (!resTasks.ok || !resProjects.ok) throw new Error("Falha no fetch");

        setTasks(await resTasks.json());
        setProjects(await resProjects.json());
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        alert("Erro ao carregar dados do servidor.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUser]);

  // === AUTENTICAÇÃO ===
  async function handleLogin(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return false;
      }

      return true;
    } catch (err) {
      alert("Erro inesperado no login: " + err.message);
      return false;
    }
  }

  async function handleSignup(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: email.split('@')[0] },
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Conta criada! Verifica o teu email para confirmar.");
    } catch (err) {
      alert("Erro ao criar conta: " + err.message);
    }
  }

  function handleLogout() {
    supabase.auth.signOut();
  }

  // === HANDLERS BACKEND ===
  async function handleAddTask(newTask) {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (!res.ok) {
        throw new Error("Erro ao criar tarefa");
      }

      const resTasks = await fetch(`${API_URL}/tasks`);
      const tasksData = await resTasks.json();
      setTasks(tasksData);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar tarefa na base de dados.");
    }
  }

  async function handleToggleStatus(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newStatus =
      task.status === "concluida" ? "pendente" : "concluida";

    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar tarefa");

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar tarefa na base de dados.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Tens a certeza que queres apagar esta tarefa?")) return;

    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao apagar tarefa");

      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erro ao apagar tarefa na base de dados.");
    }
  }

  async function handleAddProject(newProject) {
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (!res.ok) throw new Error("Erro ao criar projeto");

      const created = await res.json();
      setProjects((prev) => [...prev, created]);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar projeto.");
    }
  }

  // === GESTÃO DE UTILIZADORES (apenas no frontend) ===
  function handleUpdateUser(id, updates) {
    setUserList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  }

  function handleAddUser(newUser) {
    const id = Date.now(); // id simples só para frontend
    const user = {
      id,
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      role: newUser.role,
      active: true,
    };
    setUserList((prev) => [...prev, user]);
    alert(`Utilizador ${newUser.name} adicionado com sucesso!`);
  }

  // === ESTATÍSTICAS PARA O DASHBOARD ===
  const totalProjects = projects.length;
  const totalTasks = tasks.length;

  const tasksPending = tasks.filter((t) => t.status === "pendente").length;
  const tasksInProgress = tasks.filter(
    (t) => t.status === "em_progresso"
  ).length;
  const tasksDone = tasks.filter((t) => t.status === "concluida").length;

  const today = new Date().toISOString().slice(0, 10);
  const lateTasks = tasks.filter(
    (t) => t.dueDate && t.dueDate < today && t.status !== "concluida"
  ).length;

  const filteredTasks =
    filterStatus === "todas"
      ? tasks
      : tasks.filter((t) => t.status === filterStatus);

  if (authLoading) {
    return <div className="app-container">A verificar sessão...</div>;
  }

  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    );
  }

  // permissões básicas (ajusta para obter role do Supabase se guardares no user_metadata ou profiles)
  const userRole = currentUser?.user_metadata?.role || 'colab'; // fallback para 'colab'
  const canManageProjects = userRole === "admin" || userRole === "gestor";
  const canDeleteTasks = userRole === "admin" || userRole === "gestor";
  const canManageUsers = userRole === "admin";

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="topbar">
          <div className="logo-area">
            <svg
              className="logo"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#00D5A5"
                strokeWidth="6"
              />
              <path
                d="M30 60 C40 30, 60 30, 70 60"
                stroke="#38BDF8"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <circle cx="40" cy="50" r="5" fill="#00D5A5" />
              <circle cx="60" cy="50" r="5" fill="#00D5A5" />
            </svg>

            <h1 className="gradient-title">
              Lynxmind · Portal de Gestão de Tarefas & Projetos
            </h1>
          </div>

          <div className="user-area">
            <span className="user-pill">
              <span className="user-name">{currentUser.email}</span> {/* Ajusta para name se tiveres */}
            </span>
            <button className="btn-secondary" onClick={handleLogout}>
              Terminar sessão
            </button>
          </div>
        </div>

        <p>Organiza projetos, tarefas, equipas e prazos como um verdadeiro Lynx 🐾</p>
      </header>

      <main
        className="app-main"
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
      >
        {/* DASHBOARD */}
        <section className="card">
          <Dashboard
            totalProjects={totalProjects}
            totalTasks={totalTasks}
            tasksPending={tasksPending}
            tasksInProgress={tasksInProgress}
            tasksDone={tasksDone}
            lateTasks={lateTasks}
          />
        </section>

        {/* GESTÃO DE UTILIZADORES */}
        <section className="card">
          <h2>Gestão de Utilizadores</h2>
          <UsersPanel
            currentUser={currentUser}
            users={userList}
            onUpdateUser={handleUpdateUser}
            onAddUser={handleAddUser}
            canManageUsers={canManageUsers}
          />
        </section>

        {/* Painel de Projetos */}
        <section className="card">
          <h2>Projetos</h2>
          <ProjectsPanel
            projects={projects}
            onAddProject={handleAddProject}
            canManageProjects={canManageProjects}
          />
        </section>

        {/* Criar Tarefa */}
        <section className="card">
          <h2>Criar nova tarefa</h2>
          <TaskForm onAddTask={handleAddTask} projects={projects} />
        </section>

        {/* Lista de Tarefas */}
        <section className="card">
          <div className="list-header">
            <h2>Minhas tarefas</h2>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="todas">Todas</option>
              <option value="pendente">Pendentes</option>
              <option value="em_progresso">Em progresso</option>
              <option value="concluida">Concluídas</option>
            </select>
          </div>

          {loading ? (
            <p className="empty">A carregar tarefas...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="empty">Nenhuma tarefa por aqui ainda… 😴</p>
          ) : (
            <ul className="task-list">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  projects={projects} // Adicionado para resolver projectName
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  canDelete={canDeleteTasks}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

/* === LOGIN SCREEN === */

function LoginScreen({ onLogin, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignupMode, setIsSignupMode] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSignupMode) {
      await onSignup(email.trim(), password);
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
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#00D5A5"
              strokeWidth="6"
            />
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

        <p>{isSignupMode ? "Criar conta" : "Iniciar sessão"}</p>
      </header>

      <section className="card">
        <form className="task-form" onSubmit={handleSubmit}>
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

          <button type="submit" className="btn-primary">
            {isSignupMode ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsSignupMode(!isSignupMode)}
          >
            {isSignupMode
              ? "Já tenho conta → Entrar"
              : "Não tenho conta → Registar"}
          </button>
        </div>

        <div style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "#9ca3af" }}>
          <p>Nota: após registo, confirma o email antes de entrar.</p>
        </div>
      </section>
    </div>
  );
}

/* === DASHBOARD === */

function Dashboard({
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

/* === USERS PANEL === */

function UsersPanel({
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

              <p className="users-note">
                {/* Adiciona nota se quiseres */}
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/* === PROJETOS / TAREFAS === */

function ProjectsPanel({ projects, onAddProject, canManageProjects }) {
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

function TaskForm({ onAddTask, projects }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
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
      desc: desc.trim(),
      status,
      priority,
      dueDate: dueDate || null,
      projectId: projectId ? Number(projectId) : null,
    });

    setTitle("");
    setDesc("");
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
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
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
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
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

function TaskItem({ task, onToggleStatus, onDelete, canDelete, projects }) {
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

export default App;