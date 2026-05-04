# =============================================================================
# Ventures 92 — Frontend Dockerfile (Development)
# =============================================================================
# This image is used exclusively for local development.
# A separate multi-stage production Dockerfile will be added later.
# =============================================================================

FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Install dependencies first — separate layer so this is cached
# unless package.json / package-lock.json actually change
COPY package*.json ./

RUN npm install

# Copy the rest of the source (will be overridden by the bind mount in dev,
# but kept here so the image is self-contained for CI)
COPY . .

EXPOSE 3000

# `npm run dev` starts Next.js in development mode with Fast Refresh
CMD ["npm", "run", "dev"]
