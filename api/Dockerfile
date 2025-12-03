# Production-ready image for NestJS API
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies and build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built sources
COPY --from=builder /app/dist ./dist

ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/main.js"]
