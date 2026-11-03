# Multi-stage Docker build for HELLGOD Master Server
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

# Install Node.js for dual engine
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    npm \
    curl \
    sqlite3 \
    procps \
    net-tools \
    && rm -rf /var/lib/apt/lists/*

COPY hellgod-server/backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=frontend-builder /app/dist ./dist
COPY server.ts ./
COPY src ./src
COPY tsconfig.json ./

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000 8000

CMD ["npx", "tsx", "server.ts"]
