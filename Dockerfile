FROM oven/bun:1 AS base
WORKDIR /app

# ── Install dependencies ──────────────────────────────────────────────────────
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ── Build ─────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept NEXT_PUBLIC vars at build time so Next.js can inline them
ARG NEXT_PUBLIC_CLIENT_KEY=""
ARG NEXT_PUBLIC_CLIENT_URL="https://modular-sdk.circle.com/v1/rpc/w3s/buidl"
ENV NEXT_PUBLIC_CLIENT_KEY=$NEXT_PUBLIC_CLIENT_KEY
ENV NEXT_PUBLIC_CLIENT_URL=$NEXT_PUBLIC_CLIENT_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# ── Production runner ─────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# public/ may be empty but must exist for Next.js standalone
COPY --from=builder /app/public* ./public/

EXPOSE 3000
CMD ["bun", "server.js"]
