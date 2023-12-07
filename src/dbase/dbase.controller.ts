import { Controller, Get } from '@nestjs/common';
import { DbaseService } from './dbase.service';
import { ReturnDbaseType } from './dbase.interface';

@Controller('app')
export class DbaseController {
  constructor(private dbService: DbaseService) {}

  @Get(`test`)
  getHello(): ReturnDbaseType {
    return this.dbService.test();
  }
}
