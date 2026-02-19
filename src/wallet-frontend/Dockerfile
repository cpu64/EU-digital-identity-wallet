# ---- Build stage ----
FROM node:25-alpine AS build

WORKDIR /build

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ---- Production stage ----
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /build/dist /app
