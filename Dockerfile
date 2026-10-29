# FinGuard AI — Multi-Stage Production Container
# Node 20 LTS for Full-Stack Server & Vite Compilation
FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runner stage
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/backend ./src/backend
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/sql ./sql

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
