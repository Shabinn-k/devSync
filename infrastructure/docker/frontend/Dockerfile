FROM node:22.23.3-alpine3.24 AS builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
ARG VITE_API_URL=http://localhost:8080
ARG VITE_WS_URL=ws://localhost:8080
ARG VITE_ENV=development
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WS_URL=${VITE_WS_URL}
ENV VITE_ENV=${VITE_ENV}
RUN if [ "$VITE_ENV" = "production" ]; then \
      case "$VITE_API_URL" in https://*) ;; *) echo "Production VITE_API_URL must use HTTPS" >&2; exit 1;; esac; \
      case "$VITE_WS_URL" in wss://*) ;; *) echo "Production VITE_WS_URL must use WSS" >&2; exit 1;; esac; \
    fi
RUN npm run build

FROM nginx:1.30.5-alpine3.24
ARG VITE_ENV=development
COPY infrastructure/docker/frontend/nginx.conf /tmp/nginx.production.conf
COPY infrastructure/docker/frontend/nginx.development.conf /tmp/nginx.development.conf
RUN if [ "$VITE_ENV" = "production" ]; then \
      cp /tmp/nginx.production.conf /etc/nginx/conf.d/default.conf; \
    else \
      cp /tmp/nginx.development.conf /etc/nginx/conf.d/default.conf; \
    fi \
    && rm /tmp/nginx.production.conf /tmp/nginx.development.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
