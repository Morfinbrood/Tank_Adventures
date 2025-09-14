import { Body, Controller, Post } from '@nestjs/common';
import { cfg } from '../config.js';

async function proxyJson<T>(url:string, method:string, body?:any): Promise<T>{
  const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: body? JSON.stringify(body): undefined });
  if(!res.ok) throw new Error(await res.text());
  return res.json() as any;
}

@Controller('api/auth')
export class AuthController {
  @Post('register')
  register(@Body() dto: any) { return proxyJson(`${cfg.authBase}/auth/register`, 'POST', dto); }
  @Post('login')
  login(@Body() dto: any) { return proxyJson(`${cfg.authBase}/auth/login`, 'POST', dto); }
}
