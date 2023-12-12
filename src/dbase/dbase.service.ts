import { Injectable } from '@nestjs/common';
import { UserDataType } from './dbase.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity/user.entity';
import { Repository } from 'typeorm';
import { FormValue } from './dbase.interface';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DbaseService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly todoRepositort: Repository<UserEntity>,
    private readonly configService: ConfigService,
    private readonly mailServise: MailerService,
  ) {}

  async createUser(user: FormValue<string>): Promise<string> {
    try {
      const hash = await bcrypt.hash(
        user.password,
        +this.configService.get(`SALT`),
      );

      const activeURL = uuidv4();

      await this.todoRepositort.save({
        ...user,
        password: hash,
        activeId: activeURL,
      });

      await this.mailServise.sendMail({
        to: user.email,
        subject: 'Welcome to my website',
        template: './welcome',
        context: {
          name: user.firstName,
          url: this.configService.get(`ISACTIVE_HREF`) + activeURL,
        },
      });

      return 'OK_SAVE';
    } catch (error) {
      console.log(error);
      return `${error.code}`;
    }
  }

  findOneByActiveId(id: string): Promise<UserDataType> {
    return this.todoRepositort.findOneBy({ activeId: id });
  }

  async activeUser(id: number) {
    return await this.todoRepositort
      .createQueryBuilder()
      .update(`user_entity`)
      .set({ isActive: true })
      .where('id = :id', { id: id })
      .execute();
  }

  findAll(): Promise<UserDataType[]> {
    return this.todoRepositort.find();
  }
}
