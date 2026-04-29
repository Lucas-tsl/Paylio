const path = require('path');
const express = require('express');
const { Pool } = require('pg');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const port = Number(process.env.APP_PORT || 3000);

console.log('Config:');
console.log(`  DB_HOST: ${process.env.DB_HOST}`);
console.log(`  DB_PORT: ${process.env.DB_PORT}`);
console.log(`  DB_NAME: ${process.env.DB_NAME}`);
console.log(`  APP_PORT: ${port}`);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'bank_lab',
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || '',
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/clients', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nom, prenom, email, telephone, created_at FROM clients ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Clients query failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/comptes', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.client_id, cl.nom, cl.prenom, c.type_compte, c.solde, c.devise, c.created_at
       FROM comptes c
       JOIN clients cl ON cl.id = c.client_id
       ORDER BY c.id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Comptes query failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/search', async (req, res) => {
  const { kind, term } = req.body || {};

  if (!kind || !term) {
    return res.status(400).json({ error: 'kind and term are required' });
  }

  try {
    if (kind === 'client') {
      const result = await pool.query(
        `SELECT id, nom, prenom, email, telephone, created_at
         FROM clients
         WHERE nom ILIKE $1 OR prenom ILIKE $1 OR email ILIKE $1
         ORDER BY id`,
        [`%${term}%`]
      );
      return res.json(result.rows);
    }

    if (kind === 'compte') {
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

    return res.status(400).json({ error: 'kind must be client or compte' });
  } catch (error) {
    console.error('Search failed:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});
