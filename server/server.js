// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const db = require("./db");
const taskRoutes = require("./routes/tasks");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/* ========== ROTA BASE ========== */
app.get("/", (req, res) => {
  res.send("API Gestor de Tarefas a funcionar");
});

/* ========== ROTAS DE TAREFAS ========== */
app.use("/tasks", taskRoutes);

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

// POST criar projeto
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

// DELETE projeto
app.delete("/projects/:id", (req, res) => {
  db.run("DELETE FROM projects WHERE id = ?", [req.params.id], function (err) {
    if (err) {
      console.error("Erro ao apagar projeto:", err);
      return res.status(500).json({ error: "Erro ao apagar projeto" });
    }
    res.json({ success: true });
  });
});

/* ========== START SERVIDOR ========== */
app.listen(PORT, () => {
  console.log(`Servidor a rodar em http://localhost:${PORT}`);
});
