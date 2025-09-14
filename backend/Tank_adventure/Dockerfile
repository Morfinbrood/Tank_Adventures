FROM node:22-alpine
WORKDIR /app/Tank_adventure

COPY Tank_adventure/package.json Tank_adventure/tsconfig.json ./
COPY packages /app/packages

RUN npm i -g pnpm@9 && pnpm i --frozen-lockfile || pnpm i

COPY Tank_adventure/src ./src
RUN pnpm build

EXPOSE 4005
CMD ["node","dist/main.js"]
