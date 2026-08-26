# Neural Network SMS Text Classifier

Solución del proyecto **Neural Network SMS Text Classifier** de freeCodeCamp — Machine Learning with Python.

## Objetivo

Entrenar un clasificador de texto con TensorFlow/Keras que identifique mensajes SMS como:

- `ham`: mensaje normal.
- `spam`: publicidad o mensaje no deseado.

La función requerida `predict_message(message)` devuelve una lista con:

1. La probabilidad estimada de spam entre 0 y 1.
2. La etiqueta final `ham` o `spam`.

Ejemplo:

```python
[0.0083, "ham"]
```

## Archivo principal

- `fcc_sms_text_classification.ipynb`: notebook completado a partir del boilerplate oficial de freeCodeCamp.

## Implementación

El notebook incluye:

- Lectura de los datasets TSV oficiales de entrenamiento y validación.
- Conversión de etiquetas `ham/spam` a valores binarios `0/1`.
- Vectorización de texto con `TextVectorization`.
- Representación TF-IDF con unigramas y bigramas.
- Red neuronal densa para clasificación binaria.
- `Dropout` para regularización.
- Entrenamiento con `binary_crossentropy` y `EarlyStopping`.
- Evaluación sobre el conjunto de validación.
- Función `predict_message` con la interfaz exacta requerida por el desafío.
- Celda final oficial de freeCodeCamp conservada sin modificaciones.

## Ejecutar en Google Colab

1. Abre `fcc_sms_text_classification.ipynb` desde GitHub en Google Colab.
2. Ejecuta todas las celdas desde arriba hacia abajo.
3. Las primeras celdas descargan automáticamente los datasets oficiales.
4. El modelo se entrena y luego se evalúa con el conjunto de validación.
5. La última celda ejecuta el test oficial del desafío.

## Nota de reproducibilidad

Se fijan semillas de NumPy y TensorFlow para reducir variaciones entre ejecuciones. El entrenamiento sigue dependiendo de la versión de TensorFlow y del entorno de Colab, por lo que el resultado efectivo debe comprobarse ejecutando la última celda.

Fuente del boilerplate: `freeCodeCamp/boilerplate-neural-network-sms-text-classifier` (rama actual `main`).
