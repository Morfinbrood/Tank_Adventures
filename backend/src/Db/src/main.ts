import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { DbModule } from './db.module.js';
import helmet from 'helmet';
import morgan from 'morgan';

@Module({ imports: [DbModule] })
class App {}

async function bootstrap(){
  const app = await NestFactory.create(App, { logger: ['log','error','warn'] });
  app.use(helmet()); app.use(morgan('dev'));
  await app.listen(Number(process.env.PORT || 4010));
  console.log(`[db] listening on ${process.env.PORT || 4010}`);
}
bootstrap();
