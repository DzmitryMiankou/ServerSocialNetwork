import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginEntity } from './entities/login.entity/login.entity';
import { Like, Repository } from 'typeorm';
import { UserEntity } from 'src/dbase/entities/user.entity/user.entity';
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
    @InjectRepository(UserEntity)
    private readonly userRepositorty: Repository<UserEntity>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
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
      if (user === null) return { code: 401, message: 'Not user' };
      if (!user?.isActive) return { code: 401, message: 'Not active email' };
      const isMatch = await bcrypt.compare(password, user?.password);
      if (!isMatch) return { code: 401, message: 'Not password' };

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

      return {
        id: user?.id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        access_token: await this.jwtService.signAsync(payload, {
          expiresIn: '10m',
        }),
        refresh_token: refreshToken,
      };
    } catch (error) {
      return { code: 401, message: error.sqlMessage };
    }
  }

  async searchUsers(
    str: string,
  ): Promise<UserData[] | { code: number; message: string }> {
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
      return { code: 401, message: error.sqlMessage };
    }
  }

  async updateRefreshToken(token: string) {
    try {
      const user = this.jwtService.verify(token, {
        secret: this.configService.get<string>(`SECRET_REFRESH_KEY`),
      });

      console.log(user);
      /*const loadedPosts = await this.loginRepository.find({
        select: [`refreshToken`],
        where: [{ id: 1 }],
      });*/
      /* await this.loginRepository
        .createQueryBuilder()
        .update(`login_entity`)
        .set({
          refreshToken: await this.jwtService.signAsync(payload, {
            expiresIn: '30d',
          }),
        })
        .where('userId = :userId', { userId: user?.id })
        .execute();*/
    } catch (error) {
      return { code: 401, message: error.sqlMessage };
    }
  }
}
