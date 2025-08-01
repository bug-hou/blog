import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DictWordDocument = DictWord & Document;

@Schema()
export class DictWord {
  @Prop({ required: true, unique: true })
  word: string;

  @Prop({ default: 1 })
  count: number;
}

export const DictWordSchema = SchemaFactory.createForClass(DictWord);
