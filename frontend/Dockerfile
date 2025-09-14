FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN npm i -g pnpm@9 && pnpm i --frozen-lockfile || pnpm i
COPY . .
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
COPY --from=deps /app .
EXPOSE 3000
CMD ["pnpm","start"]
