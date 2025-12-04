# Etapa de build
FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies only when needed
FROM base AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
# to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml ./
COPY ./prisma ./prisma
RUN pnpm install --frozen-lockfile


# Rebuild the source code only when needed
FROM base AS builder
ARG ENVIRONMENT
ARG NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN pnpm run build
RUN pnpm prune --prod
RUN apk add --no-cache openssl

# Production image, copy all the files and run next
FROM base AS runner

WORKDIR /usr/src/app

# Definir variáveis de ambiente
ARG DATABASE_URL
ARG PORT

ENV PORT=${PORT}
ENV DATABASE_URL=${DATABASE_URL}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api

COPY --from=builder --chown=api:nodejs /usr/src/app/node_modules  ./node_modules
COPY --from=builder --chown=api:nodejs /usr/src/app/dist         ./dist
COPY --from=builder --chown=api:nodejs /usr/src/app/package.json  ./package.json
COPY --from=builder --chown=api:nodejs /usr/src/app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=api:nodejs /usr/src/app/prisma        ./prisma

RUN apk add --no-cache openssl

RUN chown -R api:nodejs /home
USER api

# Copiar código
COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate

# Gerar Prisma Client (evita que precise rodar na produção)
RUN npx prisma generate

# Expor porta da API
EXPOSE ${PORT}

# Comando de inicialização
CMD ["sh", "-c", "pnpm start"]
