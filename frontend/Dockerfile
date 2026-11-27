FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build -- --preset node-server

FROM node:22-bookworm-slim
WORKDIR /app
COPY --from=build /app/.output ./.output
CMD ["node", ".output/server/index.mjs"]
