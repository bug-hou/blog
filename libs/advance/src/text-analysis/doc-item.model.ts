import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DocItemDocument = DocItem & Document;

@Schema()
export class DocItem {
  @Prop({ required: true })
  chapterId: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: [String] })
  tags: string[];

  @Prop({
    type: [{
      word: { type: String, required: true },
      weight: { type: Number, required: true }
    }],
    default: []
  })
  keywords: { word: string; weight: number }[];

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  words: number;

  @Prop({ type: Object, default: {} })
  readTime: Object;

  @Prop({ default: false })
  isPreview: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const DocItemSchema = SchemaFactory.createForClass(DocItem);
