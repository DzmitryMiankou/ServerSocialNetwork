import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity/user.entity';
import { Repository } from 'typeorm';
import { FormValue } from './dbase.interface';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { LoginEntity } from 'src/login/entities/login.entity/login.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class DbaseService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly todoRepositort: Repository<UserEntity>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailServise: MailerService,
  ) {}

  async createUser(user: FormValue<string>): Promise<string> {
    try {
      const hash = await bcrypt.hash(
        user?.password,
        +this.configService.get<number>(`SALT`),
      );

      const payload = { username: user?.firstName };
      const activeURL = uuidv4();

      const newUser = new UserEntity();

      newUser.activeId = activeURL;
      newUser.password = hash;
      newUser.firstName = user?.firstName;
      newUser.lastName = user?.lastName;
      newUser.email = user?.email;

      await this.todoRepositort.manager.save(newUser);

      const login = new LoginEntity();
      login.refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '30d',
      });
      login.userId = newUser.id;

      await this.todoRepositort.manager.save(login);

      await this.mailServise.sendMail({
        to: user?.email,
        subject: 'Welcome to my website',
        template: './welcome',
        context: {
          name: user?.firstName,
          url: this.configService.get<string>(`ISACTIVE_HREF`) + activeURL,
        },
      });

      return 'OK_SAVE';
    } catch (error) {
      console.log(error);
      return `${error.code}`;
    }
  }

  findOneByActiveId(id: string): Promise<{ id: number }> {
    return this.todoRepositort.findOne({
      where: { activeId: id },
      select: ['id'],
    });
  }

  async activeUser(id: number) {
    return await this.todoRepositort
      .createQueryBuilder()
      .update(`user_entity`)
      .set({ isActive: true })
      .where('id = :id', { id: id })
      .execute();
  }
}
