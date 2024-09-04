# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Production
FROM node:20-alpine
USER node
WORKDIR /app
COPY --from=builder /app /app

# This step is modified to copy .env only if it exists and log a message otherwise
COPY ["./.env", "/app/.env"]
EXPOSE ${HTTP_PORT} ${HTTPS_PORT}
CMD ["node", "src/server.mjs"]
