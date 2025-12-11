# Stage 1: Build the frontend application
FROM node:lts-alpine AS builder
WORKDIR /app

# Install TypeScript globally
RUN npm install -g typescript

# Copy package.json and package-lock.json from the frontend directory
COPY frontend/package.json frontend/package-lock.json* ./

# Install all dependencies including devDependencies for TypeScript build
RUN npm install --include=dev

# Copy the rest of the frontend application code from the frontend directory
COPY frontend/ ./

# Build the application (output will be in /app/dist)
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the compiled JavaScript files
COPY --from=builder /app/dist /usr/share/nginx/html/dist

# Copy source TypeScript files (for module resolution)
COPY --from=builder /app/src /usr/share/nginx/html/src

# Copy index.html
COPY --from=builder /app/index.html /usr/share/nginx/html/index.html

# Copy assets
COPY --from=builder /app/assets /usr/share/nginx/html/assets

# Copy styles
COPY --from=builder /app/styles.css /usr/share/nginx/html/styles.css

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy TLS certificates
COPY certificates /etc/nginx/certs

USER root

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]