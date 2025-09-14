FROM node:22-alpine
WORKDIR /app/src/Chat

COPY src/Chat/package.json src/Chat/tsconfig.json ./
COPY packages /app/packages

RUN npm i -g pnpm@9 && pnpm i --frozen-lockfile || pnpm i

COPY src/Chat/src ./src
RUN pnpm build

EXPOSE 4004
CMD ["node","dist/main.js"]
