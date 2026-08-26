# Linear Regression Health Costs Calculator

Solución del proyecto **Linear Regression Health Costs Calculator** de freeCodeCamp — Machine Learning with Python.

## Objetivo

Predecir gastos de atención médica a partir de variables demográficas y de estilo de vida mediante un modelo de regresión con TensorFlow/Keras, logrando un **Mean Absolute Error (MAE) menor a 3500** sobre el conjunto de prueba.

## Archivo principal

- `fcc_predict_health_costs_with_regression.ipynb`: notebook completado a partir del boilerplate oficial de freeCodeCamp.

## Implementación

El notebook incluye:

- Conversión de `sex`, `smoker` y `region` a variables numéricas.
- División reproducible 80/20 en `train_dataset` y `test_dataset`.
- Separación de `expenses` mediante `pop()` para crear `train_labels` y `test_labels`.
- Variables de interacción para capturar mejor la estructura no lineal de los costos.
- Normalización de entradas usando únicamente el conjunto de entrenamiento.
- Red neuronal de regresión con TensorFlow/Keras.
- `EarlyStopping` para conservar los mejores pesos de validación.
- Celda final oficial de freeCodeCamp sin modificar, incluyendo evaluación MAE y gráfico de predicciones.

## Ejecutar en Google Colab

Abre directamente el notebook desde GitHub en Colab:

https://colab.research.google.com/github/DDev1822/FullStack/blob/main/linear-regression-health-costs-calculator/fcc_predict_health_costs_with_regression.ipynb

Luego ejecuta todas las celdas desde arriba hacia abajo. El dataset oficial se descarga automáticamente y la última celda informa si el modelo supera el umbral exigido.

## Criterio de aprobación

`model.evaluate(test_dataset, test_labels)` debe producir un **MAE < 3500**.

Fuente del boilerplate: `freeCodeCamp/boilerplate-linear-regression-health-costs-calculator` (rama actual `main`).
