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
import { Messages } from './entity/messages.entity';
import { Repository } from 'typeorm';
import {
  Message,
  LeftJoinType,
  MessagesType,
  DialoguesType,
} from './chat.gateway.interface';
import { User } from 'src/authentication/authentication.entity';
import { RoomService } from './services/room/room.service';

const enum PathSocket {
  send = `send_message`,
  get_all = `all_messages`,
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
    private readonly configService: ConfigService,
    @InjectRepository(Messages)
    private readonly messagesRepository: Repository<Messages>,
    @InjectRepository(User)
    private readonly userRepositort: Repository<User>,
  ) {}

  @WebSocketServer()
  io: Server;

  async handleDisconnect(socket: Socket) {
    //console.log(socket.handshake.auth.Authorization);

    await this.userRepositort
      .createQueryBuilder()
      .update(`user`)
      .set({
        socketId: 'Disconnect',
      })
      .where('socketId = :socketId', { socketId: socket.id })
      .execute();
  }

  async handleConnection(client: Socket) {
    try {
      const access_token = (client.handshake.auth.Authorization.replace(
        'Bearer=',
        '',
      ) ?? null) as string | null;
      if (!access_token)
        return this.io.use((socket, next) => {
          const err: any = new Error('not authorized');
          err.data = { content: 'Please retry later' };
          next(err);
        });

      const verify = this.JWT.verify(access_token, {
        secret: this.configService.get<string>(`SECRET_ACCESS_KEY`),
      });

      if (!verify)
        return this.io.use((socket, next) => {
          const err: any = new Error('not authorized');
          err.data = { content: 'Please retry later' };
          next(err);
        });

      //console.log(client.handshake.auth.Authorization);
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

  @SubscribeMessage(PathSocket.dialogues)
  async dialogues(
    @MessageBody() id: number,
    @ConnectedSocket() socket: Socket,
  ) {
    const dialoguesRaw: LeftJoinType[] = await this.messagesRepository
      .createQueryBuilder('messages')
      .select(['targetId', 'sourceId', 'createdAt'])
      .leftJoinAndSelect('messages.target', 'targets')
      .leftJoinAndSelect('messages.source', 'sources')
      .where('messages.sourceId = :sourceId OR messages.targetId = :targetId', {
        sourceId: id,
        targetId: id,
      })
      .orderBy('messages.id', 'DESC')
      .getRawMany();

    const dialogues: DialoguesType[] = dialoguesRaw.map((obj) => {
      return {
        targetId: obj.targetId,
        sourceId: obj.sourceId,
        createdAt: obj.createdAt,
        target: {
          firstName: obj.targets_firstName,
          lastName: obj.targets_lastName,
        },
        sources: {
          firstName: obj.sources_firstName,
          lastName: obj.sources_lastName,
        },
      };
    });

    const newDialogues = {};
    const filterDialogues = dialogues.filter(
      ({ targetId, sourceId }) =>
        !newDialogues[targetId] && (newDialogues[targetId] = sourceId),
    );

    const arr: typeof dialogues = [];
    let unique: DialoguesType = filterDialogues[0];
    for (const i in filterDialogues) {
      !arr[0] && arr.push(filterDialogues[0]);
      if (filterDialogues[+i + 1]?.targetId !== unique.sourceId)
        if (filterDialogues[+i + 1]) {
          unique = filterDialogues[+i + 1];
          arr.push(filterDialogues[+i + 1]);
        }
    }

    socket.emit(PathSocket.dialogues, arr);
  }

  @SubscribeMessage(PathSocket.get_all)
  async message(@MessageBody() id: number, @ConnectedSocket() socket: Socket) {
    const messagesRaw = await this.messagesRepository.find({
      where: [{ sourceId: id }, { targetId: id }],
      relations: { target: true },
    });

    const messages: Readonly<MessagesType[]> = messagesRaw.map((el) => {
      for (const del in el.target)
        if (
          del === 'password' ||
          del === 'isActive' ||
          del === 'socketId' ||
          del === 'activeId'
        )
          delete el.target[del];

      return { ...el, target: { ...el.target } };
    });

    socket.emit(PathSocket.get_all, messages);
  }

  @SubscribeMessage(PathSocket.send)
  async sendMessage(
    @MessageBody() message: Message,
    @ConnectedSocket() socket: Socket,
  ) {
    const us2 = await this.userRepositort.findOne({
      select: { id: true, socketId: true },
      where: { id: message.targetId },
    });

    socket.emit(PathSocket.send, message);

    socket.broadcast.to(us2.socketId).emit(PathSocket.send, message);

    const res = {
      sourceId: message.sourceId,
      targetId: message.targetId,
      createdAt: message.createdAt,
      target: {
        firstName: message.target.firstName,
        lastName: message.target.lastName,
      },
      sources: {
        firstName: message.sources.firstName,
        lastName: message.sources.lastName,
      },
    };

    socket.emit(PathSocket.dialogue_one, res);
    socket.broadcast.to(us2.socketId).emit(PathSocket.dialogue_one, res);

    await this.messagesRepository.save({
      sourceId: message.sourceId,
      targetId: message.targetId,
      message: message.message,
      createdAt: message.createdAt,
    });
  }

  @SubscribeMessage(PathSocket.click)
  clickHandler(@ConnectedSocket() socket: Socket) {
    console.log('click');
    socket.emit(PathSocket.click);
  }
}
