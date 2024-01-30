import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { Message, DialoguesType } from './interfaces/chat.gateway.interface';
import { User } from 'src/authentication/authentication.entity';
import { RoomService } from './services/room/room.service';
import { RoomI } from './interfaces/room.interfaces';
import { UnauthorizedException } from '@nestjs/common';
import { MessagesService } from './services/messages/messages.service';
import { DialoguesService } from './services/dialogues/dialogues.service';

const enum PathSocket {
  send_mess = `send_message`,
  get_all_mess = `all_messages`,
  dialogue_one = `dialogue_one`,
  dialogues = `dialogues`,
  click = `click`,
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
  },
})
export class Gateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private JWT: JwtService,
    private roomService: RoomService,
    private dialoguesService: DialoguesService,
    private messagesService: MessagesService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepositort: Repository<User>,
  ) {}

  @WebSocketServer()
  io: Server;

  async handleDisconnect(socket: Socket) {
    await this.userRepositort
      .createQueryBuilder()
      .update(`user`)
      .set({
        socketId: 'Disconnect',
      })
      .where('socketId = :socketId', { socketId: socket.id })
      .execute();

    socket.emit('error', new UnauthorizedException());
    socket.disconnect();
  }

  async handleConnection(client: Socket) {
    try {
      const access_token = (client.handshake.auth.Authorization.replace(
        'Bearer=',
        '',
      ) ?? null) as string | null;
      if (!access_token) return this.handleDisconnect(client);

      const verify = await this.JWT.verify(access_token, {
        secret: this.configService.get<string>(`SECRET_ACCESS_KEY`),
      });

      const user = await this.userRepositort.findOne({
        where: { id: verify.sub },
      });

      if (!user) return this.handleDisconnect(client);
      client.data.user = user;

      const rooms = this.roomService.getRoomsForUser(user.id, {
        page: 1,
        limit: 100,
      });

      this.io.to(client.id).emit('rooms', rooms);

      await this.userRepositort
        .createQueryBuilder()
        .update(`user`)
        .set({
          socketId: client.id,
        })
        .where('id = :id', { id: verify.sub })
        .execute();
    } catch (error) {
      this.handleDisconnect(client);
    }
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, room: RoomI) {
    return this.roomService.createRoom(room, socket.data.user);
  }

  @SubscribeMessage(PathSocket.dialogues)
  async dialogues(
    @MessageBody() id: number,
    @ConnectedSocket() socket: Socket,
  ) {
    const response = await this.dialoguesService.getDialogues(id);
    socket.emit(PathSocket.dialogues, response);
  }

  @SubscribeMessage(PathSocket.get_all_mess)
  async message(@MessageBody() id: number, @ConnectedSocket() socket: Socket) {
    const response = await this.messagesService.findMessages(id);
    socket.emit(PathSocket.get_all_mess, response);
  }

  @SubscribeMessage(PathSocket.send_mess)
  async sendMessage(
    @MessageBody() message: Message,
    @ConnectedSocket() socket: Socket,
  ) {
    const us2 = await this.userRepositort.findOne({
      select: { id: true, socketId: true },
      where: { id: message.targetId },
    });
    socket.emit(PathSocket.send_mess, message);
    socket.broadcast.to(us2.socketId).emit(PathSocket.send_mess, message);

    const dialogue: DialoguesType =
      this.dialoguesService.sendDialogues(message);

    socket.emit(PathSocket.dialogue_one, dialogue);
    socket.broadcast.to(us2.socketId).emit(PathSocket.dialogue_one, dialogue);

    await this.messagesService.saveMessage(message);
  }

  @SubscribeMessage('delete_messages')
  async deleteMessage(
    @MessageBody() dialogue: { targetId: number; sourceId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    await this.messagesService.deleteMessage(dialogue);
  }

  @SubscribeMessage(PathSocket.click)
  clickHandler(@ConnectedSocket() socket: Socket) {
    console.log('click');
    socket.emit(PathSocket.click);
  }
}
