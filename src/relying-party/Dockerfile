FROM node:20-bookworm-slim

WORKDIR /app

# Install backend dependencies
COPY app/package.json ./
RUN npm install --omit=dev

# Install and build frontend
COPY app/frontend/package.json ./frontend/
RUN cd frontend && npm install

COPY app/frontend ./frontend
RUN cd frontend && npm run build

# Copy server
COPY app/server.js ./

# Move built frontend into expected location
RUN mkdir -p dist && cp -r frontend/dist/* dist/

RUN mkdir -p /data

EXPOSE 8000

CMD ["node", "server.js"]
