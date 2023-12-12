import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginEntity } from './entities/login.entity/login.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/dbase/entities/user.entity/user.entity';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(LoginEntity)
    private readonly loginRepositort: Repository<LoginEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepositort: Repository<UserEntity>,
  ) {}

  async login(email: string) {
    const user = await this.userRepositort.findOneBy({ email: email });
    if (user === null) return { code: 401, message: 'Not user' };
    await this.loginRepositort.save({
      refreshToken: 'sdgbsd',
    });
    return user;
  }
}
