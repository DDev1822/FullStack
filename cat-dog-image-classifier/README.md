# Cat and Dog Image Classifier

Solución del proyecto **Cat and Dog Image Classifier** de freeCodeCamp — Machine Learning with Python.

## Objetivo

Entrenar una red neuronal convolucional con TensorFlow/Keras para clasificar imágenes de gatos y perros y superar el **63% de precisión** exigido por el reto.

## Archivo principal

- `fcc_cat_dog.ipynb`: notebook completado a partir del boilerplate oficial de freeCodeCamp.

## Implementación

El notebook incluye:

- **Celda 3:** generadores de entrenamiento, validación y prueba con `ImageDataGenerator(rescale=1./255)`.
- **Celda 4:** función de visualización `plotImages`.
- **Celda 5:** data augmentation con rotación, desplazamientos, shear, zoom y horizontal flip.
- **Celda 7:** CNN secuencial con capas `Conv2D`, `MaxPooling2D`, `Dense` y `Dropout`.
- **Celda 8:** entrenamiento con `model.fit`.
- **Celda 9:** curvas de accuracy y loss.
- **Celda 10:** predicciones sobre las 50 imágenes de test manteniendo `shuffle=False`.
- **Celda 11:** prueba final de freeCodeCamp con umbral de aprobación de 63%.

## Ejecutar en Google Colab

1. Abre `fcc_cat_dog.ipynb` desde GitHub en Google Colab.
2. Si está disponible, selecciona **Runtime > Change runtime type > GPU**.
3. Ejecuta todas las celdas desde arriba hacia abajo.
4. La primera ejecución descarga automáticamente el dataset oficial.
5. La última celda imprime el porcentaje obtenido y si el desafío fue aprobado.

## Notas

El entrenamiento es estocástico. Se fijan semillas (`SEED = 42`) para mejorar reproducibilidad, pero pequeñas variaciones pueden aparecer entre versiones de TensorFlow y hardware. Si una corrida quedara cerca del umbral, puede repetirse el entrenamiento o aumentar `epochs`.

Fuente del boilerplate: `freeCodeCamp/boilerplate-cat-and-dog-image-classifier`.
