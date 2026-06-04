import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schemas/message.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<Message>,
  ) {}

  async createMessage(data: any) {
    return this.messageModel.create(data);
  }

  async getLastMessages(roomId: string) {
    return this.messageModel.find({ roomId }).sort({ createdAt: -1 }).limit(20);
  }

  async getMessagesWithPagination(roomId: string, page: number) {
    const limit = 20;

    return this.messageModel
      .find({ roomId })
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);
  }
}
