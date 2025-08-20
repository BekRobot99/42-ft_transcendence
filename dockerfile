# Stage 1: Build the frontend
FROM node:20-alpine AS builder
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

# Copy build output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/index.html .
COPY --from=builder /app/styles.css .
COPY --from=builder /app/assets ./assets

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
