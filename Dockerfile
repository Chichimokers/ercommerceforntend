FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json pnpm-lock.yaml .npmrc* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["pnpm", "start"]
