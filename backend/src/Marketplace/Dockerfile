FROM node:22-alpine
WORKDIR /app/src/Marketplace

COPY src/Marketplace/package.json src/Marketplace/tsconfig.json ./
COPY packages /app/packages

RUN npm i -g pnpm@9 && pnpm i --frozen-lockfile || pnpm i

COPY src/Marketplace/src ./src
RUN pnpm build

EXPOSE 4003
CMD ["node","dist/main.js"]
