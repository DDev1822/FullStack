# Rock Paper Scissors

Solución del proyecto **Rock Paper Scissors** de freeCodeCamp — Machine Learning with Python.

## Objetivo

Implementar `player(prev_play)` en `RPS.py` para derrotar al menos el 60% de las partidas contra los cuatro bots oficiales: `quincy`, `abbey`, `kris` y `mrugesh`.

## Estrategia

La solución mantiene cuatro modelos candidatos del oponente y puntúa continuamente qué modelo explica mejor las jugadas observadas:

- **Quincy**: patrón periódico fijo.
- **Kris**: respuesta directa a la jugada anterior del jugador.
- **Mrugesh**: respuesta a la moda de las últimas diez jugadas del jugador.
- **Abbey**: modelo de transición de primer orden sobre las jugadas del jugador.

En cada turno se selecciona el modelo con mayor puntuación, se predice la siguiente jugada del oponente y se ejecuta el counter-move correspondiente.

## Archivos

- `RPS.py`: solución. Toda la lógica del jugador está aquí.
- `RPS_game.py`: motor y bots oficiales del boilerplate. No modificar.
- `main.py`: ejecución manual de partidas.
- `test_module.py`: pruebas oficiales del reto.

## Ejecutar

```bash
python main.py
```

Para ejecutar directamente las pruebas:

```bash
python -m unittest test_module.py
```

El criterio de aprobación es obtener al menos 60% de victorias frente a cada bot en 1000 juegos.
