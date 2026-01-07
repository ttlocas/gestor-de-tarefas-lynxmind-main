// server/server.js
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/* ========== ROTAS DE PROJETOS ========== */

// GET todos os projetos
app.get("/projects", (req, res) => {
  db.all("SELECT * FROM projects", [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar projetos:", err);
      return res.status(500).json({ error: "Erro ao buscar projetos" });
    }
    res.json(rows);
  });
});

// POST criar novo projeto
app.post("/projects", (req, res) => {
  const { name, description, status = "ativo", startDate, endDate } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Nome do projeto é obrigatório" });
  }

  const sql = `
    INSERT INTO projects (name, description, status, start_date, end_date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [name, description || "", status, startDate || null, endDate || null],
    function (err) {
      if (err) {
        console.error("Erro ao criar projeto:", err);
        return res.status(500).json({ error: "Erro ao criar projeto" });
      }

      res.status(201).json({
        id: this.lastID,
        name,
        description: description || "",
        status,
        startDate: startDate || null,
        endDate: endDate || null,
      });
    }
  );
});

// PUT atualizar projeto
app.put("/projects/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, status, startDate, endDate } = req.body;

  const sql = `
    UPDATE projects
    SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      status = COALESCE(?, status),
      start_date = COALESCE(?, start_date),
      end_date = COALESCE(?, end_date)
    WHERE id = ?
  `;

  db.run(
    sql,
    [name, description, status, startDate, endDate, id],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar projeto:", err);
        return res.status(500).json({ error: "Erro ao atualizar projeto" });
      }
      res.json({ success: true });
    }
  );
});

// DELETE projeto (tarefas ficam com project_id = NULL)
app.delete("/projects/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM projects WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) {
      console.error("Erro ao apagar projeto:", err);
      return res.status(500).json({ error: "Erro ao apagar projeto" });
    }
    res.json({ success: true });
  });
});

/* ========== ROTAS DE TAREFAS ========== */

// GET todas as tarefas (pode filtrar por projeto)
app.get("/tasks", (req, res) => {
  const { projectId } = req.query;

  let sql = `
    SELECT
      t.*,
      p.name AS project_name
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
  `;
  const params = [];

  if (projectId) {
    sql += " WHERE t.project_id = ?";
    params.push(projectId);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("Erro ao buscar tarefas:", err);
      return res.status(500).json({ error: "Erro ao buscar tarefas" });
    }

    const tasks = rows.map((row) => ({
      id: row.id,
      title: row.title,
      desc: row.description,
      status: row.status,
      priority: row.priority,
      dueDate: row.due_date,
      projectId: row.project_id,
      projectName: row.project_name || null,
    }));

    res.json(tasks);
  });
});

// POST criar nova tarefa
app.post("/tasks", (req, res) => {
  const { title, desc, status, priority, dueDate, projectId } = req.body;

  if (!title || !status || !priority) {
    return res.status(400).json({ error: "Campos obrigatórios em falta" });
  }

  const sql = `
    INSERT INTO tasks (title, description, status, priority, due_date, project_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [title, desc || "", status, priority, dueDate || null, projectId || null],
    function (err) {
      if (err) {
        console.error("Erro ao criar tarefa:", err);
        return res.status(500).json({ error: "Erro ao criar tarefa" });
      }

      res.status(201).json({
        id: this.lastID,
        title,
        desc: desc || "",
        status,
        priority,
        dueDate: dueDate || null,
        projectId: projectId || null,
      });
    }
  );
});

// PUT atualizar status
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status é obrigatório" });
  }

  const sql = `UPDATE tasks SET status = ? WHERE id = ?`;
  db.run(sql, [status, id], function (err) {
    if (err) {
      console.error("Erro ao atualizar tarefa:", err);
      return res.status(500).json({ error: "Erro ao atualizar tarefa" });
    }
    res.json({ success: true });
  });
});

// DELETE apagar tarefa
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM tasks WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) {
      console.error("Erro ao apagar tarefa:", err);
      return res.status(500).json({ error: "Erro ao apagar tarefa" });
    }
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor a rodar em http://localhost:${PORT}`);
});
