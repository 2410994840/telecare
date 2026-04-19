FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

FROM node:18-alpine
WORKDIR /app
RUN addgroup -S telecare && adduser -S telecare -G telecare
COPY --from=builder /app .
RUN mkdir -p logs && chown -R telecare:telecare /app
USER telecare
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1
CMD ["node", "src/server.js"]
