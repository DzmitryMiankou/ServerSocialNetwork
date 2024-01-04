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

interface Message {
  timeSent: string;
  message: string;
}

interface LeftJoinType {
  targets_id: number;
  targets_firstName: string;
  targets_lastName: string;
  targets_email: string;
  targets_password: string;
  targets_isActive: number;
  targets_activeId: string;
  targets_socketId: string | null;
  targetId: number;
  sourceId: number;
}

interface DialoguesType {
  targetId: number;
  sourceId: number;
  firstName: string;
  lastName: string;
  activeId: string;
}

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
      .createQueryBuilder(`messages`)
      .select(['targetId', 'sourceId'])
      .distinct(true)
      .leftJoinAndSelect('messages.target', 'targets')
      .where('messages.sourceId = :sourceId', { sourceId: 1 })
      .orWhere('messages.targetId = :targetId', { targetId: 1 })
      .orderBy('messages.id', 'ASC')
      .getRawMany();

    const dialogues: DialoguesType[] = dialoguesRaw.map((obj) => {
      return {
        targetId: obj.targetId,
        sourceId: obj.sourceId,
        firstName: obj.targets_firstName,
        lastName: obj.targets_lastName,
        activeId: obj.targets_activeId,
      };
    });

    console.log(dialogues);

    socket.emit('dialogues', dialogues);
  }

  @SubscribeMessage(`all_messages`)
  async message(@MessageBody() id: string, @ConnectedSocket() socket: Socket) {
    const messages = [
      {
        timeSent: new Date(Date.now()).toLocaleString('en-US'),
        message: 'Hi, my name is Silver.',
      },
      {
        timeSent: new Date(Date.now()).toLocaleString('en-US'),
        message: 'Hello. How are you?',
      },
    ];

    const messagesRaw = await this.messagesRepository.find({
      take: 100,
      where: [{ sourceId: 1 }, { targetId: 1 }],
      relations: { target: true },
    });

    const messagess = messagesRaw.map((el) => {
      for (const del in el.target)
        if (del === 'password' || del === 'isActive' || del === 'socketId')
          delete el.target[del];

      return { ...el, target: { ...el.target } };
    });

    console.log(messagess);

    socket.emit('all_messages', messages);
  }

  @SubscribeMessage(`send_message`)
  async sendMessage(
    @MessageBody() message: Message,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.emit(`send_message`, message);
    await this.messagesRepository.save({
      sourceId: 3,
      targetId: 1,
      message: message.message,
      createdAt: message.timeSent,
    });
  }

  @SubscribeMessage(`click`)
  clickHandler(@ConnectedSocket() socket: Socket) {
    console.log('click');
    socket.emit(`click`);
  }
}
