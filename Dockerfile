# syntax=docker/dockerfile:1.7

FROM alpine:3.22 AS base
WORKDIR /app
RUN apk add --no-cache nodejs npm \
  && npm install -g yarn@1.22.22 \
  && npm cache clean --force

FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public && yarn build

FROM alpine:3.22 AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=6003 \
    HOSTNAME=0.0.0.0 \
    GO_NOMAD_ADV_DB_PATH=/app/.data/go-nomad-adv.sqlite

RUN apk add --no-cache nodejs \
    && addgroup -S nodejs \
    && adduser -S nextjs -G nodejs \
    && mkdir -p /app/.data \
    && chown -R nextjs:nodejs /app/.data

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 6003
VOLUME ["/app/.data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:6003/api/market-vote/snapshot >/dev/null || exit 1

CMD ["node", "server.js"]