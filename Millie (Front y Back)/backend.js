import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fmdvxhacabhvvtaivqsq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZHZ4aGFjYWJodnZ0YWl2cXNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MTg5NjgsImV4cCI6MjA3NzM5NDk2OH0.gr8M-7W8Dv2L-gObzxuI6VqbbWbWaPb2uWom6Fdo95E'
export const supabase = createClient(supabaseUrl, supabaseKey)

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); 


const pool = new Pool({
  host: 'ep-steep-boat-acdiqbkj-pooler.sa-east-1.aws.neon.tech',
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_D7bZj4AxWpOv',
  port: 5432,
  ssl: { rejectUnauthorized: false },
});


pool.query(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
  )
`).then(() => console.log(" Tabla 'usuarios' lista"))
  .catch(err => console.error(" Error creando tabla:", err));

  pool.query(`
  CREATE TABLE IF NOT EXISTS analisis (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    imagen_url TEXT NOT NULL,
    resultado TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT NOW()
  )
`).then(() => console.log(" Tabla 'analisis' lista"))
  .catch(err => console.error(" Error creando tabla:", err));




app.post('/api/registro', async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre',
      [nombre, email, password]
    );
    console.log("Usuario registrado:", nombre);
    res.json({ success: true, usuario: result.rows[0] });
  } catch (err) {
    console.error("Error registrando usuario:", err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});



app.post('/api/login', async (req, res) => {
  const { nombre, password } = req.body;
  if (!nombre || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const result = await pool.query(
      'SELECT id, nombre FROM usuarios WHERE nombre = $1 AND password = $2',
      [nombre, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario o contraseña incorrecta" });
    }

    console.log("Usuario inició sesión:", nombre);
    res.json({ success: true, usuario: result.rows[0] });
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

app.post('/api/guardar-analisis', async (req, res) => {
  const { usuario_id, imagen_url, resultado } = req.body;

  if (!usuario_id || !imagen_url || !resultado) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO analisis (usuario_id, imagen_url, resultado) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, imagen_url, resultado]
    );
    res.json({ success: true, analisis: result.rows[0] });
  } catch (err) {
    console.error("Error guardando análisis:", err);
    res.status(500).json({ error: "Error al guardar análisis" });
  }
});



app.listen(port, () => {
  console.log(` Servidor corriendo en http://localhost:${port}`);
});

// cd "C:\Users\49006614\Documents\GitHub\proyecto-NEIA\Millie (front y back)"