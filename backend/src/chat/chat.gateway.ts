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
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private messageService: MessageService,
    private rateLimit: RateLimitService,
    private jwtService: JwtService, // ✅ FIX
  ) {}

  private rooms = new Map<string, Set<string>>();
  private socketUserMap = new Map<string, string>();
  private userNames = new Map<string, string>(); // ✅ NEW

  // 🔐 Auth Middleware
  afterInit(server: Server) {
    server.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token;

        if (!token) throw new Error('No token');

        const payload = this.jwtService.verify(token);

        socket.data.userId = payload.userId;
        socket.data.username = payload.username;

        // store username
        this.userNames.set(payload.userId, payload.username);

        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
  }

  handleConnection(client: Socket) {
    console.log('Connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUserMap.get(client.id);
    if (!userId) return;

    this.rooms.forEach((users, roomId) => {
      if (users.has(userId)) {
        users.delete(userId);

        // send usernames not IDs
        const usernames = [...users].map(
          (id) => this.userNames.get(id) || 'User',
        );

        this.server.to(roomId).emit('online_users', usernames);
      }
    });

    this.socketUserMap.delete(client.id);
  }

  // 🧠 Join Room
  @SubscribeMessage('join_room')
  async joinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    client.join(data.roomId);
    client.join(userId); // DM channel

    this.socketUserMap.set(client.id, userId);

    if (!this.rooms.has(data.roomId)) {
      this.rooms.set(data.roomId, new Set());
    }

    this.rooms.get(data.roomId).add(userId);

    // send usernames instead of IDs
    const usernames = [...this.rooms.get(data.roomId)].map(
      (id) => this.userNames.get(id) || 'User',
    );

    this.server.to(data.roomId).emit('online_users', usernames);

    const messages = await this.messageService.getLastMessages(data.roomId);

    client.emit('room_messages', messages);

    console.log(`${client.data.username} joined ${data.roomId}`);
  }

  // 💬 Send Message
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody()
    data: {
      roomId?: string;
      receiverId?: string;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;
    const senderName = client.data.username;

    const key = `${senderId}-${data.roomId}`;

    if (!this.rateLimit.isAllowed(key)) {
      return client.emit('error', 'Rate limit exceeded');
    }

    const message = await this.messageService.create({
      ...data,
      senderId,
      senderName, // ✅ FIX
    });

    // DM
    if (data.receiverId) {
      this.server.to(data.receiverId).emit('receive_message', message);
      return;
    }

    // Room
    this.server.to(data.roomId).emit('receive_message', message);
  }

  // ✍️ Typing
  @SubscribeMessage('typing_start')
  typingStart(@MessageBody() data, @ConnectedSocket() socket: Socket) {
    socket.to(data.roomId).emit('typing_start', socket.data.username); // ✅ FIX
  }

  @SubscribeMessage('typing_stop')
  typingStop(@MessageBody() data, @ConnectedSocket() socket: Socket) {
    socket.to(data.roomId).emit('typing_stop');
  }
}
