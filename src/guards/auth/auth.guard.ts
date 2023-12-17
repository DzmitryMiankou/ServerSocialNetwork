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
      console.log(req.cookies);
      const token = req.cookies.refresh_token;

      if (!token) throw new UnauthorizedException();
      req.user = this.JWT.verify(token, {
        secret: this.configService.get<string>(`SECRET_REFRESH_KEY`),
      });

      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
  }
}
