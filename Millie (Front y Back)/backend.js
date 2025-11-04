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


app.listen(port, () => {
  console.log(` Servidor corriendo en http://localhost:${port}`);
});

// cd "C:\Users\49006614\Documents\GitHub\proyecto-NEIA\Millie (front y back)"
