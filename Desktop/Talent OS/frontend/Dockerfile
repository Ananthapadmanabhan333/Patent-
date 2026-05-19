# ==========================================
# STAGE 1: BUILD ENVIRONMENT
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency mappings and lock files for npm caching
COPY frontend/package*.json ./
RUN npm ci

# Copy the rest of frontend configurations and source
COPY frontend/ ./

# Compile TailwindCSS configurations and pack static distribution bundles
RUN npm run build

# ==========================================
# STAGE 2: PRODUCTION ENVIRONMENT
# ==========================================
FROM nginx:stable-alpine

# Copy built distribution artifacts to default Nginx root directory
COPY --from=build /app/dist /usr/share/nginx/html

# Replace default configuration to support SPA routing (fallback to index.html)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
