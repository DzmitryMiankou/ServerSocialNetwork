import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginEntity } from 'src/login/entities/login.entity/login.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private JWT: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(LoginEntity)
    private readonly loginRepository: Repository<LoginEntity>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest();
      const refresh_token = req.cookies.refresh_token as string;
      const access_token = req.headers.authorization.replace(
        'Bearer',
        '',
      ) as string;
      if (!refresh_token && !access_token) throw new UnauthorizedException();

      const refresh_client: number = this.JWT.verify(refresh_token, {
        secret: this.configService.get<string>(`SECRET_REFRESH_KEY`),
      })?.sub;

      const refresh_DB = await this.loginRepository.find({
        select: [`userId`],
        where: [{ refreshToken: refresh_token }],
      });

      if (!refresh_DB) throw new UnauthorizedException();
      if (refresh_DB[0].userId !== refresh_client)
        throw new UnauthorizedException();
      if (!access_token && !refresh_token) throw new UnauthorizedException();

      req.user = this.JWT.verify(access_token, {
        secret: this.configService.get<string>(`SECRET_ACCESS_KEY`),
      });

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
