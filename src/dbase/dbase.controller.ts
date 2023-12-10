import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DbaseService } from './dbase.service';
import { UserDataType } from './dbase.interface';
import { Response } from 'express';
import { UserEntity } from './entities/user.entity/user.entity';

@Controller('app')
export class DbaseController {
  constructor(private dbService: DbaseService) {}

  @Get(`users`)
  getUsers(): Promise<UserDataType[]> {
    return this.dbService.findAll();
  }

  @Post(`reg_user`)
  @UsePipes(new ValidationPipe({ transform: true }))
  async setUserData(@Body() data: UserEntity, @Res() response: Response) {
    const answerDB = await this.dbService.createUser(data);
    return response.status(answerDB === 'OK_SAVE' ? 200 : 400).json(answerDB);
  }

  @Get(`user/:activate`)
  async activate(@Param('activate') id: string, @Res() response: Response) {
    const answerDB = await this.dbService.findOneByActiveId(
      id.replace(`:`, ''),
    );
    if (answerDB === null)
      return response.status(200).json([{ str: 'not user' }]);
    await this.dbService.activeUser(answerDB.id);
    return response.status(200).json(answerDB);
  }
}
