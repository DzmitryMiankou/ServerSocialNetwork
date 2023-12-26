import {
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ContactsService } from './contacts.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller('app')
export class ContactsController {
  constructor(private readonly contactServise: ContactsService) {}

  @Post(`new_contact`)
  async setNewContact(@Req() request: Request, @Res() response: Response) {
    const user = request.headers.cookie;
    const contactId: number = request.body?.id;
    const contact = await this.contactServise.setContact(user, contactId);
    if ('code' in contact) return response.status(400).json(contact);
    return response.status(201).json('ok_set');
  }

  @UseGuards(AuthGuard)
  @Get(`contacts`)
  async allContacts(@Req() request: Request, @Res() response: Response) {
    const user = request.headers.authorization.replace('Bearer=', '');
    const contacts = await this.contactServise.allContacts(user);
    if (Array.isArray(contacts)) return response.status(201).json(contacts);
    return response.status(400).json(contacts);
  }

  @Delete(`del_contact`)
  async delContacts(@Req() request: Request, @Res() response: Response) {
    const del = await this.contactServise.delContacts(request.body?.id);
    if (typeof del === 'string') return response.status(200).json(del);
    return response.status(201).json(del);
  }
}
