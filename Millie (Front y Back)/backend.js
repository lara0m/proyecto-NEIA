const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// === CONFIGURACIÓN DE SUPABASE ===
const supabase = createClient(
  'https://snyxnocwfmkeakzjslzd.supabase.co', // 👉 reemplazá con tu URL real
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNueXhub2N3Zm1rZWFrempzbHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDg2MjcsImV4cCI6MjA3ODQyNDYyN30.GD-9DohC1Sz1yphNd0agnzEWzli14_TlsbuNsJuSrLA' // 👉 reemplazá con tu clave anon pública
);

// === CONFIGURACIÓN DE POSTGRES ===
const pool = new Pool({
  host: 'ep-steep-boat-acdiqbkj-pooler.sa-east-1.aws.neon.tech',
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_D7bZj4AxWpOv',
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

// === MULTER para manejar archivos subidos ===
const storage = multer.memoryStorage();
const upload = multer({ storage });

// === CREAR TABLAS ===
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS analisis (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      nombre VARCHAR(100) NOT NULL,
      descripcion TEXT,
      archivo_nombre VARCHAR(200),
      archivo_url TEXT,
      resultado TEXT,
      confianza NUMERIC(5,2),
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Tablas listas');
})();

// === RUTAS DE USUARIOS ===
app.post('/api/registro', async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) return res.status(400).json({ error: 'Faltan datos' });

  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre',
      [nombre, email, password]
    );
    res.json({ success: true, usuario: result.rows[0] });
  } catch (err) {
    console.error('Error registrando usuario:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

app.post('/api/login', async (req, res) => {
  const { nombre, password } = req.body;
  if (!nombre || !password) return res.status(400).json({ error: 'Faltan datos' });

  try {
    const result = await pool.query(
      'SELECT id, nombre FROM usuarios WHERE nombre = $1 AND password = $2',
      [nombre, password]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Usuario o contraseña incorrecta' });

    res.json({ success: true, usuario: result.rows[0] });
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// === GUARDAR ANÁLISIS (con archivo real en Supabase Storage) ===
app.post('/api/guardar-analisis', upload.single('archivo'), async (req, res) => {
  const { usuarioId, nombre, descripcion, resultado, confianza } = req.body;
  const file = req.file;

  if (!usuarioId || !nombre || !resultado || !file) {
    return res.status(400).json({ error: 'Faltan datos obligatorios o archivo' });
  }

  try {
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}_${file.originalname}`;

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from('analisis')
      .upload(fileName, file.buffer, {
        contentType: 'text/csv',
        upsert: false,
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: publicURLData } = supabase.storage
      .from('analisis')
      .getPublicUrl(fileName);
    const fileURL = publicURLData.publicUrl;

    // Guardar en base de datos
    const result = await pool.query(
      `INSERT INTO analisis (usuario_id, nombre, descripcion, archivo_nombre, archivo_url, resultado, confianza)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [usuarioId, nombre, descripcion, file.originalname, fileURL, resultado, confianza || null]
    );

    res.json({ success: true, analisis: result.rows[0] });
  } catch (err) {
    console.error('Error guardando análisis:', err);
    res.status(500).json({ error: 'Error al guardar análisis' });
  }
});

// === HISTORIAL DE USUARIO ===
app.get('/api/historial/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM analisis WHERE usuario_id = $1 ORDER BY fecha DESC`,
      [usuarioId]
    );
    res.json({ success: true, historial: result.rows });
  } catch (err) {
    console.error('Error obteniendo historial:', err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

app.listen(port, () => console.log(`🚀 Servidor en http://localhost:${port}`));



//cd "C:\Users\49006614\Documents\GitHub\proyecto-NEIA\Millie (front y back)"