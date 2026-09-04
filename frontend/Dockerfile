# Multi-stage build for frontend
# Stage 1 (builder)
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG NEXT_PUBLIC_API_URL
ARG VITE_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2 (runner)
FROM node:18-alpine AS runner
WORKDIR /app

# Install curl for container healthcheck and serve for production static serving
RUN apk add --no-cache curl && npm install -g serve

# Copy built output only
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
