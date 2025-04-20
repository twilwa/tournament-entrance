# Stage 1: build application
FROM node:20 AS builder
WORKDIR /app

# Install all dependencies (including dev) and build client and server
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 2: production image
FROM node:20 AS production
WORKDIR /app

# Only install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --only=production
ENV NODE_ENV=production

# Copy build artifacts from builder
COPY --from=builder /app/dist ./dist

# Expose the port the server listens on
EXPOSE 5000

# Start the server in production mode
CMD ["npm", "start"] 