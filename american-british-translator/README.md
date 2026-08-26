# American / British English Translator

Solución full-stack del proyecto **American British English Translator** de freeCodeCamp.

## Ejecutar

```bash
npm install
npm run test
npm start
```

La aplicación queda disponible en `http://localhost:3000`.

## API

`POST /api/translate`

```json
{
  "text": "Mangoes are my favorite fruit.",
  "locale": "american-to-british"
}
```

Locales válidos:

- `american-to-british`
- `british-to-american`

Las palabras o expresiones traducidas se resaltan con `<span class="highlight">...</span>`.

## Estructura

- `components/translator.js`: lógica de traducción.
- `components/*.js`: diccionarios de términos, ortografía y títulos.
- `routes/api.js`: endpoint `/api/translate`.
- `tests/1_unit-tests.js`: 24 pruebas unitarias requeridas.
- `tests/2_functional-tests.js`: 6 pruebas funcionales requeridas.
- `views/` y `public/`: interfaz web.
