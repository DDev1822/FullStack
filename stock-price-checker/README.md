# Stock Price Checker

Solución del proyecto **Stock Price Checker** de freeCodeCamp — Information Security.

## Objetivo

Exponer `GET /api/stock-prices` para consultar precios actuales mediante el proxy oficial de freeCodeCamp y administrar likes limitados a uno por IP.

## API

Ejemplos:

- `/api/stock-prices?stock=GOOG`
- `/api/stock-prices?stock=GOOG&like=true`
- `/api/stock-prices?stock=GOOG&stock=MSFT`
- `/api/stock-prices?stock=GOOG&stock=MSFT&like=true`

Para una acción se devuelve `stock`, `price` y `likes`. Para dos acciones se devuelve un arreglo con `stock`, `price` y `rel_likes`.

## Privacidad

La aplicación nunca almacena la IP en claro. Antes de registrar un like, la IP se transforma mediante SHA-256 con un salt de ejecución. Solo el hash irreversible permanece en memoria y un mismo hash no puede sumar más de un like al mismo símbolo.

Puede definirse `IP_HASH_SALT` en un despliegue si se requiere que el seudónimo sea estable entre reinicios.

## Seguridad

`server.js` incorpora Helmet, Content Security Policy, `Referrer-Policy`, deshabilita `X-Powered-By` y limita la confianza de proxy a un salto.

## Pruebas funcionales

`tests/2_functional-tests.js` implementa los cinco escenarios requeridos por freeCodeCamp:

1. Ver una acción.
2. Ver una acción y darle like.
3. Dar like nuevamente a la misma acción desde la misma IP sin incrementar el contador.
4. Comparar dos acciones.
5. Comparar dos acciones y dar like a ambas.

Con `NODE_ENV=test`, el runner FCC ejecuta automáticamente las pruebas. GitHub Actions valida que el reporte contenga exactamente cinco pruebas funcionales y que las cinco terminen en estado `passed`.

## Ejecución local

```bash
npm install
npm start
```

Abrir `http://localhost:3000`.

Fuente del boilerplate: `freeCodeCamp/boilerplate-project-stockchecker`.
