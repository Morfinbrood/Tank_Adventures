import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller.js';
import { LobbyController } from './controllers/lobby.controller.js';
import { MarketController } from './controllers/market.controller.js';
import { HealthController } from './controllers/health.controller.js';
import { DbController } from './controllers/db.controller.js';
@Module({ controllers: [AuthController, LobbyController, MarketController, HealthController, DbController] })
export class AppModule {}
