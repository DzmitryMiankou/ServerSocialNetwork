import { Body, Controller, Get } from '@nestjs/common';
import { DbaseService } from './dbase.service';
import { UserDataType } from './dbase.interface';

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
}
