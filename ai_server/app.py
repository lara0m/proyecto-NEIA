from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
import os
import io
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Permitir requests desde el frontend

# Variable global para el modelo
model = None
MODEL_PATH = "modelo_sentimientos.h5"  # Ruta donde estará tu modelo

def load_model():
    """Cargar el modelo de Keras"""
    global model
    try:
        if os.path.exists(MODEL_PATH):
            model = keras.models.load_model(MODEL_PATH)
            logger.info(f"Modelo cargado exitosamente desde {MODEL_PATH}")
            return True
        else:
            logger.warning(f"Modelo no encontrado en {MODEL_PATH}")
            return False
    except Exception as e:
        logger.error(f"Error cargando el modelo: {str(e)}")
        return False

def preprocess_eeg_data(df):
    """
    Preprocesar los datos EEG para el modelo
    Ajusta esta función según el formato específico que espera tu modelo
    """
    try:
        # Ejemplo de preprocesamiento básico
        # Eliminar columnas no numéricas si las hay
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        df_numeric = df[numeric_columns]
        
        # Normalizar los datos (ajusta según tu modelo)
        # Esto es un ejemplo, puede que necesites normalización específica
        data_normalized = (df_numeric - df_numeric.mean()) / df_numeric.std()
        
        # Convertir a array numpy
        data_array = data_normalized.values
        
        # Agregar dimensión si es necesario (para batch)
        if len(data_array.shape) == 2:
            data_array = np.expand_dims(data_array, axis=0)
        
        logger.info(f"Datos preprocesados con forma: {data_array.shape}")
        return data_array
    
    except Exception as e:
        logger.error(f"Error en preprocesamiento: {str(e)}")
        return None

def predict_sentiment(processed_data):
    """
    Realizar predicción de sentimientos
    """
    try:
        if model is None:
            return None, "Modelo no cargado"
        
        # Realizar predicción
        prediction = model.predict(processed_data)
        
        # Mapear predicción a sentimientos
        # Ajusta según tu modelo específico
        sentiment_labels = ['negativo', 'neutro', 'positivo']
        
        if len(prediction.shape) > 1 and prediction.shape[1] == 3:
            # Clasificación multiclase
            predicted_class = np.argmax(prediction, axis=1)[0]
            confidence = float(np.max(prediction))
            sentiment = sentiment_labels[predicted_class]
        else:
            # Clasificación binaria o regresión
            # Ajusta según tu modelo
            pred_value = float(prediction[0][0])
            if pred_value < 0.33:
                sentiment = 'negativo'
            elif pred_value < 0.66:
                sentiment = 'neutro'
            else:
                sentiment = 'positivo'
            confidence = abs(pred_value - 0.5) * 2  # Estimación de confianza
        
        logger.info(f"Predicción: {sentiment} (confianza: {confidence:.3f})")
        return sentiment, confidence
    
    except Exception as e:
        logger.error(f"Error en predicción: {str(e)}")
        return None, str(e)

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint para verificar que el servidor esté funcionando"""
    model_status = "cargado" if model is not None else "no cargado"
    return jsonify({
        'status': 'ok',
        'model_status': model_status,
        'message': 'Servidor de IA funcionando correctamente'
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint principal para realizar predicciones
    Espera un archivo CSV con datos EEG
    """
    try:
        # Verificar que el modelo esté cargado
        if model is None:
            return jsonify({
                'success': False,
                'error': 'Modelo no cargado. Verifica que el archivo modelo_sentimientos.h5 esté en el directorio.'
            }), 500
        
        # Verificar que se envió un archivo
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No se envió ningún archivo CSV'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'Nombre de archivo vacío'
            }), 400
        
        # Leer el archivo CSV
        try:
            csv_data = pd.read_csv(io.StringIO(file.stream.read().decode("utf-8")))
            logger.info(f"CSV leído con forma: {csv_data.shape}")
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Error leyendo el archivo CSV: {str(e)}'
            }), 400
        
        # Preprocesar los datos
        processed_data = preprocess_eeg_data(csv_data)
        if processed_data is None:
            return jsonify({
                'success': False,
                'error': 'Error en el preprocesamiento de datos'
            }), 400
        
        # Realizar predicción
        sentiment, confidence = predict_sentiment(processed_data)
        if sentiment is None:
            return jsonify({
                'success': False,
                'error': f'Error en la predicción: {confidence}'
            }), 500
        
        # Responder con el resultado
        return jsonify({
            'success': True,
            'sentiment': sentiment,
            'confidence': round(confidence, 3),
            'message': f'La persona presenta sentimientos {sentiment}'
        })
    
    except Exception as e:
        logger.error(f"Error en endpoint predict: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error interno del servidor: {str(e)}'
        }), 500

@app.route('/reload_model', methods=['POST'])
def reload_model():
    """Endpoint para recargar el modelo"""
    success = load_model()
    if success:
        return jsonify({
            'success': True,
            'message': 'Modelo recargado exitosamente'
        })
    else:
        return jsonify({
            'success': False,
            'error': 'No se pudo cargar el modelo'
        }), 500

if __name__ == '__main__':
    # Intentar cargar el modelo al iniciar
    load_model()
    
    # Iniciar el servidor
    app.run(host='0.0.0.0', port=5000, debug=True)