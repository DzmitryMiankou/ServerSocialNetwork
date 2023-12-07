import { Module } from '@nestjs/common';
import { DbaseController } from './dbase.controller';
import { DbaseService } from './dbase.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [DbaseController],
  providers: [DbaseService],
})
export class DbaseModule {}
