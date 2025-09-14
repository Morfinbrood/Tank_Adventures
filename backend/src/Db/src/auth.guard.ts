import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { bearerFromHeaders, verifyJwt } from '../../packages/authz/src/index.js';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: any = ctx.switchToHttp().getRequest();
    const token = bearerFromHeaders(req.headers);
    if(!token) return false;
    try{
      const jwksUrl = process.env.AUTH_JWKS_URL || 'http://auth:4001/.well-known/jwks.json';
      const issuer = process.env.JWT_ISSUER || 'auth';
      const audience = process.env.JWT_AUDIENCE || 'game';
      await verifyJwt(token, { jwksUrl, issuer, audience });
      return true;
    } catch { return false; }
  }
}
