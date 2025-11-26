// =======================================================
//  IMPORTS Y CONFIGURACIÓN
// =======================================================
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = 3000;

// Multer para archivos CSV / EEG / Formulario
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

app.use(cors());
app.use(bodyParser.json());

// Servir el frontend desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));


// =======================================================
//  POSTGRES (NEON)
// =======================================================
const pool = new Pool({
  host: 'ep-steep-boat-acdiqbkj-pooler.sa-east-1.aws.neon.tech',
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_D7bZj4AxWpOv',
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

// =======================================================
//  SUPABASE STORAGE
// =======================================================
const supabase = createClient(
  "https://snyxnocwfmkeakzjslzd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNueXhub2N3Zm1rZWFrempzbHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDg2MjcsImV4cCI6MjA3ODQyNDYyN30.GD-9DohC1Sz1yphNd0agnzEWzli14_TlsbuNsJuSrLA"
);

// =======================================================
//  CREACIÓN DE TABLAS UNIFICADAS
// =======================================================
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analisis (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,

      -- Campos para guardar análisis de IA
      resultado TEXT,
      confianza NUMERIC,

      -- Campos del formulario
      nombre TEXT,
      descripcion TEXT,

      -- Archivo subido (CSV original)
      archivo_nombre TEXT,
      archivo_url TEXT,

      fecha TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log(" Tablas cargadas correctamente");
})();


// =======================================================
//  REGISTRO
// =======================================================
app.post('/api/registro', async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO usuarios (nombre,email,password) VALUES ($1,$2,$3) RETURNING id,nombre",
      [nombre, email, password]
    );
    res.json({ success: true, usuario: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// =======================================================
//  LOGIN
// =======================================================
app.post('/api/login', async (req, res) => {
  const { nombre, password } = req.body;

  const result = await pool.query(
    "SELECT id,nombre FROM usuarios WHERE nombre=$1 AND password=$2",
    [nombre, password]
  );

  if (result.rows.length === 0)
    return res.status(401).json({ error: "Credenciales incorrectas" });

  res.json({ success: true, usuario: result.rows[0] });
});

// =======================================================
//  ENDPOINT NUEVO — ANALIZAR SENTIMIENTO (con IA Python)
// =======================================================
app.post('/api/analizar-sentimiento', upload.single("csvFile"), async (req, res) => {
  try {
    const usuarioId = req.body.usuarioId;
    const file = req.file;

    if (!file)
      return res.status(400).json({ error: "No se envió archivo CSV" });

    const formData = new FormData();
    formData.append("file", file.buffer, file.originalname);

    const aiResponse = await axios.post("http://localhost:5000/predict", formData, {
      headers: formData.getHeaders()
    });

    const { sentiment, confidence } = aiResponse.data;

    // Si hay usuario → guardar en historial
    if (usuarioId) {
      await pool.query(
        `INSERT INTO analisis (usuario_id, resultado, confianza, archivo_nombre)
         VALUES ($1,$2,$3,$4)`,
        [usuarioId, sentiment, confidence, file.originalname]
      );
    }

    res.json({
      success: true,
      sentimiento: sentiment,
      confianza: confidence,
    });

  } catch (err) {
    res.status(500).json({ error: "Error analizando archivo" });
  }
});

// =======================================================
//  ENDPOINT NUEVO — ANALIZAR EEG (formato nuevo)
// =======================================================
app.post('/api/analizar-eeg', upload.single('eegFile'), async (req, res) => {
  const file = req.file;
  const usuarioId = req.body.usuarioId;

  if (!file)
    return res.status(400).json({ error: "No se recibió archivo" });

  const csvData = [];
  const tempPath = "./temp.csv";

  // Guardar temporal para procesar con Python
  fs.writeFileSync(tempPath, file.buffer);

  fs.createReadStream(tempPath)
    .pipe(csv())
    .on('data', row => csvData.push(row))
    .on('end', async () => {
      try {
        const response = await axios.post("http://localhost:5000/predict", {
          data: csvData
        });

        fs.unlinkSync(tempPath);

        const { prediction, confidence } = response.data;

        if (usuarioId) {
          await pool.query(
            `INSERT INTO analisis (usuario_id, resultado, confianza, archivo_nombre)
             VALUES ($1,$2,$3,$4)`,
            [usuarioId, prediction, confidence, file.originalname]
          );
        }

        res.json({
          success: true,
          resultado: prediction,
          confianza: confidence,
        });

      } catch (err) {
        fs.unlinkSync(tempPath);
        res.status(500).json({ error: "Error analizando EEG" });
      }
    });
});

// =======================================================
//  ENDPOINT VIEJO — GUARDAR ANÁLISIS COMPLETO DEL FORMULARIO
// =======================================================
app.post('/api/guardar-analisis', upload.single("archivo"), async (req, res) => {
  try {
    const { usuarioId, nombre, descripcion, resultado, confianza } = req.body;
    const file = req.file;

    if (!usuarioId || !file)
      return res.status(400).json({ error: "Faltan datos o archivo" });

    const ruta = `${usuarioId}/${Date.now()}_${file.originalname}`;

    const { error: uploadError } = await supabase.storage
      .from("analisis")
      .upload(ruta, file.buffer, { contentType: file.mimetype });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("analisis").getPublicUrl(ruta);

    await pool.query(
      `INSERT INTO analisis 
       (usuario_id,nombre,descripcion,resultado,confianza,archivo_nombre,archivo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        usuarioId,
        nombre,
        descripcion,
        resultado,
        confianza || null,
        file.originalname,
        urlData.publicUrl,
      ]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Error guardando análisis" });
  }
});

// =======================================================
//  HISTORIAL FINAL UNIFICADO
// =======================================================
app.get('/api/historial/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;

  const result = await pool.query(
    `SELECT * FROM analisis
     WHERE usuario_id=$1
     ORDER BY fecha DESC`,
    [usuarioId]
  );

  res.json({ success: true, historial: result.rows });
});

// Cualquier ruta que no sea /api devuelve el index.html del frontend
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// =======================================================
app.listen(port, () => {
  console.log("🔥 Backend completo y listo en http://localhost:" + port);
});

app.delete("/api/analisis/:id", async (req, res) => {
    const id = req.params.id;

    try {
        // BORRAR EN NEON
        const result = await pool.query(
            "DELETE FROM analisis WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rowCount === 0) {
            return res.json({ success: false, error: "No existe ese análisis" });
        }

        res.json({ success: true });

    } catch (err) {
        console.error("❌ Error eliminando análisis:", err);
        res.status(500).json({ success: false, error: "Error en el servidor" });
    }
});
