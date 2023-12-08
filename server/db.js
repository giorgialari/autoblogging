const express = require("express");
const cors = require("cors");
const env = require("dotenv").config();
const sql = require("mssql");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Configurazione per la connessione a SQL Server
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: "autoblogging",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};
// Connessione al database SQL Server
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on("error", (err) => {
  console.error("Errore di connessione al database:", err);
});
app.get("/models", async (req, res) => {
  try {
    await poolConnect;
    const request = new sql.Request(pool);
    const results = await request.query("SELECT * FROM model");
    res.json(results.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/languages", async (req, res) => {
  try {
    await poolConnect;
    const request = new sql.Request(pool);
    const results = await request.query("SELECT * FROM languages");
    res.json(results.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/styles", async (req, res) => {
  try {
    await poolConnect;
    const request = new sql.Request(pool);
    const results = await request.query("SELECT * FROM style");
    res.json(results.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/tones", async (req, res) => {
  try {
    await poolConnect;
    const request = new sql.Request(pool);
    const results = await request.query("SELECT * FROM tones");
    res.json(results.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// CRUD SHORTCODES
app.get("/shortcodes", async (req, res) => {
  try {
    await poolConnect;
    const request = new sql.Request(pool);
    const results = await request.query("SELECT * FROM shortcodes ");
    res.json(results.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/shortcodes", async (req, res) => {
  try {
    const { code, position, section } = req.body;
    await poolConnect; // Assicurati che la pool sia connessa
    const request = new sql.Request(pool);
    await request
      .input("code", sql.NVarChar, code)
      .input("position", sql.NVarChar, position)
      .input("section", sql.NVarChar, section)
      .query(
        "INSERT INTO shortcodes (code, position, section) VALUES (@code, @position, @section)"
      );
    res.json({ message: "Shortcode aggiunto con successo!" });
  } catch (error) {
    console.error("Errore durante l'inserimento: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/shortcodes", async (req, res) => {
  try {
    const shortcodes = req.body;
    await poolConnect; // Assicurati che la pool sia connessa

    for (const shortcode of shortcodes) {
      const request = new sql.Request(pool);
      await request
        .input("code", sql.NVarChar, shortcode.code)
        .input("position", sql.NVarChar, shortcode.position)
        .input("section", sql.NVarChar, shortcode.section)
        .input("id", sql.Int, shortcode.id)
        .query(
          "UPDATE shortcodes SET code = @code, position = @position, section = @section WHERE id = @id"
        );
    }

    res.json({ message: "Shortcodes aggiornati con successo!" });
  } catch (error) {
    console.error("Errore durante l'aggiornamento: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/shortcodes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await poolConnect; // Assicurati che la pool sia connessa
    const request = new sql.Request(pool);
    await request
      .input("id", sql.Int, id)
      .query("DELETE FROM shortcodes WHERE id = @id");
    res.json({ message: "Shortcode rimosso con successo!" });
  } catch (error) {
    console.error("Errore durante la cancellazione: ", error);
    res.status(500).json({ error: error.message });
  }
});

// CRUD PROMPT SECTION - SINGLE PRODUCT AMAZON
app.get("/prompt_section_product", async (req, res) => {
  try {
    await poolConnect; // Assicurati che la pool sia connessa
    const request = new sql.Request(pool);
    const results = await request.query("SELECT * FROM prompt_section_product");
    res.json(results.recordset);
  } catch (error) {
    console.error("Errore durante la lettura: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/prompt_section_product", async (req, res) => {
  try {
    const { model, max_tokens, language, style, tone, default_prompt, name } =
      req.body;
    await poolConnect; // Assicurati che la pool sia connessa
    const request = new sql.Request(pool);
    await request
      .input("model", sql.NVarChar, model)
      .input("max_tokens", sql.Int, max_tokens)
      .input("language", sql.NVarChar, language)
      .input("style", sql.NVarChar, style)
      .input("tone", sql.NVarChar, tone)
      .input("default_prompt", sql.NVarChar, default_prompt)
      .input("name", sql.NVarChar, name).query(`
                    UPDATE prompt_section_product
                    SET model = @model, max_tokens = @max_tokens, language = @language,
                        style = @style, tone = @tone, default_prompt = @default_prompt
                    WHERE name = @name
                  `);
    res.json({ message: "Dati aggiornati con successo!" });
  } catch (error) {
    console.error("Errore durante l'aggiornamento: ", error);
    res.status(500).json({ error: error.message });
  }
});

// CRUD PROMPT SECTION - SINGLE BLOG POST
app.get("/prompt_section_blog_post", async (req, res) => {
  try {
    await poolConnect; // Assicurati che la pool sia connessa
    const request = new sql.Request(pool);
    const results = await request.query(
      "SELECT * FROM prompt_section_blog_post"
    );
    res.json(results.recordset);
  } catch (error) {
    console.error("Errore durante la lettura: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/prompt_section_blog_post", async (req, res) => {
  try {
    const { model, max_tokens, language, style, tone, default_prompt, name } =
      req.body;
    await poolConnect; // Assicurati che la pool sia connessa
    const request = new sql.Request(pool);
    await request
      .input("model", sql.NVarChar, model)
      .input("max_tokens", sql.Int, max_tokens)
      .input("language", sql.NVarChar, language)
      .input("style", sql.NVarChar, style)
      .input("tone", sql.NVarChar, tone)
      .input("default_prompt", sql.NVarChar, default_prompt)
      .input("name", sql.NVarChar, name).query(`
                    UPDATE prompt_section_blog_post
                    SET model = @model, max_tokens = @max_tokens, language = @language,
                        style = @style, tone = @tone, default_prompt = @default_prompt
                    WHERE name = @name
                  `);
    res.json({ message: "Dati aggiornati con successo!" });
  } catch (error) {
    console.error("Errore durante l'aggiornamento: ", error);
    res.status(500).json({ error: error.message });
  }
});

// CRUD PROMPT SECTION - BULK PRODUCT AMAZON
app.get("/prompt_section_bulk_product", async (req, res) => {
  try {
    await poolConnect; // Assicurati che la pool sia connessa
    const request = new sql.Request(pool);
    const results = await request.query(
      "SELECT * FROM prompt_section_bulk_product"
    );
    res.json(results.recordset);
  } catch (error) {
    console.error("Errore durante la lettura: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/prompt_section_bulk_product", async (req, res) => {
  try {
    const prompt_section_bulk_product = req.body;
    await poolConnect; // Assicurati che la pool sia connessa

    for (const prompt of prompt_section_bulk_product) {
      const request = new sql.Request(pool);
      await request
        .input("model", sql.NVarChar, prompt.model)
        .input("max_tokens", sql.Int, prompt.max_tokens)
        .input("default_prompt", sql.NVarChar, prompt.default_prompt)
        .input("qtyParagraph", sql.Int, prompt.qtyParagraph)
        .input("language", sql.NVarChar, prompt.language)
        .input("style", sql.NVarChar, prompt.style)
        .input("tone", sql.NVarChar, prompt.tone)
        .input("name", sql.NVarChar, prompt.name).query(`
                    UPDATE prompt_section_bulk_product
                    SET model = @model, max_tokens = @max_tokens,
                        default_prompt = @default_prompt, qtyParagraph = @qtyParagraph,
                        language = @language, style = @style, tone = @tone
                    WHERE name = @name
                  `);
    }

    res.json({ message: "Dati aggiornati con successo!" });
  } catch (error) {
    console.error("Errore durante l'aggiornamento: ", error);
    res.status(500).json({ error: error.message });
  }
});

// CRUD PROMPT SECTION - BULK BLOG POST
app.get("/prompt_section_bulk_blog_post", async (req, res) => {
  try {
    await poolConnect; // Assicurati che la pool sia connessa
    const request = new sql.Request(pool);
    const results = await request.query(
      "SELECT * FROM prompt_section_bulk_blog_post"
    );
    res.json(results.recordset);
  } catch (error) {
    console.error("Errore durante la lettura: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/prompt_section_bulk_blog_post", async (req, res) => {
  try {
    const { model, max_tokens, language, style, tone, default_prompt, name } =
      req.body;
    await poolConnect; // Assicurati che la pool sia connessa
    const request = new sql.Request(pool);
    await request
      .input("model", sql.NVarChar, model)
      .input("max_tokens", sql.Int, max_tokens)
      .input("language", sql.NVarChar, language)
      .input("style", sql.NVarChar, style)
      .input("tone", sql.NVarChar, tone)
      .input("default_prompt", sql.NVarChar, default_prompt)
      .input("name", sql.NVarChar, name).query(`
                    UPDATE prompt_section_bulk_blog_post
                    SET model = @model, max_tokens = @max_tokens, language = @language,
                        style = @style, tone = @tone, default_prompt = @default_prompt
                    WHERE name = @name
                  `);
    res.json({ message: "Dati aggiornati con successo!" });
  } catch (error) {
    console.error("Errore durante l'aggiornamento: ", error);
    res.status(500).json({ error: error.message });
  }
});

// CRUD PROMPT SECTION - BULK PILLAR PAGE
app.get("/prompt_bulk_pillar_section", async (req, res) => {
  try {
    await poolConnect; // Assicurati che la pool sia connessa
    const request = new sql.Request(pool);
    const results = await request.query(
      "SELECT * FROM prompt_bulk_pillar_section"
    );
    res.json(results.recordset);
  } catch (error) {
    console.error("Errore durante la lettura: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/prompt_bulk_pillar_section", async (req, res) => {
  try {
    const prompt_bulk_pillar_section = req.body;
    await poolConnect; // Assicurati che la pool sia connessa

    for (const prompt of prompt_bulk_pillar_section) {
      const request = new sql.Request(pool);
      await request
        .input("model", sql.NVarChar, prompt.model)
        .input("max_tokens", sql.Int, prompt.max_tokens)
        .input("default_prompt", sql.NVarChar, prompt.default_prompt)
        .input("qtyParagraph", sql.Int, prompt.qtyParagraph)
        .input("language", sql.NVarChar, prompt.language)
        .input("style", sql.NVarChar, prompt.style)
        .input("tone", sql.NVarChar, prompt.tone)
        .input("name", sql.NVarChar, prompt.name).query(`
                    UPDATE prompt_bulk_pillar_section
                    SET model = @model, max_tokens = @max_tokens,
                        default_prompt = @default_prompt, qtyParagraph = @qtyParagraph,
                        language = @language, style = @style, tone = @tone
                    WHERE name = @name
                  `);
    }

    res.json({ message: "Dati aggiornati con successo!" });
  } catch (error) {
    console.error("Errore durante l'aggiornamento: ", error);
    res.status(500).json({ error: error.message });
  }
});

// CRUD PROMPT SECTION - PILLAR PAGE
app.get("/prompt_pillar_section", async (req, res) => {
  try {
    await poolConnect; // Assicurati che la pool sia connessa
    const request = new sql.Request(pool);
    const results = await request.query("SELECT * FROM prompt_pillar_section");
    res.json(results.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/prompt_pillar_section", async (req, res) => {
  try {
    const prompt_pillar_section = req.body;
    await poolConnect; // Assicurati che la pool sia connessa

    for (const prompt of prompt_pillar_section) {
      const request = new sql.Request(pool);
      await request
        .input("model", sql.NVarChar, prompt.model)
        .input("max_tokens", sql.Int, prompt.max_tokens)
        .input("default_prompt", sql.NVarChar, prompt.default_prompt)
        .input("qtyParagraph", sql.Int, prompt.qtyParagraph)
        .input("language", sql.NVarChar, prompt.language)
        .input("style", sql.NVarChar, prompt.style)
        .input("tone", sql.NVarChar, prompt.tone)
        .input("name", sql.NVarChar, prompt.name).query(`
                    UPDATE prompt_pillar_section
                    SET model = @model, max_tokens = @max_tokens,
                        default_prompt = @default_prompt, qtyParagraph = @qtyParagraph,
                        language = @language, style = @style, tone = @tone
                    WHERE name = @name
                  `);
    }
    res.json({ message: "Dati aggiornati con successo!" });
  } catch (error) {
    console.error("Errore durante l'aggiornamento: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
