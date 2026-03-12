FROM node:22-alpine AS build

RUN apk add --no-cache python3 make g++

WORKDIR /build

# Install frontend deps
COPY app/frontend/package.json ./frontend/
RUN cd frontend && npm install

# Install backend deps
COPY app/package.json ./
RUN npm install --omit=dev

# Build frontend
COPY app/frontend/ ./frontend/
RUN cd frontend && npm run build

# ---- Runtime stage --------------------------------------------------
FROM node:22-alpine

RUN apk add --no-cache ca-certificates && update-ca-certificates

WORKDIR /app

# Backend deps (pre-compiled better-sqlite3 from build stage)
COPY --from=build /build/node_modules ./node_modules

# Built frontend
COPY --from=build /build/frontend/dist ./dist

# Server source
COPY app/server.js app/wallet.js app/package.json ./

RUN mkdir -p /data

EXPOSE 8000

CMD sh -c "update-ca-certificates && node server.js"
