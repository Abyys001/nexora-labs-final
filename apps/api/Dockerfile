# syntax=docker/dockerfile:1.7
# Build context is the repo root (npm workspaces monorepo, one root lockfile).

FROM node:24-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/pricing/package.json packages/pricing/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace=@cybercina/pricing --workspace=api --include-workspace-root

FROM deps AS build
COPY packages/pricing packages/pricing
COPY apps/api apps/api
RUN npm run build -w @cybercina/pricing \
  && npm run build -w api \
  && npm prune --omit=dev --workspace=@cybercina/pricing --workspace=api --include-workspace-root

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/pricing/dist ./packages/pricing/dist
COPY --from=build /app/packages/pricing/package.json ./packages/pricing/package.json
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/drizzle ./apps/api/drizzle
COPY --from=build /app/apps/api/assets ./apps/api/assets

WORKDIR /app/apps/api
USER node
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider "http://localhost:${PORT:-4000}/api/health" || exit 1

CMD ["node", "dist/main.js"]
