# Etapa 1: Construcción
FROM node:20-alpine AS constructor
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# Etapa 2: Imagen final de producción
FROM node:20-alpine AS ejecucion
WORKDIR /app
ENV NODE_ENV=production
COPY --from=constructor /app/node_modules ./node_modules
COPY --from=constructor /app/dist ./dist
COPY --from=constructor /app/prisma ./prisma
COPY --from=constructor /app/package*.json ./

USER node
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]