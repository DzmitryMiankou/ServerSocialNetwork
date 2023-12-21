import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private JWT: JwtService,
    private readonly configService: ConfigService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const req = context.switchToHttp().getRequest();
      const access_token = req.headers.authorization.replace(
        'Bearer',
        '',
      ) as string;

      const refresh_token = req.cookies.refresh_token as string;

      if (!refresh_token && !access_token) throw new UnauthorizedException();

      req.user = this.JWT.verify(access_token, {
        secret: this.configService.get<string>(`SECRET_ACCESS_KEY`),
      });

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
