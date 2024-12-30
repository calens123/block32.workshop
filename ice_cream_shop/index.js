const express = require("express");
const { Client } = require("pg");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());
app.use(morgan("dev"));

// GET /api/flavors - Returns all flavors
app.get("/api/flavors", async (req, res, next) => {
  try {
    const result = await client.query("SELECT * FROM flavors;");
    res.send(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/flavors/:id - Returns a single flavor
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await client.query("SELECT * FROM flavors WHERE id = $1;", [
      id,
    ]);
    res.send(result.rows[0] || { error: "Flavor not found" });
  } catch (err) {
    next(err);
  }
});

// POST /api/flavors - Creates a new flavor
app.post("/api/flavors", async (req, res, next) => {
  try {
    const { name, is_favorite } = req.body;
    const result = await client.query(
      "INSERT INTO flavors (name, is_favorite) VALUES ($1, $2) RETURNING *;",
      [name, is_favorite || false]
    );
    res.status(201).send(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/flavors/:id - Deletes a flavor
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await client.query("DELETE FROM flavors WHERE id = $1;", [id]);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// PUT /api/flavors/:id - Updates a flavor
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, is_favorite } = req.body;
    const result = await client.query(
      "UPDATE flavors SET name = $1, is_favorite = $2, updated_at = now() WHERE id = $3 RETURNING *;",
      [name, is_favorite, id]
    );
    res.send(result.rows[0] || { error: "Flavor not found" });
  } catch (err) {
    next(err);
  }
});

const init = async () => {
  await client.connect();
  console.log("Connected to database");

  const SQL = `
      DROP TABLE IF EXISTS flavors;
      CREATE TABLE flavors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        is_favorite BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
  
      INSERT INTO flavors (name, is_favorite) VALUES ('Vanilla', true);
      INSERT INTO flavors (name, is_favorite) VALUES ('Chocolate', false);
      INSERT INTO flavors (name, is_favorite) VALUES ('Strawberry', false);
      INSERT INTO flavors (name, is_favorite) VALUES ('Mint Chip', true);
    `;
  await client.query(SQL);
  console.log("Database initialized and seeded");

  app.listen(PORT, () =>
    console.log(`Server is running on http://localhost:${PORT}`)
  );
};

init();
