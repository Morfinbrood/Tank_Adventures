FROM node:22-alpine
WORKDIR /app/src/Auth

# пакеты сервиса
COPY src/Auth/package.json src/Auth/tsconfig.json ./
# общие лок.пакеты (file:../../packages/*)
COPY packages /app/packages

RUN npm i -g pnpm@9 && pnpm i --frozen-lockfile || pnpm i

# исходники
COPY src/Auth/src ./src
RUN pnpm build

EXPOSE 4001
CMD ["node","dist/main.js"]
