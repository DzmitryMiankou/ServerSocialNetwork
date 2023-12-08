import { Body, Controller, Get, Post, HttpCode, Res } from '@nestjs/common';
import { DbaseService } from './dbase.service';
import { UserDataType } from './dbase.interface';
import { FormValue } from './dbase.interface';
import { Response } from 'express';

@Controller('app')
export class DbaseController {
  constructor(private dbService: DbaseService) {}

  @Get(`users`)
  getUsers(): Promise<UserDataType[]> {
    return this.dbService.findAll();
  }

  @Get(`user_id`)
  getOneById(@Body() id: number): Promise<UserDataType> {
    console.log(id);
    return this.dbService.findOneById(2);
  }

  @Post(`reg_user`)
  @HttpCode(204)
  async setUserData(
    @Body() data: FormValue<string>,
    @Res() response: Response,
  ) {
    const user = await this.dbService.createUser(data);
    return response.json('saving ' + JSON.stringify(user));
  }
}
