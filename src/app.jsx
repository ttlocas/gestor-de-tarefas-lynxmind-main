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

function App() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [userRole, setUserRole] = useState("user");
  const [userNome, setUserNome] = useState(null);

  // Dark mode
  const [darkMode, setDarkMode] = useState(false);

  // Atualiza a classe "dark" no <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Buscar perfil
  useEffect(() => {
    if (!currentUser) return;

    async function fetchUserProfile() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([{
              id: currentUser.id,
              full_name: currentUser.email,
              role: "user",
            }])
            .select()
            .maybeSingle();

          if (insertError) throw insertError;

          setUserNome(newProfile.full_name);
          setUserRole(newProfile.role);
        } else {
          setUserNome(data.full_name);
          setUserRole(data.role);
        }
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        setUserNome(currentUser.email);
        setUserRole("user");
      }
    }

    fetchUserProfile();
  }, [currentUser]);

  // Fetch tarefas e projetos
  useEffect(() => {
    if (!currentUser) return;

    async function fetchData() {
      setLoading(true);
      try {
        const { data: tasksData } = await supabase.from("tasks").select("*");
        const { data: projectsData } = await supabase.from("projects").select("*");

        setTasks(tasksData || []);
        setProjects(projectsData || []);
      } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUser]);

  // Auth
  async function handleLogin(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  }

  async function handleSignup(email, password) {
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return alert(error.message);

    await supabase.from("profiles").upsert([{
      id: authData.user.id,
      full_name: email.split("@")[0],
      role: "user",
    }]);

    alert("Conta criada! Verifica o email.");
  }

  function handleLogout() {
    supabase.auth.signOut();
  }

  // Tasks
  async function handleAddTask(newTask) {
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ ...newTask, user_id: currentUser.id }])
      .select()
      .maybeSingle();

    if (error) return alert(error.message);
    setTasks(prev => [...prev, data]);
  }

  async function handleToggleStatus(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus =
      task.status === "concluida" ? "pendente" : "concluida";

    await supabase.from("tasks").update({ status: newStatus }).eq("id", id);

    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
    );
  }

  async function handleDelete(id) {
    if (!confirm("Tens a certeza que queres apagar esta tarefa?")) return;

    await supabase.from("tasks").delete().eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  // Projetos
  async function handleAddProject(newProject) {
    const { data } = await supabase
      .from("projects")
      .insert([newProject])
      .select()
      .maybeSingle();

    setProjects(prev => [...prev, data]);
  }

  // Utilizadores (ADMIN)
  async function handleAddUser(newUser) {
    if (!newUser.email || !newUser.name) {
      alert("Nome e email são obrigatórios.");
      return;
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: newUser.email,
      password: "SenhaTemp123!",
    });

    if (error) return alert(error.message);

    const { data: profileData } = await supabase
      .from("profiles")
      .insert([{
        id: signUpData.user.id,
        full_name: newUser.name,
        role: newUser.role || "user",
      }])
      .select()
      .maybeSingle();

    setUserList(prev => [...prev, profileData]);
    alert(`Usuário ${newUser.name} criado com senha temporária!`);
  }

  function handleUpdateUser(id, updates) {
    setUserList(prev =>
      prev.map(u => (u.id === id ? { ...u, ...updates } : u))
    );
  }

  // Estatísticas
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const tasksPending = tasks.filter(t => t.status === "pendente").length;
  const tasksInProgress = tasks.filter(t => t.status === "em_progresso").length;
  const tasksDone = tasks.filter(t => t.status === "concluida").length;

  const today = new Date().toISOString().slice(0, 10);
  const lateTasks = tasks.filter(
    t => t.dueDate && t.dueDate < today && t.status !== "concluida"
  ).length;

  const filteredTasks =
    filterStatus === "todas"
      ? tasks
      : tasks.filter(t => t.status === filterStatus);

  if (authLoading) return <div className="app-container">A verificar sessão...</div>;
  if (!currentUser) return <LoginScreen onLogin={handleLogin} onSignup={handleSignup} />;

  const isAdmin = userRole === "admin";

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>

      {/* Botão Dark Mode */}
      <div style={{ position: "fixed", top: 10, right: 10, zIndex: 1000 }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="btn-secondary"
        >
          {darkMode ? "☀️ Claro" : "🌙 Dark"}
        </button>
      </div>

      <header className="app-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.9rem" }}>{userNome}</div>

          <div className="logo-area" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <svg className="logo w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="45" stroke="#00D5A5" strokeWidth="6" />
              <path d="M30 60 C40 30, 60 30, 70 60" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />
              <circle cx="40" cy="50" r="5" fill="#00D5A5" />
              <circle cx="60" cy="50" r="5" fill="#00D5A5" />
            </svg>

            <h1 className="gradient-title">
              Lynxmind · Portal de Gestão de Tarefas & Projetos
            </h1>
          </div>

          <button className="btn-secondary" onClick={handleLogout}>
            Terminar sessão
          </button>
        </div>

        <p style={{ marginTop: "0.5rem", textAlign: "center" }}>
          Organiza projetos, tarefas, equipas e prazos como um verdadeiro Lynx 🐾
        </p>
      </header>

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

        {isAdmin && (
          <section className="card">
            <h2>Gestão de Utilizadores</h2>
            <UsersPanel
              currentUser={currentUser}
              users={userList}
              onUpdateUser={handleUpdateUser}
              onAddUser={handleAddUser}
              canManageUsers={true}
            />
          </section>
        )}

        <section className="card">
          <h2>Projetos</h2>
          <ProjectsPanel
            projects={projects}
            onAddProject={handleAddProject}
            canManageProjects={isAdmin}
          />
        </section>

        <section className="card">
          <h2>Criar nova tarefa</h2>
          <TaskForm onAddTask={handleAddTask} projects={projects} />
        </section>

        <section className="card">
          <h2>Minhas tarefas</h2>
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
                  canDelete={isAdmin}
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
