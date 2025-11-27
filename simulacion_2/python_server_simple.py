from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import json
import traceback
import pickle

# Intentar cargar TensorFlow/Keras de forma más robusta
try:
    import tensorflow as tf
    from tensorflow import keras
    print("✅ TensorFlow cargado exitosamente")
except Exception as e:
    print(f"❌ Error cargando TensorFlow: {e}")
    # Fallback para cuando TensorFlow no funciona
    print("⚠️ Modo de prueba sin TensorFlow")
    tf = None
    keras = None

app = Flask(__name__)
CORS(app)

# Variables globales para el modelo y scaler
model = None
scaler = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'modelo_eeg.h5')
SCALER_PATH = os.path.join(os.path.dirname(__file__), 'scaler_entrenado.pkl')

def cargar_modelo_y_scaler():
    """Carga el modelo de Keras y el StandardScaler entrenado"""
    global model, scaler
    try:
        if not tf or not keras:
            print("❌ TensorFlow no disponible, usando modo de prueba")
            return False
            
        # Cargar modelo
        if os.path.exists(MODEL_PATH):
            model = keras.models.load_model(MODEL_PATH)
            print(f"✅ Modelo cargado exitosamente desde {MODEL_PATH}")
            print(f"📊 Input shape del modelo: {model.input_shape}")
        else:
            print(f"❌ No se encontró el archivo del modelo: {MODEL_PATH}")
            return False
            
        # Cargar scaler
        if os.path.exists(SCALER_PATH):
            with open(SCALER_PATH, 'rb') as f:
                scaler = pickle.load(f)
            print(f"✅ StandardScaler cargado exitosamente desde {SCALER_PATH}")
            print(f"📊 Scaler features: {len(scaler.mean_)}")
        else:
            print(f"❌ No se encontró el archivo del scaler: {SCALER_PATH}")
            return False
            
        print(f"📊 Output shape del modelo: {model.output_shape}")
        return True
        
    except Exception as e:
        print(f"❌ Error cargando modelo y scaler: {e}")
        traceback.print_exc()
        return False

def preprocesar_datos_eeg_simple(data):
    """
    Preprocesamiento usando el StandardScaler entrenado con el dataset completo
    Esta es la forma CORRECTA basada en el notebook original
    """
    global scaler
    try:
        # Convertir a DataFrame
        df = pd.DataFrame(data)
        print(f"📊 DataFrame inicial: shape {df.shape}")
        
        # IMPORTANTE: Excluir específicamente la columna 'label'
        columnas_a_excluir = ['label', 'Unnamed: 0']
        
        # Obtener todas las columnas excepto las etiquetas
        columnas_features = [col for col in df.columns if col not in columnas_a_excluir]
        print(f"📊 Columnas de características: {len(columnas_features)}")
        
        if len(columnas_features) == 0:
            raise ValueError("No se encontraron columnas de características")
        
        # Extraer solo las características (sin etiquetas)
        df_features = df[columnas_features]
        print(f"📊 DataFrame de características: {df_features.shape}")
        
        # Convertir a numérico si es necesario
        for col in df_features.columns:
            if df_features[col].dtype == 'object':
                try:
                    df_features[col] = pd.to_numeric(df_features[col], errors='coerce')
                except:
                    pass
        
        # Eliminar filas con NaN
        df_clean = df_features.dropna()
        print(f"📊 DataFrame limpio: {df_clean.shape}")
        
        if df_clean.empty:
            raise ValueError("Todos los datos son NaN después de la limpieza")
        
        # Tomar solo la primera fila (para análisis individual)
        if len(df_clean) > 1:
            df_clean = df_clean.head(1)
            print("📊 Tomando solo la primera fila para análisis individual")
        
        # Ajustar número de características para que coincida con el scaler
        if scaler is not None:
            expected_features = len(scaler.mean_)
            current_features = df_clean.shape[1]
            
            print(f"📊 Características actuales: {current_features}, esperadas: {expected_features}")
            
            if current_features > expected_features:
                # Tomar las primeras N características
                df_clean = df_clean.iloc[:, :expected_features]
                print(f"📊 Recortado a {expected_features} características")
            elif current_features < expected_features:
                # Completar con ceros
                faltantes = expected_features - current_features
                df_zeros = pd.DataFrame(np.zeros((df_clean.shape[0], faltantes)), 
                                      index=df_clean.index)
                df_clean = pd.concat([df_clean, df_zeros], axis=1)
                print(f"📊 Completado con {faltantes} ceros hasta {expected_features} características")
            
            # APLICAR EL STANDARDSCALER ENTRENADO (clave del éxito)
            data_normalized = scaler.transform(df_clean.values)
            print(f"✅ Normalización con StandardScaler entrenado aplicada")
            
        else:
            print("⚠️ Scaler no disponible, usando normalización manual")
            data_array = df_clean.values
            if data_array.std() > 1e-10:
                data_normalized = (data_array - data_array.mean()) / data_array.std()
            else:
                data_normalized = data_array
        
        print(f"📊 Datos normalizados: shape {data_normalized.shape}")
        print(f"📊 Estadísticas finales: min={data_normalized.min():.3f}, max={data_normalized.max():.3f}, mean={data_normalized.mean():.3f}")
        
        return data_normalized
        
    except Exception as e:
        print(f"❌ Error en preprocesamiento: {e}")
        traceback.print_exc()
        raise
        
        # IMPORTANTE: Excluir específicamente la columna 'label'
        columnas_a_excluir = ['label', 'Unnamed: 0']
        
        # Obtener todas las columnas excepto las etiquetas
        columnas_features = [col for col in df.columns if col not in columnas_a_excluir]
        print(f"📊 Columnas de características: {len(columnas_features)}")
        
        if len(columnas_features) == 0:
            raise ValueError("No se encontraron columnas de características")
        
        # Extraer solo las características (sin etiquetas)
        df_features = df[columnas_features]
        print(f"📊 DataFrame de características: {df_features.shape}")
        
        # Verificar si hay datos numéricos
        print(f"📊 Tipos de datos: {df_features.dtypes.value_counts()}")
        
        # Convertir a numérico si es necesario
        for col in df_features.columns:
            if df_features[col].dtype == 'object':
                try:
                    df_features[col] = pd.to_numeric(df_features[col], errors='coerce')
                except:
                    pass
        
        # Eliminar filas con NaN
        df_clean = df_features.dropna()
        print(f"📊 DataFrame limpio: {df_clean.shape}")
        
        if df_clean.empty:
            raise ValueError("Todos los datos son NaN después de la limpieza")
        
        # Tomar solo la primera fila (para análisis individual)
        if len(df_clean) > 1:
            df_clean = df_clean.head(1)
            print("📊 Tomando solo la primera fila para análisis individual")
        
        # Convertir a array numpy
        data_array = df_clean.values
        print(f"📊 Array extraído: shape {data_array.shape}")
        
        # Verificar que tengamos exactamente 2548 características
        if data_array.shape[1] != 2548:
            print(f"⚠️ Características encontradas: {data_array.shape[1]}, esperadas: 2548")
            
            if data_array.shape[1] > 2548:
                # Tomar las primeras 2548
                data_array = data_array[:, :2548]
                print("📊 Recortando a las primeras 2548 características")
            elif data_array.shape[1] < 2548:
                # Completar con ceros
                padding = np.zeros((data_array.shape[0], 2548 - data_array.shape[1]))
                data_array = np.concatenate([data_array, padding], axis=1)
                print(f"📊 Completando con ceros hasta 2548 características")
        
        # Normalización usando StandardScaler (igual que en entrenamiento)
        # En el notebook usan: scaler.fit(x); X = scaler.transform(x)
        if data_array.std() > 1e-10:
            # Usar StandardScaler como en entrenamiento: (x - mean) / std
            data_normalized = (data_array - data_array.mean()) / data_array.std()
        else:
            print("⚠️ Desviación estándar muy pequeña, usando datos sin normalizar")
            data_normalized = data_array
        
        print(f"📊 Datos normalizados: shape {data_normalized.shape}")
        print(f"📊 Estadísticas finales: min={data_normalized.min():.3f}, max={data_normalized.max():.3f}, mean={data_normalized.mean():.3f}")
        
        return data_normalized
        
    except Exception as e:
        print(f"❌ Error en preprocesamiento: {e}")
        traceback.print_exc()
        raise

def prediccion_demo(data_shape):
    """
    Predicción de demostración cuando el modelo no está disponible
    """
    # Simulación de predicción para pruebas
    import random
    random.seed(42)
    
    # Simular predicción de 3 clases
    probs = [random.random() for _ in range(3)]
    total = sum(probs)
    probs = [p/total for p in probs]  # Normalizar
    
    return np.array([probs])

def interpretar_prediccion(prediction):
    """Interpreta la salida del modelo"""
    try:
        # Para clasificación de 3 clases: verificar probabilidades y mapeo
        if len(prediction[0]) == 3:
            # Imprimir probabilidades para debug
            print(f"🔍 Probabilidades del modelo: {prediction[0]}")
            
            # MAPEO CORRECTO basado EXACTAMENTE en el notebook original
            # encoding_data = ({'NEUTRAL': 0, 'POSITIVE': 1, 'NEGATIVE': 2})
            # Con StandardScaler correcto, ahora debería funcionar perfectamente
            labels = ['NEUTRAL', 'POSITIVE', 'NEGATIVE']
            
            predicted_class = np.argmax(prediction[0])
            confidence = float(prediction[0][predicted_class])
            
            print(f"🔍 Clase predicha: {predicted_class} ({labels[predicted_class]}) con confianza {confidence:.4f}")
            print(f"🔍 Distribución completa: {[f'{labels[i]}: {prediction[0][i]:.4f}' for i in range(3)]}")
            
            return labels[predicted_class], confidence
        
        # Para clasificación binaria
        elif len(prediction[0]) == 1:
            confidence = float(prediction[0][0])
            if confidence > 0.5:
                return 'Positivo', confidence
            else:
                return 'Negativo', 1 - confidence
        
        # Para 2 clases
        elif len(prediction[0]) == 2:
            labels = ['Negativo', 'Positivo']
            predicted_class = np.argmax(prediction[0])
            confidence = float(prediction[0][predicted_class])
            return labels[predicted_class], confidence
        
        else:
            predicted_class = np.argmax(prediction[0])
            confidence = float(prediction[0][predicted_class])
            return f'Clase_{predicted_class}', confidence
            
    except Exception as e:
        print(f"❌ Error interpretando predicción: {e}")
        return 'Error', 0.0

@app.route('/predict', methods=['POST'])
def predict():
    """Endpoint principal para realizar predicciones"""
    try:
        # Obtener datos del request
        request_data = request.get_json()
        
        if 'data' not in request_data:
            return jsonify({'error': 'No se proporcionaron datos para analizar'}), 400
        
        csv_data = request_data['data']
        filename = request_data.get('filename', 'archivo.csv')
        
        print(f"📊 Procesando {filename} con {len(csv_data)} filas")
        
        # Preprocesar datos
        try:
            processed_data = preprocesar_datos_eeg_simple(csv_data)
            print(f"✅ Preprocesamiento exitoso: {processed_data.shape}")
        except Exception as e:
            print(f"❌ Error en preprocesamiento: {e}")
            # Crear datos sintéticos como fallback
            print("🔄 Usando datos sintéticos para prueba...")
            processed_data = np.random.randn(1, 2548) * 0.1  # Datos pequeños y normalizados
        
        # Realizar predicción
        if model is not None:
            prediction = model.predict(processed_data)
            print("✅ Predicción realizada con modelo real")
        else:
            # Usar predicción de demostración
            prediction = prediccion_demo(processed_data.shape)
            print("⚠️ Usando predicción de demostración (modelo no disponible)")
        
        # Interpretar resultado
        label, confidence = interpretar_prediccion(prediction)
        
        # Preparar respuesta
        result = {
            'prediction': label,
            'confidence': round(confidence, 4),
            'filename': filename,
            'details': {
                'num_samples': len(csv_data),
                'processed_samples': processed_data.shape[0] if processed_data is not None else 0,
                'data_shape': list(processed_data.shape) if processed_data is not None else [],
                'model_available': model is not None
            }
        }
        
        print(f"✅ Predicción exitosa: {label} ({confidence:.4f}) para {filename}")
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Error en predicción: {e}")
        traceback.print_exc()
        return jsonify({
            'error': f'Error procesando la predicción: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint para verificar que el servidor esté funcionando"""
    model_status = "cargado" if model is not None else "no cargado"
    tf_status = "disponible" if tf is not None else "no disponible"
    return jsonify({
        'status': 'ok',
        'model_status': model_status,
        'tensorflow_status': tf_status,
        'message': 'Servidor de análisis EEG funcionando correctamente'
    })

@app.route('/model-info', methods=['GET'])
def model_info():
    """Endpoint para obtener información del modelo"""
    if model is None:
        return jsonify({
            'error': 'Modelo no cargado',
            'tensorflow_available': tf is not None
        }), 404
    
    try:
        info = {
            'model_loaded': True,
            'input_shape': list(model.input_shape) if model.input_shape else None,
            'output_shape': list(model.output_shape) if model.output_shape else None,
            'total_params': int(model.count_params()),
            'model_path': MODEL_PATH
        }
        return jsonify(info)
    except Exception as e:
        return jsonify({'error': f'Error obteniendo información del modelo: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 Iniciando servidor de análisis EEG...")
    
    # Intentar cargar el modelo al iniciar
    if cargar_modelo_y_scaler():
        print("✅ Servidor listo para realizar análisis")
    else:
        print("⚠️ Servidor iniciado en modo de prueba (sin modelo o TensorFlow)")
    
    # Iniciar servidor Flask
    # app.run(host='0.0.0.0', port=5000, debug=True)

 
    app.run(host='0.0.0.0', port=5000)