import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginEntity } from './entities/login.entity/login.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/dbase/entities/user.entity/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

interface LoginType {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  access_token: string;
}

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(LoginEntity)
    private readonly loginRepository: Repository<LoginEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepositorty: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<LoginType | { code: number; message: string }> {
    try {
      const user = await this.userRepositorty.findOneBy({ email: email });
      if (user === null) return { code: 401, message: 'Not user' };
      if (!user?.isActive) return { code: 401, message: 'Not active email' };
      const isMatch = await bcrypt.compare(password, user?.password);
      if (!isMatch) return { code: 401, message: 'Not password' };

      const payload = { sub: user?.id, username: user?.firstName };

      await this.loginRepository
        .createQueryBuilder()
        .update(`login_entity`)
        .set({
          refreshToken: await this.jwtService.signAsync(payload, {
            expiresIn: '30d',
          }),
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
      };
    } catch (error) {
      return { code: 401, message: error.sqlMessage };
    }
  }
}
