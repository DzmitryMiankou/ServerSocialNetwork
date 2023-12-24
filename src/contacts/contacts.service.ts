import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contacts } from './contacts.entity/contacts.entity';

@Injectable()
export class ContactsService {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Contacts)
    private readonly todoRepositort: Repository<Contacts>,
  ) {}

  async setContact(user: string, contactId: number) {
    try {
      const token = user.replace('refresh_token=', '') as string;
      const userId = this.jwtService.verify(token, {
        secret: this.configService.get<string>(`SECRET_REFRESH_KEY`),
      })?.sub;
      if (!userId) throw new UnauthorizedException();
      await this.todoRepositort.save({
        contactId: contactId,
        user: userId,
      });
    } catch (error) {
      return { code: 400, message: error.sqlMessage };
    }
  }
}
