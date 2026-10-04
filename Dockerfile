# Etapa 1: compilar la aplicación. Las URLs de las APIs son RELATIVAS: el nginx
# de la imagen final reenvía /api/negocio y /api/agente a cada backend, de modo
# que el navegador solo conoce un origen (la cookie de sesión no cruza sitios).
FROM node:22-alpine AS compilacion
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# El identificador del asistente de Botpress es público (viaja en el cliente).
ARG VITE_BOTPRESS_CLIENT_ID=""
ENV VITE_API_NEGOCIO_URL=/api/negocio \
    VITE_API_AGENTE_URL=/api/agente \
    VITE_BOTPRESS_CLIENT_ID=${VITE_BOTPRESS_CLIENT_ID}
RUN npm run build

# Etapa 2: nginx sirve la SPA y reenvía las APIs. La plantilla se procesa al
# arrancar con las variables API_NEGOCIO_URL, API_AGENTE_URL y PORT (Cloud Run).
FROM nginx:1.27-alpine
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=compilacion /app/dist /usr/share/nginx/html

ENV PORT=8080 \
    NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
EXPOSE 8080
