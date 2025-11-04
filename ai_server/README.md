# Servidor de IA para análisis de sentimientos en señales EEG

## Instalación

1. Crear un entorno virtual de Python:
```bash
python -m venv venv
venv\Scripts\activate  # En Windows
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Colocar tu modelo `modelo_sentimientos.h5` en este directorio

4. Ejecutar el servidor:
```bash
python app.py
```

El servidor estará disponible en http://localhost:5000

## Endpoints

- `GET /health` - Verificar estado del servidor y modelo
- `POST /predict` - Realizar predicción enviando archivo CSV
- `POST /reload_model` - Recargar el modelo

## Uso

El endpoint `/predict` espera un archivo CSV con datos EEG. El servidor:
1. Lee y preprocesa los datos
2. Los pasa por el modelo de Keras
3. Retorna el sentimiento detectado (positivo/negativo/neutro) con nivel de confianza