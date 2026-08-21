# Stage 1: Build Frontend
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY my-project/package*.json ./my-project/
COPY library-backend/package*.json ./library-backend/

RUN npm --prefix my-project install
COPY my-project ./my-project

RUN npm --prefix my-project run build

# Stage 2: Production Nginx Server
FROM nginx:alpine
COPY --from=builder /app/my-project/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
