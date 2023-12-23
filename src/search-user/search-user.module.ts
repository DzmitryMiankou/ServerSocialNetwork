import { Module } from '@nestjs/common';
import { SearchUserController } from './search-user.controller';
import { SearchUserService } from './search-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginEntity } from 'src/login/entities/login.entity/login.entity';
import { User } from 'src/authentication/authentication.entity';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoginEntity, User]),
    JwtModule.registerAsync({ ...config }),
  ],
  controllers: [SearchUserController],
  providers: [SearchUserService],
})
export class SearchUserModule {}
