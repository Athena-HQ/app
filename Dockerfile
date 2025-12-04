FROM node:lts-alpine AS base

RUN corepack enable && corepack prepare bun@latest --activate

WORKDIR /app

FROM base AS deps

COPY package.json bun-lock ./

RUN bun install --frozen-lockfile

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun build

FROM base AS runner

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 80   

ENV PORT=80
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]