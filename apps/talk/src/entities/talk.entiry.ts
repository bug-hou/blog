import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString, Validate } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema()
export class CommentPublishEntity {
  @Prop()
  @IsString({ message: 'user_id必须是字符串' })
  @IsOptional()
  @ApiProperty({ description: '用户ID', example: "user_123", name: "user_id" })
  user_id: string;

  @Prop()
  @IsString({ message: 'chapter_id必须是字符串' })
  @ApiProperty({ description: '文章ID', example: "123", name: "chapter_id" })
  book_id: string;

  @Prop()
  @IsString({ message: 'chapter_id必须是字符串' })
  @ApiProperty({ description: '文章ID', example: "123", name: "chapter_id" })
  chapter_id: string;

  @Prop({ default: 0 })
  @ApiProperty({
    description: '评论ID',
    example: "123",
    name: "reply_to_comment_id",
    required: false
  })
  @IsString({ message: 'reply_to_comment_id必须是字符串' })
  @IsOptional()
  reply_to_comment_id: string;

  @Prop({
    type: JSON
  })
  @ApiProperty({
    description: '评论内容',
    example: [
      {
        type: "text",
        content: "123"
      },
      {
        type: "image",
        content: "abc.png"
      }
    ],
    name: "comment_content",
    required: false
  })
  @IsArray({ message: 'comment_content必须是Array' })
  @IsOptional()
  comment_content: JSON;

  @Prop({ default: 0 })
  @IsOptional()
  @ApiProperty({
    description: '评论点赞数',
    example: "123",
    name: "like_count",
    required: false
  })
  like_count: number;

  @Prop({ default: 0 })
  @IsOptional()
  @ApiProperty({
    description: '评论回复数',
    example: "123",
    name: "reply_count",
    required: false
  })
  reply_count: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export class CommentUpdateEntiry {
  @IsString({ message: 'id必须是字符串' })
  @ApiProperty({ description: '评论ID', example: "123", name: "id" })
  id: string;
}

export type CommentPublishEntityDocument = HydratedDocument<CommentPublishEntity>;
export const CommentPublishEntitySchema = SchemaFactory.createForClass(CommentPublishEntity);