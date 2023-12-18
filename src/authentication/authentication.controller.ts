import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RenderDataeActivateEmail } from './dbase.interface';
import { Response } from 'express';
import { User } from './authentication.entity';
import { ConfigService } from '@nestjs/config';

import { AuthenticationService } from './authentication.service';

@Controller('app')
export class AuthenticationController {
  constructor(
    private dbService: AuthenticationService,
    private readonly configService: ConfigService,
  ) {}

  @Post(`reg_user`)
  @UsePipes(new ValidationPipe({ transform: true }))
  async setUserData(@Body() data: User, @Res() response: Response) {
    const answerDB = await this.dbService.createUser(data);
    return response.status(answerDB === 'OK_SAVE' ? 200 : 400).json(answerDB);
  }

  @Get(`user/:activate`)
  @Render('emailGoodPage')
  async activate(
    @Param('activate') id: string,
  ): Promise<RenderDataeActivateEmail<string>> {
    const answerDB = await this.dbService.findOneByActiveId(
      id.replace(`:`, ''),
    );

    if (answerDB === null)
      return {
        body: 'User is not found',
        url: this.configService.get<string>(`CORS_ADRES`),
        a_text: 'click to registration account',
        style:
          this.configService.get<string>(`SERVER_ADRES`) +
          'dist/public/css/style.css',
      };
    await this.dbService.activeUser(answerDB.id);
    return {
      body: 'Thank you!',
      url: this.configService.get<string>(`CORS_ADRES`),
      a_text: 'click to login account',
      style:
        this.configService.get<string>(`SERVER_ADRES`) +
        '/dist/public/css/style.css',
    };
  }
}
