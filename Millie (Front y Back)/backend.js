const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = 3000;


app.use(cors());
app.use(bodyParser.json());
const upload = multer({ storage: multer.memoryStorage() });

const pool = new Pool({
  host: 'ep-steep-boat-acdiqbkj-pooler.sa-east-1.aws.neon.tech',
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_D7bZj4AxWpOv',
  port: 5432,
  ssl: { rejectUnauthorized: false },
});


const SUPABASE_URL = 'https://snyxnocwfmkeakzjslzd.supabase.co'; // ⚠️ reemplazá con tu URL real
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNueXhub2N3Zm1rZWFrempzbHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDg2MjcsImV4cCI6MjA3ODQyNDYyN30.GD-9DohC1Sz1yphNd0agnzEWzli14_TlsbuNsJuSrLA'; // ⚠️ reemplazá con tu clave de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS analisis (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        resultado TEXT,
        confianza NUMERIC,
        archivo_nombre TEXT,
        archivo_url TEXT,
        fecha TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Tablas listas");
  } catch (err) {
    console.error(" Error creando tablas:", err);
  }
})();


app.post('/api/registro', async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ error: "Faltan datos" });

  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre',
      [nombre, email, password]
    );
    res.json({ success: true, usuario: result.rows[0] });
  } catch (err) {
    console.error("Error registrando usuario:", err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

app.post('/api/login', async (req, res) => {
  const { nombre, password } = req.body;
  if (!nombre || !password)
    return res.status(400).json({ error: "Faltan datos" });

  try {
    const result = await pool.query(
      'SELECT id, nombre FROM usuarios WHERE nombre = $1 AND password = $2',
      [nombre, password]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ error: "Usuario o contraseña incorrecta" });

    res.json({ success: true, usuario: result.rows[0] });
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

app.post('/api/guardar-analisis', upload.single('archivo'), async (req, res) => {
  try {
    const { usuarioId, nombre, descripcion, resultado, confianza } = req.body;
    const file = req.file;

    if (!usuarioId || !file) {
      return res.status(400).json({ success: false, error: 'Faltan datos o archivo' });
    }

    // 🧩 Corregir confianza vacía o inválida
    const confianzaNum = confianza && !isNaN(confianza) ? parseFloat(confianza) : null;

    // 📁 Crear ruta de archivo única
    const filePath = `${usuarioId}/${Date.now()}_${file.originalname}`;

    // ⬆️ Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('analisis')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw uploadError;

    // 🌐 Obtener URL pública
    const { data: urlData } = supabase.storage.from('analisis').getPublicUrl(filePath);
    const archivo_url = urlData.publicUrl;

    // 🗃️ Guardar en la base de datos (usando confianzaNum)
    await pool.query(
      `INSERT INTO analisis 
        (usuario_id, nombre, descripcion, resultado, confianza, archivo_nombre, archivo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [usuarioId, nombre, descripcion, resultado, confianzaNum, file.originalname, archivo_url]
    );

    res.json({ success: true, mensaje: '✅ Análisis guardado correctamente' });

  } catch (error) {
    console.error('Error guardando análisis:', error);
    res.status(500).json({ success: false, error: 'Error guardando análisis' });
  }
});



app.get('/api/historial/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, nombre, descripcion, resultado, confianza, archivo_nombre, archivo_url, fecha
       FROM analisis
       WHERE usuario_id = $1
       ORDER BY fecha DESC`,
      [usuarioId]
    );
    res.json({ success: true, historial: result.rows });
  } catch (error) {
    console.error('Error cargando historial:', error);
    res.status(500).json({ success: false, error: 'Error al cargar el historial' });
  }
});


app.delete('/api/analisis/:id', async (req, res) => {
  const { id } = req.params;

  try {
    
    const { rows } = await pool.query('SELECT archivo_url, archivo_nombre FROM analisis WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Análisis no encontrado' });

    const archivo = rows[0];
    const path = decodeURIComponent(archivo.archivo_url.split('/').pop());
    await supabase.storage.from('analisis').remove([path]);

    
    await pool.query('DELETE FROM analisis WHERE id = $1', [id]);
    res.json({ success: true, mensaje: 'Análisis eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando análisis:', error);
    res.status(500).json({ success: false, error: 'Error eliminando análisis' });
  }
});


app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});


app.delete('/api/analisis/:id', async (req, res) => {
  const { id } = req.params;

  try {
    
    const { rows } = await pool.query('SELECT archivo_url FROM analisis WHERE id = $1', [id]);
    if (rows.length === 0) return res.json({ success: false, error: 'Análisis no encontrado' });

    const archivoUrl = rows[0].archivo_url;
    const archivoNombre = archivoUrl.split('/').pop();

    
    await supabase.storage.from('analisis').remove([archivoNombre]);

    
    await pool.query('DELETE FROM analisis WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar análisis:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

//cd "C:\Users\49006614\Documents\GitHub\proyecto-NEIA\Millie (front y back)"