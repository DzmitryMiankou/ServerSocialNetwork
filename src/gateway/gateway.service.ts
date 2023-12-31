import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
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

interface Message {
  timeSent: string;
  message: string;
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
  ) {}

  @WebSocketServer()
  io: Server = new Server<ServerToClientEvents, ClientToServerEvents>();

  handleDisconnect(socket: Socket) {
    console.log(`Disconnect: ${socket.id}`);

    this.io.use((socket, next) => {
      const err: any = new Error('not authorized');
      err.data = { content: 'Please retry later' };
      next();
    });
  }

  handleConnection(client: Socket) {
    try {
      const access_token =
        client.handshake.auth.Authorization.replace('Bearer=', '') ?? null;
      if (!access_token) return this.handleDisconnect(client);

      return this.JWT.verify(access_token, {
        secret: this.configService.get<string>(`SECRET_ACCESS_KEY`),
      });
    } catch (error) {
      this.handleDisconnect(client);
    }
  }

  @SubscribeMessage(`all_messages`)
  message(@MessageBody() id: string, @ConnectedSocket() socket: Socket) {
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
    socket.emit('all_messages', messages);
  }

  @SubscribeMessage(`send_message`)
  sendMessage(
    @MessageBody() message: Message,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.emit(`send_message`, message);
  }

  @SubscribeMessage(`click`)
  clickHandler(@ConnectedSocket() socket: Socket) {
    console.log('click');
    socket.emit(`click`);
  }
}
