import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/authentication/authentication.entity';
import { Repository } from 'typeorm';
import { UserDataEmail } from 'src/interfaces/user-interface/user-interface';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  constructor(
    private JWT: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepositorty: Repository<User>,
    @Inject(`CACHE_MANAGER`) private cacheManager: Cache,
  ) {}
  async userData(token: string): Promise<UserDataEmail[]> {
    try {
      const verify = this.JWT.verify(token, {
        secret: this.configService.get<string>(`SECRET_ACCESS_KEY`),
      });

      await this.cacheManager.set(`test`, { id: verify, name: 'dmi' }, 3600000);

      const value: UserDataEmail[] = await this.cacheManager.get(
        `user_id_${verify?.sub}`,
      );

      if (value) return value;

      if (!value) {
        const user = await this.userRepositorty.find({
          select: { id: true, firstName: true, lastName: true, email: true },
          where: [{ id: verify?.sub }],
        });
        await this.cacheManager.set(`user_id_${verify?.sub}`, user, 3600000);
        return [{ ...user[0] }];
      }
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
