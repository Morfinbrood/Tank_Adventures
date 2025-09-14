FROM node:22-alpine
WORKDIR /app/src/Lobby

COPY src/Lobby/package.json src/Lobby/tsconfig.json ./
COPY packages /app/packages

RUN npm i -g pnpm@9 && pnpm i --frozen-lockfile || pnpm i

COPY src/Lobby/src ./src
RUN pnpm build

EXPOSE 4002
CMD ["node","dist/main.js"]
