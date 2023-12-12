import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginEntity } from './entities/login.entity/login.entity';
import { UserEntity } from 'src/dbase/entities/user.entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoginEntity, UserEntity])],
  providers: [LoginService],
  controllers: [LoginController],
})
export class LoginModule {}
