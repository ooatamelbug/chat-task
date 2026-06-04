import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  async handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  // this event make join to room
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId);

    const messages = await this.chatService.getLastMessages(data.roomId);

    client.emit('previousMessages', messages);
  }

  // this event make send message to room
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: {
      roomId: string;
      senderId: string;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.createMessage({
      ...data,
    });

    this.server.to(data.roomId).emit('receiveMessage', message);
  }
}
