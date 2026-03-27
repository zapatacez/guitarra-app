FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle ./drizzle

RUN mkdir -p /data

ENV NODE_ENV=production
ENV DATABASE_URL=/data/guitarra.db
ENV PORT=3000
EXPOSE 3000

CMD ["bun", "build/index.js"]
