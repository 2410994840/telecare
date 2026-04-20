# -------- Builder Stage --------
FROM node:18-alpine AS builder

RUN apk update && apk upgrade

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# -------- Production Stage --------
FROM node:18-alpine

RUN apk update && apk upgrade

WORKDIR /app

RUN addgroup -S telecare && adduser -S telecare -G telecare

COPY --from=builder /app .

RUN mkdir -p logs && chown -R telecare:telecare /app

USER telecare

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]