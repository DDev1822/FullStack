# Book Recommendation Engine using KNN

Solución del proyecto **Book Recommendation Engine using KNN** de freeCodeCamp — Machine Learning with Python.

## Objetivo

Construir un recomendador de libros con `sklearn.neighbors.NearestNeighbors` sobre el dataset Book-Crossings.

El notebook:

- conserva únicamente usuarios con **al menos 200 ratings**;
- conserva únicamente libros con **al menos 100 ratings**;
- construye una matriz dispersa libro × usuario;
- usa distancia coseno con K-Nearest Neighbors;
- implementa `get_recommends(book)`;
- devuelve cinco libros similares con sus distancias en el formato exigido por freeCodeCamp;
- conserva la celda de prueba oficial al final.

## Archivo

- `fcc_book_recommendation_knn.ipynb`: notebook completo y listo para Google Colab.

## Ejecutar en Google Colab

Puedes abrir directamente este notebook desde GitHub con:

https://colab.research.google.com/github/DDev1822/FullStack/blob/main/book-recommendation-engine-knn/fcc_book_recommendation_knn.ipynb

Ejecuta todas las celdas de arriba hacia abajo. El notebook descarga el dataset oficial de freeCodeCamp, prepara los datos, entrena el modelo KNN y ejecuta la prueba final.

## Contrato de `get_recommends`

```python
get_recommends("The Queen of the Damned (Vampire Chronicles (Paperback))")
```

Devuelve:

```python
[
    "The Queen of the Damned (Vampire Chronicles (Paperback))",
    [
        ["book title", distance],
        ...
    ]
]
```

La segunda posición contiene exactamente cinco recomendaciones. Se excluye el libro consultado y se invierte el orden de los cinco vecinos para coincidir con el formato esperado por la prueba del proyecto.

## Nota de validación

La estructura y el código del notebook pueden verificarse en GitHub. La validación definitiva del desafío requiere ejecutar el notebook en Colab y confirmar que la celda final imprime `You passed the challenge!`.
