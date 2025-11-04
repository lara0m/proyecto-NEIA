# NEIA - Sistema de Análisis de Sentimientos EEG

Sistema web que analiza señales EEG para detectar estados emocionales (Positivo, Negativo, Neutro) usando un modelo de machine learning entrenado con Keras.

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js (v14 o superior)
- Python 3.8 o superior
- Tu modelo de Keras entrenado (.h5)

### 1. Instalar Dependencias de Node.js

```bash
cd simulacion
npm install
```

### 2. Instalar Dependencias de Python

```bash
pip install -r requirements.txt
```

### 3. Configurar el Modelo

1. Coloca tu archivo de modelo `.h5` en la carpeta `simulacion`
2. Renómbralo a `modelo_eeg.h5` o edita la variable `MODEL_PATH` en `python_server.py`

### 4. Configurar Base de Datos

El sistema usa PostgreSQL. Asegúrate de que la configuración en `backend.js` coincida con tu base de datos:

```javascript
const pool = new Pool({
  host: 'tu-host',
  database: 'tu-database',
  user: 'tu-usuario',
  password: 'tu-contraseña',
  port: 5432,
  ssl: { rejectUnauthorized: false },
});
```

## 🏃‍♂️ Ejecución

### 1. Iniciar el Servidor Python (IA)

```bash
python python_server.py
```

El servidor estará disponible en: `http://localhost:5000`

### 2. Iniciar el Servidor Node.js (Backend Web)

En otra terminal:

```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

### 3. Verificar que Todo Funciona

- Abre tu navegador en `http://localhost:3000`
- Verifica que ambos servidores estén ejecutándose sin errores

## 📊 Uso del Sistema

### 1. Registro/Login de Usuario
- Haz clic en el ícono de usuario
- Crea una cuenta o inicia sesión

### 2. Analizar Datos EEG
- Sube un archivo CSV con datos EEG
- Haz clic en "ANALIZAR"
- Espera los resultados

### 3. Ver Historial
- Una vez logueado, aparecerá el botón "HISTORIAL"
- Consulta tus análisis anteriores

## 📁 Formato de Datos CSV

Tu archivo CSV debe contener:
- Datos numéricos de señales EEG
- Puede incluir headers (se procesarán automáticamente)
- Se eliminarán automáticamente columnas no numéricas

Ejemplo:
```csv
canal1,canal2,canal3,canal4
0.1,0.2,0.3,0.4
0.5,0.6,0.7,0.8
...
```

## 🔧 Configuración del Modelo

### Personalizar Preprocesamiento

Edita la función `preprocesar_datos_eeg()` en `python_server.py` para ajustar:
- Normalización de datos
- Dimensiones de entrada
- Filtros de señales

### Personalizar Interpretación

Edita la función `interpretar_prediccion()` para ajustar:
- Etiquetas de clasificación
- Umbrales de confianza
- Lógica de decisión

## 🧪 Endpoints de la API

### Backend Node.js (Puerto 3000)
- `POST /api/registro` - Registrar usuario
- `POST /api/login` - Iniciar sesión
- `POST /api/analizar-eeg` - Analizar archivo EEG
- `GET /api/historial/:userId` - Obtener historial

### Servidor Python (Puerto 5000)
- `POST /predict` - Realizar predicción
- `GET /health` - Estado del servidor
- `GET /model-info` - Información del modelo

## 🛠️ Desarrollo

### Estructura del Proyecto
```
simulacion/
├── backend.js          # Servidor Node.js
├── python_server.py    # Servidor Python/IA
├── index.html         # Frontend
├── script.js          # JavaScript frontend
├── style.css          # Estilos
├── package.json       # Dependencias Node.js
├── requirements.txt   # Dependencias Python
├── uploads/           # Archivos temporales
└── modelo_eeg.h5      # Tu modelo (agregar)
```

### Scripts Disponibles
- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar con nodemon (desarrollo)

## 🐛 Solución de Problemas

### Error: "Modelo no cargado"
- Verifica que `modelo_eeg.h5` esté en la carpeta correcta
- Comprueba que el archivo no esté corrupto
- Revisa los logs del servidor Python

### Error de conexión entre servidores
- Asegúrate de que ambos servidores estén ejecutándose
- Verifica que los puertos 3000 y 5000 estén libres
- Revisa la configuración de firewall

### Error de base de datos
- Verifica las credenciales en `backend.js`
- Asegúrate de que PostgreSQL esté ejecutándose
- Comprueba la conectividad de red

### Error de formato CSV
- Verifica que el archivo tenga datos numéricos
- Elimina filas vacías o con caracteres especiales
- Asegúrate de que coincida con el formato esperado por tu modelo

## 📝 Notas Importantes

- El sistema está configurado para modelos de clasificación de 3 clases (Positivo, Negativo, Neutro)
- Los archivos CSV se eliminan automáticamente después del procesamiento
- El historial se guarda solo para usuarios autenticados
- La normalización de datos se hace automáticamente

## 🔮 Próximas Mejoras

- [ ] Soporte para más formatos de archivo
- [ ] Visualización de señales EEG
- [ ] Análisis en tiempo real
- [ ] Métricas de rendimiento del modelo
- [ ] Exportación de resultados

---

**¿Necesitas ayuda?** Revisa los logs de ambos servidores para identificar errores específicos.