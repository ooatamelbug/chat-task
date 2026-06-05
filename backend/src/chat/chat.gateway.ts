import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessageService } from '../message/message.service';
import { RateLimitService } from '../common/rate-limit.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private messageService: MessageService,
    private rateLimit: RateLimitService,
  ) {}

  // store online users per room
  private rooms = new Map<string, Set<string>>();

  // map socket -> userId
  private socketUserMap = new Map<string, string>();

  // Middleware (Auth)
  afterInit(server: Server) {
    server.use((socket, next) => {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Unauthorized'));
      }

      // dummy auth (token = userId)
      socket.data.userId = token;

      next();
    });
  }

  // On Connect
  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  // On Disconnect
  handleDisconnect(client: Socket) {
    const userId = this.socketUserMap.get(client.id);

    if (!userId) return;

    this.rooms.forEach((users, roomId) => {
      if (users.has(userId)) {
        users.delete(userId);

        // update online users
        this.server.to(roomId).emit('onlineUsers', Array.from(users));
      }
    });

    this.socketUserMap.delete(client.id);

    console.log('Client disconnected:', client.id);
  }

  // Join Room
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    client.join(data.roomId);
    client.join(userId); // important for DM

    // track socket → user
    this.socketUserMap.set(client.id, userId);

    // add to room map
    if (!this.rooms.has(data.roomId)) {
      this.rooms.set(data.roomId, new Set());
    }

    this.rooms.get(data.roomId).add(userId);

    // send online users
    this.server
      .to(data.roomId)
      .emit('onlineUsers', Array.from(this.rooms.get(data.roomId)));

    // send last 20 messages
    const messages = await this.messageService.getLastMessages(data.roomId);

    client.emit('previousMessages', messages);

    console.log(`${userId} joined room ${data.roomId}`);
  }

  // Send Message (Room + DM)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: {
      roomId?: string;
      senderId?: string;
      receiverId?: string;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const key = `${data.senderId}-${data.roomId}`;

    if (!this.rateLimit.isAllowed(key)) {
      return this.server.emit('error', 'Rate limit exceeded');
    }

    const senderId = client.data.userId;

    const message = await this.messageService.create({
      ...data,
      senderId,
    });

    // DM
    if (data.receiverId) {
      this.server.to(data.receiverId).emit('receiveMessage', message);
    } else {
      // Room message
      this.server.to(data.roomId).emit('receiveMessage', message);
    }
  }

  @SubscribeMessage('private_message')
  async privateMessage(
    @MessageBody()
    data: {
      senderId: string;
      receiverSocketId: string;
      content: string;
    },
    @ConnectedSocket() socket: Socket,
  ) {
    const message = await this.messageService.create(data);

    this.server
      .to(data.receiverSocketId)
      .emit('receive_private_message', message);
  }
}
