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
COPY src/core ./src/core

# Set production environment
ENV NODE_ENV=production

# Expose port (Railway sets PORT automatically)
EXPOSE 3002

# Run the server
CMD ["bun", "run", "src/server/index.ts"]
