import { Module } from '@nestjs/common';
import { Gateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Messages } from './entity/messages.entity';
import { User } from 'src/authentication/authentication.entity';
import { RoomService } from './services/room/room.service';
import { Room } from './entity/room.entity';
import { MessagesService } from './services/messages/messages.service';
import { DialoguesService } from './services/dialogues/dialogues.service';
import { ConnectedService } from './services/connected/connected.service';
import { JoinedRoomService } from './services/joined-room/joined-room.service';
import { JoinedRoom } from './entity/joined-room.entity';

@Module({
  imports: [
    JwtModule.registerAsync({ ...config }),
    TypeOrmModule.forFeature([Messages, User, Room, JoinedRoom]),
  ],
  providers: [
    Gateway,
    RoomService,
    MessagesService,
    DialoguesService,
    ConnectedService,
    JoinedRoomService,
  ],
})
export class GatewayModule {}
