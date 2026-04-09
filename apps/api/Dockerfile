# ---- Development ----
# Build context must be the monorepo root
FROM node:20-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
RUN npm install --workspace=apps/api --workspace=packages/shared --workspace=packages/ui
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui
COPY apps/api ./apps/api
EXPOSE 4000
CMD ["npm", "run", "dev", "--workspace=apps/api"]

# ---- Build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
RUN npm install --workspace=apps/api --workspace=packages/shared --workspace=packages/ui
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui
COPY apps/api ./apps/api
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npm run build --workspace=apps/api

# ---- Production ----
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/apps/api/prisma ./prisma
EXPOSE 4000
CMD ["npm", "run", "start"]
