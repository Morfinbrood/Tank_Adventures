import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { bearerFromHeaders, verifyJwt } from '../../packages/authz/src/index.js';
import { cfg } from './config.js';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: any = context.switchToHttp().getRequest();
    const auth = bearerFromHeaders(req.headers);
    if(!auth) return false;
    try { await verifyJwt(auth, { jwksUrl: cfg.jwksUrl, issuer: cfg.issuer, audience: cfg.audience }); return true; }
    catch { return false; }
  }
}
