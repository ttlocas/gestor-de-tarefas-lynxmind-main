// server/migrate.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "database.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("PRAGMA foreign_keys = OFF");

  db.run("ALTER TABLE tasks ADD COLUMN project_id INTEGER", (err) => {
    if (err) {
      console.error("Erro ao adicionar coluna project_id:", err.message);
    } else {
      console.log("Coluna project_id adicionada com sucesso!");
    }

    db.run("PRAGMA foreign_keys = ON");
    db.close();
  });
});
