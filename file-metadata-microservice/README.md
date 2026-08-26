# File Metadata Microservice

Solución del proyecto **File Metadata Microservice** de freeCodeCamp — Back End Development and APIs.

## Objetivo

Construir un microservicio Express que reciba un archivo mediante `multipart/form-data` y devuelva sus metadatos básicos.

## API

### `POST /api/fileanalyse`

El archivo debe enviarse en el campo `upfile`.

Respuesta:

```json
{
  "name": "example.txt",
  "type": "text/plain",
  "size": 1234
}
```

- `name`: nombre original del archivo.
- `type`: MIME type reportado durante la carga.
- `size`: tamaño del archivo en bytes.

## Implementación

- Node.js + Express.
- `multer` para procesar `multipart/form-data`.
- `memoryStorage` para evitar persistir archivos temporales en disco.
- CORS habilitado.
- Interfaz web incluida para seleccionar y subir un archivo.
- Manejo de solicitudes sin archivo y errores de carga.

## Ejecutar localmente

```bash
npm install
npm start
```

Por defecto la aplicación escucha en `http://localhost:3000`.

## Prueba rápida

```bash
curl -F "upfile=@./example.txt" http://localhost:3000/api/fileanalyse
```

Fuente del boilerplate: `freeCodeCamp/boilerplate-project-filemetadata`.
