# ---- Development ----
# Build context must be the monorepo root
FROM node:20-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
RUN npm install --workspace=apps/web --workspace=packages/shared --workspace=packages/ui
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui
COPY apps/web ./apps/web
EXPOSE 3000
CMD ["npm", "run", "dev", "--workspace=apps/web"]

# ---- Build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
RUN npm install --workspace=apps/web --workspace=packages/shared --workspace=packages/ui
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui
COPY apps/web ./apps/web
RUN npm run build --workspace=apps/web

# ---- Production ----
FROM nginx:alpine AS prod
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
