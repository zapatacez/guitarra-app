FROM node:20-alpine AS builder
WORKDIR /app

# Build tools needed for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
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

CMD ["node", "build/index.js"]
