// server.js
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// Cliente Supabase com service_role key (NUNCA colocar no frontend!)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post("/create-user", async (req, res) => {
  const { email, full_name, role } = req.body;

  if (!email || !full_name || !role) {
    return res.status(400).json({ error: "Campos obrigatórios em falta." });
  }

  try {
    // Criar usuário no Auth
    const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: "SenhaTemp123!", // senha temporária
      email_confirm: true
    });

    if (authError) throw authError;

    // Criar perfil na tabela profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([{ id: user.id, full_name, role }]);

    if (profileError) throw profileError;

    res.json({ user: { id: user.id, email, full_name, role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Backend rodando na porta 3000"));
