import { Module } from '@nestjs/common';
import { Gateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Messages } from './entity/messages.entity';
import { User } from 'src/authentication/authentication.entity';
import { RoomService } from './services/room/room.service';

@Module({
  imports: [
    JwtModule.registerAsync({ ...config }),
    TypeOrmModule.forFeature([Messages, User]),
  ],
  providers: [Gateway, RoomService],
})
export class GatewayModule {}
