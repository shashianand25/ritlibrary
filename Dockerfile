# Stage 1: Base image
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY my-project/package*.json ./my-project/
COPY library-backend/package*.json ./library-backend/

# Stage 2: Build Frontend
FROM base AS frontend-builder
ENV VITE_WORKER_URL=http://localhost:8787
ENV VITE_FIREBASE_API_KEY=your_firebase_api_key
ENV VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
ENV VITE_FIREBASE_PROJECT_ID=your_project_id
ENV VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
ENV VITE_FIREBASE_APP_ID=your_app_id
RUN npm --prefix my-project install
COPY my-project ./my-project
RUN npm --prefix my-project run build

# Stage 3: Worker / Backend Service
FROM base AS worker
WORKDIR /app/library-backend
RUN npm --prefix /app/library-backend install
COPY library-backend /app/library-backend
ENV PORT=8787
ENV ADMIN_EMAILS=admin@college.edu
ENV DRIVE_ROOT_ID=root
EXPOSE 8787
CMD ["npx", "wrangler", "dev", "--ip", "0.0.0.0", "--port", "8787"]

# Stage 4: Production Nginx Server (Frontend)
FROM nginx:alpine AS frontend
COPY --from=frontend-builder /app/my-project/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
