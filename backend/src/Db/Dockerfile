FROM node:22-alpine
WORKDIR /app/src/Db

COPY src/Db/package.json src/Db/tsconfig.json ./
COPY packages /app/packages

RUN npm i -g pnpm@9 && pnpm i --frozen-lockfile || pnpm i

COPY src/Db/src ./src
RUN pnpm build

EXPOSE 4010
CMD ["node","dist/main.js"]
