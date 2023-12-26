import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contacts } from './contacts.entity/contacts.entity';

interface ContactsType {
  id: number;
  user: number;
  contactId: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

@Injectable()
export class ContactsService {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Contacts)
    private readonly todoRepositort: Repository<Contacts>,
  ) {}

  async setContact(
    user: string,
    contactId: number,
  ): Promise<{ id: number } | { code: number; message: string }> {
    try {
      const token = user.replace('refresh_token=', '') as string;
      const userId = this.jwtService.verify(token, {
        secret: this.configService.get<string>(`SECRET_REFRESH_KEY`),
      })?.sub;
      if (!userId) throw new UnauthorizedException();
      await this.todoRepositort.save({
        contactId: contactId as any,
        user: userId,
      });
      return { id: userId };
    } catch (error) {
      return {
        code: error.errno,
        message: `${error.sqlMessage}. ContactId_(${contactId})`,
      };
    }
  }

  async allContacts(
    token: string,
  ): Promise<ContactsType[] | { code: number; message: string }> {
    try {
      const userId = this.jwtService.verify(token, {
        secret: this.configService.get<string>(`SECRET_ACCESS_KEY`),
      })?.sub;

      if (!userId) throw new UnauthorizedException();
      const contacts: ContactsType[] = await this.todoRepositort.find({
        where: { user: userId },
        select: {
          contactId: { id: true, firstName: true, lastName: true, email: true },
        },
        relations: {
          contactId: true,
        },
      });
      return [...contacts];
    } catch (error) {
      return { code: 400, message: error.sqlMessage };
    }
  }

  async delContacts(
    id: number,
  ): Promise<'ok' | { code: number; message: string }> {
    try {
      await this.todoRepositort
        .createQueryBuilder(`contacts`)
        .delete()
        .from(Contacts)
        .where('id = :id', { id: id })
        .execute();
      return 'ok';
    } catch (error) {
      return { code: 400, message: error.sqlMessage };
    }
  }
}
