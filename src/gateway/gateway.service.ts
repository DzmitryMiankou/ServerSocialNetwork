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
} from './gateway.interface';

export interface ServerToClientEvents {
  chat: (e: Message) => void;
}

export interface ClientToServerEvents {
  chat: (e: Message) => void;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
  },
})
export class GatewayService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private JWT: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Messages)
    private readonly messagesRepository: Repository<Messages>,
  ) {}

  @WebSocketServer()
  io: Server = new Server<ServerToClientEvents, ClientToServerEvents>();

  handleDisconnect(socket: Socket) {
    console.log(`Disconnect: ${socket.id}`);
  }

  handleConnection(client: Socket) {
    try {
      const access_token = (client.handshake.auth.Authorization.replace(
        'Bearer=',
        '',
      ) ?? null) as string | null;
      if (!access_token) return this.handleDisconnect(client);

      const verify = this.JWT.verify(access_token, {
        secret: this.configService.get<string>(`SECRET_ACCESS_KEY`),
      });

      console.log(`Connection: ${client.id}. User_id: ${verify.sub}`);
    } catch (error) {
      return this.io.use((socket, next) => {
        const err: any = new Error('not authorized');
        err.data = { content: 'Please retry later' };
        next();
      });
    }
  }

  @SubscribeMessage(`dialogues`)
  async dialogues(
    @MessageBody() id: number,
    @ConnectedSocket() socket: Socket,
  ) {
    const dialoguesRaw: LeftJoinType[] = await this.messagesRepository
      .createQueryBuilder('messages')
      .select(['targetId', 'sourceId', 'createdAt'])
      .distinct(true)
      .leftJoinAndSelect('messages.target', 'targets')
      .leftJoinAndSelect('messages.source', 'sources')
      .where('messages.sourceId = :sourceId', { sourceId: id })
      .orWhere('messages.targetId = :targetId', { targetId: id })
      .orderBy('messages.id', 'ASC')
      .getRawMany();

    const dialogues: DialoguesType[] = dialoguesRaw.map((obj) => {
      return {
        targetId: obj.targetId,
        sourceId: obj.sourceId,
        createdAt: obj.createdAt,
        target: {
          firstName: obj.targets_firstName,
          lastName: obj.targets_lastName,
          activeId: obj.targets_activeId,
        },
        sources: {
          firstName: obj.sources_firstName,
          lastName: obj.sources_lastName,
          activeId: obj.sources_activeId,
        },
      };
    });

    const newDialogues = {};
    const filterDialogues = dialogues.filter(({ targetId }) => {
      // console.log(!newDialogues[targetId]);
      // console.log(targetId);
      return !newDialogues[targetId] && (newDialogues[targetId] = 1);
    });

    //console.log(newDialogues);

    socket.emit('dialogues', filterDialogues);
  }

  @SubscribeMessage(`all_messages`)
  async message(@MessageBody() id: number, @ConnectedSocket() socket: Socket) {
    const messagesRaw = await this.messagesRepository.find({
      take: 100,
      where: [{ sourceId: id }, { targetId: id }],
      relations: { target: true },
    });

    const messages: MessagesType[] = messagesRaw.map((el) => {
      for (const del in el.target)
        if (del === 'password' || del === 'isActive' || del === 'socketId')
          delete el.target[del];

      return { ...el, target: { ...el.target } };
    });

    socket.emit('all_messages', messages);
  }

  @SubscribeMessage(`send_message`)
  async sendMessage(
    @MessageBody() message: Message,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.emit(`send_message`, message);
    await this.messagesRepository.save({
      sourceId: message.sourceId,
      targetId: message.targetId,
      message: message.message,
      createdAt: message.createdAt,
    });
  }

  @SubscribeMessage(`click`)
  clickHandler(@ConnectedSocket() socket: Socket) {
    console.log('click');
    socket.emit(`click`);
  }
}
