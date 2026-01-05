FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=512"

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 5173

CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]