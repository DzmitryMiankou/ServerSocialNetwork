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
import {
  Message,
  DialoguesType,
  TokenType,
} from './interfaces/chat.gateway.interface';
import { User } from 'src/authentication/authentication.entity';
import { RoomService } from './services/room/room.service';
import { RoomI } from './interfaces/room.interfaces';
import { MessagesService } from './services/messages/messages.service';
import { DialoguesService } from './services/dialogues/dialogues.service';
import { ConnectedService } from './services/connected/connected.service';
import { JoinedRoomService } from './services/joined-room/joined-room.service';

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
    private connectedService: ConnectedService,
    private dialoguesService: DialoguesService,
    private messagesService: MessagesService,
    private joinedService: JoinedRoomService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepositort: Repository<User>,
  ) {}

  @WebSocketServer()
  io: Server;

  async handleDisconnect(socket: Socket) {
    try {
      const refresh_token: string = socket.request.headers.cookie.replace(
        'refresh_token=',
        '',
      );

      const verify: TokenType = await this.JWT.verify(refresh_token, {
        secret: this.configService.get<string>(`SECRET_REFRESH_KEY`),
      });

      const accessToken = await this.JWT.signAsync(
        { sub: verify.sub, username: verify.username },
        {
          expiresIn: '10m',
          secret: this.configService.get<string>(`SECRET_ACCESS_KEY`),
        },
      );
      socket.emit('refresh', `${accessToken}`);
    } catch (error) {
      socket.disconnect();
      return await this.connectedService.deleteByIdSocket(socket.id);
    }
  }

  async handleConnection(client: Socket) {
    try {
      const access_token = (await (client.handshake.auth.Authorization.replace(
        'Bearer=',
        '',
      ) ?? null)) as string | null;
      if (!access_token) return this.handleDisconnect(client);

      const verify: TokenType = await this.JWT.verify(access_token, {
        secret: this.configService.get<string>(`SECRET_ACCESS_KEY`),
      });

      const user = await this.connectedService.findByUser(verify?.sub);

      if (!user) return this.handleDisconnect(client);
      await this.connectedService.saveSocketId(client.id, verify.sub);
      const rooms = await this.roomService.getRoomsForUser(user[0].id, {
        page: 1,
        limit: 100,
      });

      return this.io.to(client.id).emit('rooms', rooms);
    } catch (error) {
      this.handleDisconnect(client);
    }
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room: RoomI,
  ) {
    console.log(room);
    try {
      const createdRoom: RoomI = await this.roomService.createRoom(room);
      const connections: User[] = await this.connectedService.findByUser(
        createdRoom.users[0].id,
      );

      const rooms = await this.roomService.getRoomsForUser(
        createdRoom.users[0].id,
        {
          page: 1,
          limit: 100,
        },
      );
      this.io.to(connections[0].socketId).emit('rooms', rooms);
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('joinRoom')
  async onJoinRoom(@ConnectedSocket() socket: Socket, room: RoomI) {
    await this.joinedService.create({
      socketId: socket.id,
      user: socket.data.user,
      room,
    });
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
    //console.log('click');
    socket.emit(PathSocket.click);
  }
}
