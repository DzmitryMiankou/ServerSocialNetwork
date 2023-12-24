import { Controller, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { ContactsService } from './contacts.service';

@Controller('app')
export class ContactsController {
  constructor(private readonly contactServise: ContactsService) {}

  @Post(`new_contact`)
  setNewContact(@Req() request: Request, @Res() response: Response) {
    const user = request.headers.cookie;
    const contactId: number = request.body?.id;
    this.contactServise.setContact(user, contactId);
    return response.status(201).json('ok');
  }
}
