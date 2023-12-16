import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'dgram';

@WebSocketGateway()
export class GatewayService {
  @SubscribeMessage(`message`)
  message(@MessageBody() body: string, @ConnectedSocket() socket: Socket) {
    socket.emit('message', { name: body });
  }
}
