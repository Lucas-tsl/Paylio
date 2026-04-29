const path = require("path");
const express = require("express");
const { Pool } = require("pg");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const app = express();
const port = Number(process.env.APP_PORT || 3000);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Database unreachable" });
  }
});

app.get("/api/clients", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nom, prenom, email, telephone, created_at
       FROM clients
       ORDER BY id`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch clients" });
  }
});

app.get("/api/comptes", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.client_id, cl.nom, cl.prenom, c.type_compte, c.solde, c.devise, c.created_at
       FROM comptes c
       JOIN clients cl ON cl.id = c.client_id
       ORDER BY c.id`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch accounts" });
  }
});

app.post("/api/search", async (req, res) => {
  const { kind, term } = req.body || {};

  if (!kind || !term) {
    return res.status(400).json({ error: "kind and term are required" });
  }

  try {
    if (kind === "client") {
      const result = await pool.query(
        `SELECT id, nom, prenom, email, telephone, created_at
         FROM clients
         WHERE nom ILIKE $1 OR prenom ILIKE $1 OR email ILIKE $1
         ORDER BY id`,
        [`%${term}%`]
      );
      return res.json(result.rows);
    }

    if (kind === "compte") {
      const result = await pool.query(
        `SELECT c.id, c.client_id, cl.nom, cl.prenom, c.type_compte, c.solde, c.devise, c.created_at
         FROM comptes c
         JOIN clients cl ON cl.id = c.client_id
         WHERE c.type_compte ILIKE $1 OR c.id::text = $2
         ORDER BY c.id`,
        [`%${term}%`, term]
      );
      return res.json(result.rows);
    }

    return res.status(400).json({ error: "kind must be client or compte" });
  } catch (error) {
    return res.status(500).json({ error: "Search failed" });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
