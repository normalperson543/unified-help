# This part was made with Claude Code. I do not want to dockerize this myself.


# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# base — Node + pnpm (version pinned by "packageManager" in package.json)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# ---------------------------------------------------------------------------
# deps — install node_modules from the lockfile only, so this layer is cached
#        until a dependency actually changes
# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# builder — prisma generate + next build (output: "standalone")
# ---------------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The app reads env at request time (every route is dynamic via headers()), but
# module-level initialisation still runs during the build, so give the build
# throwaway values. Scoped to this RUN so nothing lands in an image layer.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    BETTER_AUTH_SECRET="build-time-placeholder" \
    pnpm build

# ---------------------------------------------------------------------------
# migrator — prisma CLI + migrations, for `prisma migrate deploy` in CI/compose
# ---------------------------------------------------------------------------
FROM builder AS migrator
CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]

# ---------------------------------------------------------------------------
# runner — minimal runtime image, standalone server only
# ---------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -S -g 1001 nodejs \
 && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder /app/public ./public
# server.js + the traced subset of node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# writable cache dir for ISR / fetch caching
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
