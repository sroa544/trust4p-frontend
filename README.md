# trust4p-frontend

Aplicacion de pagina unica (React + Vite) del sistema de diagnostico de
madurez de innovacion de Trust 4P.

Universidad Catolica de Colombia - Ingenieria de Sistemas
Mateo Julian Sotelo Acosta - Sebastian Roa Santana

## Repositorios del proyecto

| Repositorio | Contenido |
|---|---|
| trust4p-frontend | Esta aplicacion |
| trust4p-api-negocio | API de negocio (FastAPI) |
| trust4p-servicio-agente | Servicio de evaluacion asistida (FastAPI, pipeline RAG) |

## Puesta en marcha

    npm install
    copy .env.example .env
    npm run dev


## Integracion con el backend

La interfaz consume datos reales; no quedan datos simulados. El backend es la
fuente de verdad de las validaciones: el frontend solo orienta mientras se
escribe y muestra el mensaje que devuelve el servidor.

| Variable | Uso |
|---|---|
| VITE_API_NEGOCIO_URL | API de negocio (sesion por cookie HttpOnly, `credentials: include`) |
| VITE_API_AGENTE_URL | Servicio del agente (bitacora de ejecuciones del administrador) |
| VITE_BOTPRESS_CLIENT_ID | Asistente conversacional de glosario |

Para desarrollo local las APIs deben admitir el origen del frontend
(`CORS_ORIGENES`, por defecto `http://localhost:5173`) y los correos enlazan al
frontend con `URL_FRONTEND` en la API de negocio.

Estructura: `src/servicios` (cliente HTTP y un modulo por dominio),
`src/hooks` (sesion, cuestionario, resultado), `src/paginas` y `src/componentes`.

Pruebas: `npm test` (los servicios se simulan; no requieren backend). Lint:
`npm run lint`.
