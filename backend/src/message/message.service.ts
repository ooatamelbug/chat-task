import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schemas/message.schema';
import { Model } from 'mongoose';

@Injectable()
export class MessageService {
  constructor(@InjectModel(Message.name) private model: Model<Message>) {}

  async create(data: Partial<Message>) {
    return this.model.create(data);
  }

  async getLastMessages(roomId: string) {
    return this.model.find({ roomId }).sort({ createdAt: -1 }).limit(20).lean();
  }

  async getMessages(roomId: string, page = 1, limit = 20) {
    return this.model
      .find({ roomId })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }
}
