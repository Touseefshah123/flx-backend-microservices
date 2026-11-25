# syntax=docker/dockerfile:1
#
# Build from the REPOSITORY ROOT, not this folder:
#   docker build -f services/api-gateway/Dockerfile -t flx/api-gateway .
#
# This is an npm-workspaces monorepo and the only package-lock.json lives at the
# root, so `npm ci` cannot run from inside the service directory.

FROM node:22-alpine AS build
WORKDIR /app

# Manifests first, so a source-only change does not bust the install layer.
COPY package.json package-lock.json tsconfig.base.json ./
COPY services/api-gateway/package.json services/api-gateway/
RUN npm ci --workspace=api-gateway --include-workspace-root

COPY services/api-gateway services/api-gateway
RUN npm run build --workspace=api-gateway

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV TZ=UTC

COPY package.json package-lock.json ./
COPY services/api-gateway/package.json services/api-gateway/
RUN npm ci --omit=dev --workspace=api-gateway --include-workspace-root \
    && npm cache clean --force

# Workspaces hoist to /app/node_modules, so dist resolves its deps from there.
COPY --from=build /app/services/api-gateway/dist ./services/api-gateway/dist

# Do not run as root.
USER node

EXPOSE 8000
CMD ["node", "services/api-gateway/dist/main"]