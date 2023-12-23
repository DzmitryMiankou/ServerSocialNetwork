import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config/config';

@Module({
  imports: [JwtModule.registerAsync({ ...config })],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
