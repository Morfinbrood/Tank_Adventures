# Tank Adventure — Microservices Monorepo (subrepos-ready)

Monorepo для независимых микросервисов (каждый разворачивается отдельно) с общим локальным раннером на Docker Compose и IaC (CDK). Локально фронт ходит через общий **Gateway** (`http://localhost:4100/api`).

---

## Table of Contents
1. [Folders](#folders)  
2. [Prerequisites](#prerequisites)  
3. [One-time Setup (Workspace)](#one-time-setup-workspace)  
4. [Local Run](#local-run)  
5. [Troubleshooting](#troubleshooting)  
6. [AWS (CDK)](#aws-cdk)  
7. [Notes](#notes)  
8. [Warning](#warning)

---

## Folders

- `frontend/` — Next.js клиент (без прямого доступа к БД)
- `backend/` — бэкенд-микросервисы + общие пакеты
  - `src/Auth`, `src/Lobby`, `src/Marketplace`, `src/Chat` — самостоятельные микросервисы (REST/WS)
  - `src/Gateway` — общий вход (NestJS) для `/api/*` (HTTP/WS-мосты)
  - `src/Db` — глобальный read-only DB-сервис
  - `Tank_adventure/` — игровой сервис (WS + server-authoritative engine)
  - `packages/` — shared libs: `core-protocol` (zod схемы), `authz` (JWT/JWKS guard)
  - `_deploy/global` — общий стек (VPC, ALB, ECS on EC2, RDS) c экспортами в SSM
- `scripts/` — локальные и AWS-скрипты

---

## Prerequisites
- **Node.js** ≥ 22 
- **Docker Desktop** с **Docker Compose v2**  
- **Git**

> **VS Code**: включите *Use Workspace TypeScript* (см. [Troubleshooting](#troubleshooting)).

---

## One-time Setup (Workspace)
Используем **Corepack + pnpm workspaces**, чтобы установка зависимостей всех пакетов делалась **одной командой** и строго по их `package.json`.

```bash
# проверить pnpm той версии (исполняется из npx-кэша, НЕ глобально)
npx --yes pnpm@9.15.9 -v

# установка зависимостей для всего воркспейса (аналог `pnpm -w install`)
npx --yes pnpm@9.15.9 -w install

# (опционально, единоразово) добавить типы адресно по сервисам:
npx --yes pnpm@9.15.9 -r --filter ./backend/src/Auth        add -D @types/node @types/express @types/morgan @types/pg @types/cookie-parser @types/bcryptjs
npx --yes pnpm@9.15.9 -r --filter ./backend/src/Lobby       add -D @types/node @types/express @types/morgan @types/pg
npx --yes pnpm@9.15.9 -r --filter ./backend/src/Marketplace add -D @types/node @types/express @types/morgan @types/pg
npx --yes pnpm@9.15.9 -r --filter ./backend/src/Chat        add -D @types/node @types/express @types/morgan @types/pg @types/ws
npx --yes pnpm@9.15.9 -r --filter ./backend/Tank_adventure  add -D @types/node @types/express @types/morgan @types/ws