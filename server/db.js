const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());

const PORT = 3000;
// Crea una connessione al database
const pool = mysql.createPool({
  host: "sql8.freesqldatabase.com",
  user: "sql8646183",
  password: "a6m5A5dCSn",
  database: "sql8646183",
});
app.use(express.json());

app.get("/models", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query("SELECT * FROM model");
    connection.release();

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/languages", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query("SELECT * FROM languages");
    connection.release();

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/styles", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query("SELECT * FROM style");
    connection.release();

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/tones", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query("SELECT * FROM tones");
    connection.release();

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// CRUD SHORTCODES
app.get("/shortcodes", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query("SELECT * FROM shortcodes ");
    connection.release();

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/shortcodes", async (req, res) => {
  try {
    const { code, position, section } = req.body;

    const connection = await pool.getConnection();
    const query =
      "INSERT INTO shortcodes (code, position, section) VALUES (?, ?, ?)";
    await connection.query(query, [code, position, section]);
    connection.release();

    res.json({ message: "Shortcode aggiunto con successo!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/shortcodes", async (req, res) => {
  try {
    const shortcodes = req.body;

    const connection = await pool.getConnection();

    for (const shortcode of shortcodes) {
      const query =
        "UPDATE shortcodes SET code = ?, position = ?, section = ? WHERE id = ?";
      await connection.query(query, [
        shortcode.code,
        shortcode.position,
        shortcode.section,
        shortcode.id,
      ]);
    }

    connection.release();

    res.json({ message: "Shortcodes aggiornati con successo!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/shortcodes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    const query = "DELETE FROM shortcodes WHERE id = ?";
    await connection.query(query, [id]);
    connection.release();

    res.json({ message: "Shortcode rimosso con successo!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD PROMPT SECTION - SINGLE PRODUCT AMAZON
app.get("/prompt_section_product", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM prompt_section_product"
    );
    connection.release();

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/prompt_section_product", async (req, res) => {
  try {
    const { model, max_tokens, language, style, tone, default_prompt, name } =
      req.body;

    const connection = await pool.getConnection();
    const query = `
      UPDATE prompt_section_product
      SET model = ?, max_tokens = ?, language = ?, style = ?, tone = ?,
      default_prompt = ?
      WHERE name = ?
    `;
    await connection.query(query, [
      model,
      max_tokens,
      language,
      style,
      tone,
      default_prompt,
      name,
    ]);
    connection.release();

    res.json({ message: "Dati aggiornati con successo!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD PROMPT SECTION - SINGLE BLOG POST
app.get("/prompt_section_blog_post", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM prompt_section_blog_post"
    );
    connection.release();

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/prompt_section_blog_post", async (req, res) => {
  try {
    const { model, max_tokens, language, style, tone, default_prompt, name } =
      req.body;

    const connection = await pool.getConnection();
    const query = `
      UPDATE prompt_section_blog_post
      SET model = ?, max_tokens = ?, language = ?, style = ?, tone = ?,
      default_prompt = ?
      WHERE name = ?
    `;
    await connection.query(query, [
      model,
      max_tokens,
      language,
      style,
      tone,
      default_prompt,
      name,
    ]);
    connection.release();

    res.json({ message: "Dati aggiornati con successo!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// CRUD PROMPT SECTION - BULK PRODUCT AMAZON
app.get("/prompt_section_bulk_product", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM prompt_section_bulk_product"
    );
    connection.release();

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/prompt_section_bulk_product", async (req, res) => {
  try {
    const prompt_section_bulk_product = req.body;

    const connection = await pool.getConnection();

    for (const prompt of prompt_section_bulk_product) {
      const query = `
      UPDATE prompt_section_bulk_product
      SET model = ?, max_tokens = ?,
      default_prompt = ?, qtyParagraph = ?,
      language = ?, style = ?, tone = ?
      WHERE name = ?
    `;
      await connection.query(query, [
        prompt.model,
        prompt.max_tokens,
        prompt.default_prompt,
        prompt.qtyParagraph,
        prompt.language,
        prompt.style,
        prompt.tone,
        prompt.name,
      ]);
    }

    connection.release();

    res.json({ message: "Dati aggiornati con successo!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD PROMPT SECTION - BULK BLOG POST
app.get("/prompt_section_bulk_blog_post", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM prompt_section_bulk_blog_post"
    );
    connection.release();

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/prompt_section_bulk_blog_post", async (req, res) => {
  try {
    const { model, max_tokens, language, style, tone, default_prompt, name } =
      req.body;

    const connection = await pool.getConnection();
    const query = `
      UPDATE prompt_section_bulk_blog_post
      SET model = ?, max_tokens = ?, language = ?, style = ?, tone = ?,
      default_prompt = ?
      WHERE name = ?
    `;
    await connection.query(query, [
      model,
      max_tokens,
      language,
      style,
      tone,
      default_prompt,
      name,
    ]);
    connection.release();

    res.json({ message: "Dati aggiornati con successo!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// CRUD PROMPT SECTION - BULK PILLAR PAGE
app.get("/prompt_bulk_pillar_section", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM prompt_bulk_pillar_section"
    );
    connection.release();

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/prompt_bulk_pillar_section", async (req, res) => {
  try {
    const prompt_bulk_pillar_section = req.body;

    const connection = await pool.getConnection();

    for (const prompt of prompt_bulk_pillar_section) {
      const query = `
      UPDATE prompt_bulk_pillar_section
      SET model = ?, max_tokens = ?,
      default_prompt = ?, qtyParagraph = ?,
      language = ?, style = ?, tone = ?
      WHERE name = ?
    `;
      await connection.query(query, [
        prompt.model,
        prompt.max_tokens,
        prompt.default_prompt,
        prompt.qtyParagraph,
        prompt.language,
        prompt.style,
        prompt.tone,
        prompt.name,
      ]);
    }

    connection.release();

    res.json({ message: "Dati aggiornati con successo!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD PROMPT SECTION - PILLAR PAGE
app.get("/prompt_pillar_section", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM prompt_pillar_section"
    );
    connection.release();

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/prompt_pillar_section", async (req, res) => {
  try {
    const prompt_pillar_section = req.body;

    const connection = await pool.getConnection();

    for (const prompt of prompt_pillar_section) {
      const query = `
      UPDATE prompt_pillar_section
      SET model = ?, max_tokens = ?,
      default_prompt = ?, qtyParagraph = ?,
      language = ?, style = ?, tone = ?
      WHERE name = ?
    `;
      await connection.query(query, [
        prompt.model,
        prompt.max_tokens,
        prompt.default_prompt,
        prompt.qtyParagraph,
        prompt.language,
        prompt.style,
        prompt.tone,
        prompt.name,
      ]);
    }

    connection.release();

    res.json({ message: "Dati aggiornati con successo!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
