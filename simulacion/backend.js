// Comentamos Supabase por ahora - usaremos PostgreSQL local
// const { createClient } = require('@supabase/supabase-js');
// const supabaseUrl = 'https://snyxnocwfmkeakzjslzd.supabase.co';
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNueXhub2N3Zm1rZWFrempzbHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDg2MjcsImV4cCI6MjA3ODQyNDYyN30.GD-9DohC1Sz1yphNd0agnzEWzli14_TlsbuNsJuSrLA';
// const supabase = createClient(supabaseUrl, supabaseKey);

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Configuración de multer para manejar archivos CSV
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // Límite de 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname) === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'));
    }
  }
});

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
`).then(() => console.log("✅ Tabla 'usuarios' lista"))
  .catch(err => console.error("❌ Error creando tabla:", err));

// Crear tabla para historial de análisis
pool.query(`
  CREATE TABLE IF NOT EXISTS analisis_historial (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    archivo_nombre VARCHAR(255) NOT NULL,
    resultado VARCHAR(50) NOT NULL,
    confianza DECIMAL(5,4),
    fecha_analisis TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => console.log("✅ Tabla 'analisis_historial' lista"))
  .catch(err => console.error("❌ Error creando tabla historial:", err));

// Crear tabla para historial de análisis
pool.query(`
  CREATE TABLE IF NOT EXISTS analisis_historial (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    sentimiento VARCHAR(20) NOT NULL,
    confianza DECIMAL(5,3),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archivo_nombre VARCHAR(255)
  )
`).then(() => console.log(" Tabla 'analisis_historial' lista"))
  .catch(err => console.error(" Error creando tabla historial:", err));



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

// Nuevo endpoint para análisis de sentimientos
app.post('/api/analizar-sentimiento', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió archivo CSV" });
    }

    const usuarioId = req.body.usuarioId;
    
    // Crear FormData para enviar al servidor Python
    const formData = new FormData();
    formData.append('file', require('fs').createReadStream(req.file.path));

    // Hacer request al servidor de IA
    const aiResponse = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      body: formData
    });

    const aiResult = await aiResponse.json();
    
    if (aiResult.success) {
      // Guardar en historial si hay usuario logueado
      if (usuarioId) {
        await pool.query(
          'INSERT INTO analisis_historial (usuario_id, sentimiento, confianza, archivo_nombre) VALUES ($1, $2, $3, $4)',
          [usuarioId, aiResult.sentiment, aiResult.confidence, req.file.originalname]
        );
      }

      // Limpiar archivo temporal
      require('fs').unlinkSync(req.file.path);

      res.json({
        success: true,
        sentimiento: aiResult.sentiment,
        confianza: aiResult.confidence,
        mensaje: aiResult.message
      });
    } else {
      // Limpiar archivo temporal
      require('fs').unlinkSync(req.file.path);
      
      res.status(500).json({
        success: false,
        error: aiResult.error || 'Error en el análisis de IA'
      });
    }

  } catch (err) {
    console.error("Error en análisis:", err);
    
    // Limpiar archivo temporal si existe
    if (req.file && require('fs').existsSync(req.file.path)) {
      require('fs').unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Error interno del servidor" 
    });
  }
});

// Endpoint para obtener historial de análisis
app.get('/api/historial/:usuarioId', async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    
    const result = await pool.query(
      'SELECT * FROM analisis_historial WHERE usuario_id = $1 ORDER BY fecha_analisis DESC LIMIT 20',
      [usuarioId]
    );

    res.json({
      success: true,
      historial: result.rows
    });

  } catch (err) {
    console.error("Error obteniendo historial:", err);
    res.status(500).json({ error: "Error obteniendo historial" });
  }
});

// Endpoint para verificar estado del servidor de IA
app.get('/api/ia-status', async (req, res) => {
  try {
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Servidor de IA no disponible' 
    });
  }
});

// ===== ENDPOINT PARA ANÁLISIS EEG =====
app.post('/api/analizar-eeg', upload.single('eegFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo CSV" });
  }

  const usuario = req.body.usuario ? JSON.parse(req.body.usuario) : null;
  
  try {
    // Leer y procesar el archivo CSV
    const csvData = [];
    const filePath = req.file.path;
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        csvData.push(row);
      })
      .on('end', async () => {
        try {
          // Enviar datos al servidor Python para análisis
          const pythonResponse = await axios.post('http://localhost:5000/predict', {
            data: csvData,
            filename: req.file.originalname
          }, {
            timeout: 300000 // 5 minutos timeout para análisis complejos
          });

          const resultado = pythonResponse.data;
          
          // Guardar en historial si hay usuario logueado
          if (usuario && usuario.id) {
            await pool.query(
              'INSERT INTO analisis_historial (usuario_id, archivo_nombre, sentimiento, confianza) VALUES ($1, $2, $3, $4)',
              [usuario.id, req.file.originalname, resultado.prediction, resultado.confidence]
            );
          }

          // Limpiar archivo temporal
          fs.unlinkSync(filePath);
          
          console.log(`✅ Análisis completado: ${resultado.prediction} (${resultado.confidence})`);
          res.json({
            success: true,
            resultado: resultado.prediction,
            confianza: resultado.confidence,
            detalles: resultado.details || {}
          });
          
        } catch (pythonError) {
          console.error("❌ Error comunicándose con servidor Python:", pythonError.message);
          console.error("❌ Detalles del error:", pythonError.response?.data || pythonError);
          fs.unlinkSync(filePath); // Limpiar archivo en caso de error
          
          if (pythonError.code === 'ECONNREFUSED') {
            res.status(503).json({ 
              error: "El servidor de análisis no está disponible. Asegúrate de que el servidor Python esté ejecutándose." 
            });
          } else {
            res.status(500).json({ 
              error: "Error procesando el análisis EEG" 
            });
          }
        }
      })
      .on('error', (csvError) => {
        console.error("❌ Error leyendo CSV:", csvError);
        fs.unlinkSync(filePath);
        res.status(400).json({ error: "Error procesando el archivo CSV" });
      });
      
  } catch (err) {
    console.error("❌ Error en análisis EEG:", err);
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===== ENDPOINT PARA OBTENER HISTORIAL =====
app.get('/api/historial/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM analisis_historial WHERE usuario_id = $1 ORDER BY fecha_analisis DESC LIMIT 20',
      [usuarioId]
    );
    
    res.json({ success: true, historial: result.rows });
  } catch (err) {
    console.error("❌ Error obteniendo historial:", err);
    res.status(500).json({ error: "Error obteniendo historial" });
  }
});


app.listen(port, () => {
  console.log(` Servidor corriendo en http://localhost:${port}`);
});

// cd "C:\Users\49006614\Documents\GitHub\proyecto-NEIA\Millie (front y back)"