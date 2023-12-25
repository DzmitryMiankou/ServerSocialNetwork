import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Login } from './entities/login.entity/login.entity';
import { Repository } from 'typeorm';
import { User } from 'src/authentication/authentication.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserPprivateData } from 'src/interfaces/user-interface/user-interface';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(Login)
    private readonly loginRepository: Repository<Login>,
    @InjectRepository(User)
    private readonly userRepositorty: Repository<User>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(`CACHE_MANAGER`) private cacheManager: Cache,
  ) {}

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<UserPprivateData | { code: number; message: string }> {
    try {
      const user = await this.userRepositorty.findOneBy({ email: email });
      if (user === null) throw new BadRequestException('Not user');
      if (!user?.isActive) throw new BadRequestException('Not active email');
      const isMatch = await bcrypt.compare(password, user?.password);
      if (!isMatch) throw new BadRequestException('Not password');

      const payload = { sub: user?.id, username: user?.firstName };

      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '30d',
        secret: this.configService.get<string>(`SECRET_REFRESH_KEY`),
      });

      await this.loginRepository
        .createQueryBuilder()
        .update(`login`)
        .set({
          refreshToken: refreshToken,
        })
        .where('userId = :userId', { userId: user?.id })
        .execute();

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '10m',
        secret: this.configService.get<string>(`SECRET_ACCESS_KEY`),
      });

      const dataUser = { ...user };

      for (const el in dataUser)
        if (el === 'isActive' || el === 'activeId' || el === 'password')
          delete dataUser[el];

      await this.cacheManager.set(
        `user_id_${user?.id}`,
        [{ ...dataUser }],
        3600000,
      );

      return {
        ...dataUser,
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      return { code: 400, message: error.sqlMessage };
    }
  }

  async updateRefreshToken(refresh_token: string): Promise<string> {
    try {
      const user = this.jwtService.verify(refresh_token, {
        secret: this.configService.get<string>(`SECRET_REFRESH_KEY`),
      });

      const refresh_client: number = user?.sub;

      const refresh_DB = await this.loginRepository.find({
        select: { userId: true },
        where: [{ refreshToken: refresh_token }],
      });

      if (!refresh_DB) throw new UnauthorizedException();
      if (refresh_DB[0].userId !== refresh_client)
        throw new UnauthorizedException();

      const accessToken = await this.jwtService.signAsync(
        { sub: user?.sub, username: user?.username },
        {
          expiresIn: '10m',
          secret: this.configService.get<string>(`SECRET_ACCESS_KEY`),
        },
      );

      return accessToken;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async logOutUser(refresh_token: string): Promise<void> {
    const user = this.jwtService.verify(refresh_token, {
      secret: this.configService.get<string>(`SECRET_REFRESH_KEY`),
    });
    await this.cacheManager.del(`user_id_${user?.sub}`);
    await this.loginRepository
      .createQueryBuilder()
      .update(`login`)
      .set({
        refreshToken: 'logOut',
      })
      .where('userId = :userId', { userId: user?.sub })
      .execute();
  }
}
