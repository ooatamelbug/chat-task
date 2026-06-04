import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  // this event make join to room
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId);

    console.log(`${data.userId} joined room ${data.roomId}`);

    this.server.to(data.roomId).emit('userJoined', {
      userId: data.userId,
    });
  }

  // this event make send message to room
  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody()
    data: {
      roomId: string;
      senderId: string;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const message = {
      ...data,
      createdAt: new Date(),
    };

    // broadcast to room
    this.server.to(data.roomId).emit('receiveMessage', message);
  }
}
