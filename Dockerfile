# MIXCRAFT Backend - Bun Runtime
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Build stage (copy source)
FROM base AS runner
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source files needed for the server
COPY package.json ./
COPY src/server ./src/server
COPY src/core/types.ts ./src/core/types.ts
COPY src/core/sound-comparison.ts ./src/core/sound-comparison.ts

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

# Run the server
CMD ["bun", "run", "src/server/index.ts"]
