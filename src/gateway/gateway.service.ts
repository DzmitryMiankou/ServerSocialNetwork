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
import { Namespace, Socket } from 'socket.io';

@WebSocketGateway()
export class GatewayService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private JWT: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @WebSocketServer()
  io: Namespace;

  handleDisconnect(socket: Socket) {}
  handleConnection(client: Socket) {
    console.log(client.id);
    try {
      const access_token =
        client.handshake.auth.Authorization.replace('Bearer=', '') ?? null;

      if (!access_token) return this.handleDisconnect(client);

      this.JWT.verify(access_token, {
        secret: this.configService.get<string>(`SECRET_ACCESS_KEY`),
      });
    } catch (error) {
      this.io.use((socket, next) => {
        const err: any = new Error('not authorized');
        err.data = { content: 'Please retry later' };
        next(err);
      });
    }
  }

  @SubscribeMessage(`all_messages`)
  message(@MessageBody() id: string, @ConnectedSocket() socket: Socket) {
    socket.emit('all_messages', { id: 1, name: id ?? 'hi' });
  }

  @SubscribeMessage(`send_message`)
  sendMessage(@MessageBody() id: string, @ConnectedSocket() socket: Socket) {
    socket.emit(`all_messages`, { id: 1, name: id });
  }
}
