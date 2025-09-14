import { Module } from '@nestjs/common';
import { DbService } from './db.service.js';
import { DbController } from './db.controller.js';
@Module({ providers: [DbService], controllers: [DbController] })
export class DbModule {}
