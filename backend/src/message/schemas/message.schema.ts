import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop()
  roomId: string;

  @Prop()
  senderId: string;

  @Prop()
  senderName: string;

  @Prop()
  receiverId?: string; // DM

  @Prop()
  content: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
