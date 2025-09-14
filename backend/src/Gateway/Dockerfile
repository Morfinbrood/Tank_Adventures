FROM node:22-alpine
# важно: сохранить относительные пути "file:../*.bus" и "file:../../packages/*"
WORKDIR /app/src/Gateway

# пакеты гейтвея
COPY src/Gateway/package.json src/Gateway/tsconfig.json ./

# шины кладём рядом в /app/src/*.bus (чтобы ../*.bus резолвилось)
COPY src/Db.bus /app/src/Db.bus
COPY src/Lobby.bus /app/src/Lobby.bus
COPY src/Marketplace.bus /app/src/Marketplace.bus
COPY src/Chat.bus /app/src/Chat.bus
COPY src/Auth.bus /app/src/Auth.bus
COPY src/Tank_adventure.bus /app/src/Tank_adventure.bus

# общие пакеты
COPY packages /app/packages

RUN npm i -g pnpm@9 && pnpm i --frozen-lockfile || pnpm i

# исходники
COPY src/Gateway/src ./src
RUN pnpm build

EXPOSE 4100
CMD ["node","dist/main.js"]
