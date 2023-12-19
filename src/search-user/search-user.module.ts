import { Module } from '@nestjs/common';
import { SearchUserController } from './search-user.controller';
import { SearchUserService } from './search-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginEntity } from 'src/login/entities/login.entity/login.entity';
import { User } from 'src/authentication/authentication.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoginEntity, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        global: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SearchUserController],
  providers: [SearchUserService],
})
export class SearchUserModule {}
