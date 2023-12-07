import { Module } from '@nestjs/common';
import { DbaseController } from './dbase.controller';
import { DbaseService } from './dbase.service';

@Module({
  controllers: [DbaseController],
  providers: [DbaseService],
})
export class DbaseModule {}
