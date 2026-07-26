# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
COPY posts/ /posts/
COPY data/ /data/
RUN npm run build

# Stage 2: Build backend TypeScript
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/tsconfig.json ./
COPY server/src/ ./src/
RUN npx tsc

# Stage 3: Production runtime
FROM node:20-alpine
WORKDIR /app

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY --from=backend-builder /app/dist ./dist
COPY --from=frontend-builder /app/dist ./public

ENV PORT=3456
EXPOSE 3456

CMD ["node", "dist/index.js"]
