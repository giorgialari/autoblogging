const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

// Crea una connessione al database
const pool = mysql.createPool({
    host: 'sql8.freesqldatabase.com',
    user: 'sql8646183',
    password: 'a6m5A5dCSn',
    database: 'sql8646183'
});

app.get('/models', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM model');
        connection.release();

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Errore nel recuperare i dati' });
    }
});

app.get('/languages', async (req, res) => {
  try {
      const connection = await pool.getConnection();
      const [results] = await connection.query('SELECT * FROM languages');
      connection.release();

      res.json(results);
  } catch (error) {
      res.status(500).json({ error: 'Errore nel recuperare i dati' });
  }
});

app.get('/styles', async (req, res) => {
  try {
      const connection = await pool.getConnection();
      const [results] = await connection.query('SELECT * FROM style');
      connection.release();

      res.json(results);
  } catch (error) {
      res.status(500).json({ error: 'Errore nel recuperare i dati' });
  }
});

app.get('/tones', async (req, res) => {
  try {
      const connection = await pool.getConnection();
      const [results] = await connection.query('SELECT * FROM tones');
      connection.release();

      res.json(results);
  } catch (error) {
      res.status(500).json({ error: 'Errore nel recuperare i dati' });
  }
});

app.get('/prompt_section_product', async (req, res) => {
  try {
      const connection = await pool.getConnection();
      const [results] = await connection.query('SELECT * FROM prompt_section_product');
      connection.release();

      res.json(results);
  } catch (error) {
      res.status(500).json({ error: 'Errore nel recuperare i dati' });
  }
});

app.listen(PORT, () => {
    console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
