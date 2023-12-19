import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginEntity } from './entities/login.entity/login.entity';
import { Like, Repository } from 'typeorm';
import { User } from 'src/authentication/authentication.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  UserData,
  UserPprivateData,
} from 'src/interfaces/user-interface/user-interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(LoginEntity)
    private readonly loginRepository: Repository<LoginEntity>,
    @InjectRepository(User)
    private readonly userRepositorty: Repository<User>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<UserPprivateData> {
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
        .update(`login_entity`)
        .set({
          refreshToken: refreshToken,
        })
        .where('userId = :userId', { userId: user?.id })
        .execute();

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '10m',
        secret: this.configService.get<string>(`SECRET_ACCESS_KEY`),
      });

      return {
        id: user?.id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      throw new BadRequestException(error.sqlMessage);
    }
  }

  async searchUsers(str: string): Promise<UserData[]> {
    try {
      const loadedPosts = await this.userRepositorty.find({
        select: [`id`, `firstName`, `lastName`],
        where: [
          { isActive: true, firstName: Like(`%${str}%`) },
          { isActive: true, lastName: Like(`%${str}%`) },
        ],
      });
      return loadedPosts;
    } catch (error) {
      throw new BadRequestException(error.sqlMessage);
    }
  }

  async updateRefreshToken(token: string): Promise<string> {
    try {
      const user = this.jwtService.verify(token, {
        secret: this.configService.get<string>(`SECRET_REFRESH_KEY`),
      });

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
}
