// src/App.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

import LoginScreen from "./components/loginscreen";
import Dashboard from "./components/dashboard";
import UsersPanel from "./components/Userspanel";
import ProjectsPanel from "./components/Projectspanel";
import TaskForm from "./components/Taskform";
import TaskItem from "./components/TaskItem";

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
  const [userList, setUserList] = useState([]);

  // Sessão Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setAuthLoading(false);
    });

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

  // Fetch de dados
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
        alert("Erro ao carregar dados do servidor.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUser]);

  // Auth
  async function handleLogin(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      return false;
    }
    return true;
  }

  async function handleSignup(email, password) {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: email.split('@')[0] } },
    });

    if (error) return alert(error.message);
    alert("Conta criada! Verifica o email para confirmar.");
  }

  function handleLogout() { supabase.auth.signOut(); }

  // Backend Tasks
  async function handleAddTask(newTask) {
    try {
      await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      const res = await fetch(`${API_URL}/tasks`);
      setTasks(await res.json());
    } catch {
      alert("Erro ao criar tarefa.");
    }
  }

  async function handleToggleStatus(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newStatus = task.status === "concluida" ? "pendente" : "concluida";

    await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  }

  async function handleDelete(id) {
    if (!confirm("Tens a certeza que queres apagar esta tarefa?")) return;
    await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  // Projects
  async function handleAddProject(newProject) {
    const res = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    });
    setProjects(prev => [...prev, res.json()]);
  }

  // Users (frontend)
  function handleUpdateUser(id, updates) {
    setUserList(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }
  function handleAddUser(newUser) {
    setUserList(prev => [...prev, { id: Date.now(), ...newUser, active: true }]);
  }

  // Estatísticas
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const tasksPending = tasks.filter(t => t.status === "pendente").length;
  const tasksInProgress = tasks.filter(t => t.status === "em_progresso").length;
  const tasksDone = tasks.filter(t => t.status === "concluida").length;

  const today = new Date().toISOString().slice(0, 10);
  const lateTasks = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== "concluida").length;

  const filteredTasks = filterStatus === "todas" ? tasks : tasks.filter(t => t.status === filterStatus);

  if (authLoading) return <div className="app-container">A verificar sessão...</div>;
  if (!currentUser) return <LoginScreen onLogin={handleLogin} onSignup={handleSignup} />;

  // Permissões
  const userRole = currentUser?.user_metadata?.role || "colab";
  const canManageProjects = ["admin", "gestor"].includes(userRole);
  const canDeleteTasks = ["admin", "gestor"].includes(userRole);
  const canManageUsers = userRole === "admin";

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="topbar">
          <div className="logo-area">
            {/* SVG original mantido */}
            <svg className="logo" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" stroke="#00D5A5" strokeWidth="6" />
              <path d="M30 60 C40 30, 60 30, 70 60" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />
              <circle cx="40" cy="50" r="5" fill="#00D5A5" />
              <circle cx="60" cy="50" r="5" fill="#00D5A5" />
            </svg>
            <h1 className="gradient-title">Lynxmind · Portal de Gestão de Tarefas & Projetos</h1>
          </div>

          <div className="user-area">
            <span className="user-pill"><span className="user-name">{currentUser.email}</span></span>
            <button className="btn-secondary" onClick={handleLogout}>Terminar sessão</button>
          </div>
        </div>
        <p>Organiza projetos, tarefas, equipas e prazos como um verdadeiro Lynx 🐾</p>
      </header>

      {/* MAIN */}
      <main className="app-main" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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

        <section className="card">
          <h2>Projetos</h2>
          <ProjectsPanel
            projects={projects}
            onAddProject={handleAddProject}
            canManageProjects={canManageProjects}
          />
        </section>

        <section className="card">
          <h2>Criar nova tarefa</h2>
          <TaskForm onAddTask={handleAddTask} projects={projects} />
        </section>

        <section className="card">
          <div className="list-header">
            <h2>Minhas tarefas</h2>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
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
              {filteredTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  projects={projects}
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

export default App;
