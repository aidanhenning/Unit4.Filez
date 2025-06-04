import express from "express";
import db from "#db/client";

const app = express();
app.use(express.json());

app.get("/files", async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT files.*, folders.name AS folder_name
      FROM files
      JOIN folders ON files.folder_id = folders.id
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.get("/folders", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM folders");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.get("/folders/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `
      SELECT folders.*,
        COALESCE(json_agg(files.*) FILTER (WHERE files.id IS NOT NULL), '[]') AS files
      FROM folders
      LEFT JOIN files ON folders.id = files.folder_id
      WHERE folders.id = $1
      GROUP BY folders.id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Folder not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

app.post("/folders/:id/files", async (req, res, next) => {
  const { id } = req.params;

  // Defensive check for body presence
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body required" });
  }

  const { name, size } = req.body;

  // Check required fields
  if (name == null || size == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check folder existence
    const folder = await db.query("SELECT * FROM folders WHERE id = $1", [id]);
    if (folder.rowCount === 0) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const result = await db.query(
      `INSERT INTO files (name, size, folder_id) VALUES ($1, $2, $3) RETURNING *`,
      [name, size, id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ error: "File name already exists in this folder" });
    }
    next(err);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
