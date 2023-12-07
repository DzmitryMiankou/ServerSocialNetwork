import { Controller, Get, HttpCode, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';

@Controller(`app`)
export class AppController {
  constructor(private appService: AppService) {}

  @Get(`test`)
  testWord(): string {
    return this.appService.getHello();
  }

  @Get(`cats`)
  @HttpCode(200)
  cats(@Req() request: Request): string {
    console.log(request);
    console.log(process.env.PASSWORD_DB);
    return 'tgt';
  }
}
