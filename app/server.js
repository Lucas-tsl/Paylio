const path = require('path');
const express = require('express');
const { Pool } = require('pg');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const port = Number(process.env.APP_PORT || 3000);

// Configuration du pool PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'bank_lab',
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'app_user_pw',
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes de lecture normales ---
app.get('/api/clients', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nom, prenom, email, telephone, created_at FROM clients ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/comptes', async (req, res) => {
  try {
    const result = await pool.query(`SELECT c.id, c.client_id, cl.nom, cl.prenom, c.type_compte, c.solde, c.devise FROM comptes c JOIN clients cl ON cl.id = c.client_id ORDER BY c.id`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ROUTE VULNÉRABLE (Concaténation brute) ---
app.post('/api/search', async (req, res) => {
  const { kind, term } = req.body || {};
  if (!kind || !term) return res.status(400).json({ error: 'Données manquantes' });

  try {
    let query = "";
    if (kind === 'client') {
      query = "SELECT id, nom, prenom, email FROM clients WHERE nom ILIKE '%" + term + "%' OR prenom ILIKE '%" + term + "%';";
    } else {
      query = "SELECT id, type_compte, solde FROM comptes WHERE type_compte ILIKE '%" + term + "%';";
    }
    
    console.log("SQL exécuté :", query);
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CONSOLE SQL BRUTE ---
app.post('/api/execute', async (req, res) => {
  const { query } = req.body || {};
  try {
    const result = await pool.query(query);
    res.json(result.rows || { message: "Commande réussie", affected: result.rowCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});