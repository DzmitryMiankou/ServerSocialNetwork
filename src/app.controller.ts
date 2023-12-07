import { Controller, Get, HttpCode, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get(`test`)
  @HttpCode(200)
  getHello(): string {
    return this.appService.getHello();
  }

  @Get(`cats`)
  @HttpCode(200)
  cats(@Req() request: Request): string {
    console.log(request);
    return 'tgt';
  }
}
