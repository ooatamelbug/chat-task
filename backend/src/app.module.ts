import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from './message/message.module';
import { RateLimitService } from './common/rate-limit.service';
import { MessageService } from './message/message.service';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [
    ChatModule,
    MongooseModule.forRoot('mongodb://localhost:27017/chat-app'),
    MessageModule,
  ],
  controllers: [AppController],
  providers: [ChatGateway, MessageService, RateLimitService],
})
export class AppModule {}
