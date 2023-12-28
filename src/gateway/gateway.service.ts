import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'dgram';

@WebSocketGateway()
export class GatewayService {
  @SubscribeMessage(`all_messages`)
  message(@MessageBody() id: string, @ConnectedSocket() socket: Socket) {
    console.log(id);
    socket.emit('all_messages', { id: 1, name: id });
  }

  @SubscribeMessage(`send_message`)
  sendMessage(@MessageBody() id: string, @ConnectedSocket() socket: Socket) {
    console.log(id);
    socket.emit(`all_messages`, { id: 1, name: id });
  }
}
