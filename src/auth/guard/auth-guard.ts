import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { SetMetadata } from '@nestjs/common';
import { jwtConstants } from "../constants";

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,

  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if have a public decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // extract token from header and valid it
    var request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      await this.jwtService.verifyAsync(token, { secret: jwtConstants.secret });
      return true;
    } catch (TokenExpiredError) {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
