import { Controller, Get, HttpCode, Req } from '@nestjs/common';
import { Request } from 'express';
import { CatsService } from './cats/cats.service';
import { Cat } from './interfaces/cat/cat.interface';
import { AppService } from './app.service';

@Controller(`app`)
export class AppController {
  constructor(
    private catsService: CatsService,
    private appService: AppService,
  ) {}

  @Get(`test`)
  testWord(): string {
    return this.appService.getHello();
  }

  @Get(`cats`)
  @HttpCode(200)
  cats(@Req() request: Request): Cat[] {
    console.log(process.env.PASSWORD_DB);
    this.catsService.create({ name: 'dz', age: 29, breed: `sfv -` });
    return Object.keys(request.body).length !== 0
      ? request.body
      : this.catsService.findAll();
  }
}
