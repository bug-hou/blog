import { Body, Controller, Get, Post, Query, Sse } from '@nestjs/common';
import { TalkService } from './talk.service';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentPublishEntity, CommentUpdateEntiry } from './entities/talk.entiry';
import { User } from '@app/auth/verify/verify.decorator';
import { SaveToCosDto } from '@app/oss/oss.dto';
import { ResSaveToBody } from '@app/oss/oss.vo';

@ApiTags('talk')
@Controller("")
export class TalkController {
  constructor(private readonly talkService: TalkService) { }

  @ApiOperation({ summary: "Get temporary COS permissions" })
  @ApiBody({ type: SaveToCosDto })
  @ApiResponse({
    type: ResSaveToBody,
    example: {
      "headers": {
        "x-cos-acl": "default",
        "Content-Type": "image/png",
        "Authorization": "q-xxx-xx=sha1&q-ak=AKIDhFdomjU2OXSCJuQjxxxx-header-list=host&q-url-param-list=&q-signature=66c6942cebfd3e8e19cccc76f46d6daf32b24d6d"
      },
      "Key": "json/abc.png", "expiration": "2025-06-03T09:19:19.805Z"
    }
  })
  @Post("save-to-cos")
  saveToCos(@Body() body: SaveToCosDto) {
    return this.talkService.saveToCos(body);
  }

  @ApiOperation({ summary: "Publish a comment" })
  @ApiResponse({ status: 201, description: "The comment has been successfully published." })
  @Post("comment/publish")
  async publish(@Body() body: CommentPublishEntity, @User("id") userId: number) {
    return this.talkService.publish({
      ...body,
      user_id: userId,
      like_count: 0,
      reply_count: 0
    });
  }

  @ApiOperation({ summary: "Get comment list" })
  @ApiQuery({ name: "chapter_id", required: true, description: "Article ID" })
  @ApiQuery({ name: "reply_to_comment_id", required: false, description: "Comment ID" })
  @ApiQuery({ name: "page", required: false, description: "Page number", type: Number })
  @ApiQuery({ name: "pageSize", required: false, description: "Items per page", type: Number })
  @ApiResponse({ status: 200, description: "Returns the comment list." })
  @Get("comment/list")
  async list(
    @User("id") userId: number,
    @Query("chapter_id") chapter_id: string,
    @Query("reply_to_comment_id") reply_to_comment_id?: string,
    @Query("book_id") book_id?: string,
    @Query("page") page: number = 0,
    @Query("pageSize") pageSize: number = 10,
  ) {
    return await this.talkService.list({ chapter_id, reply_to_comment_id, page, pageSize, book_id }, userId);
  }

  @ApiOperation({ summary: "Delete a comment" })
  @ApiResponse({ status: 200, description: "The comment has been successfully deleted." })
  @Post("comment/delete")
  async delete(
    @Body() body: CommentUpdateEntiry
  ) {
    return this.talkService.delete(body.id);
  }

  // @Sse("comment/sse")
  // sse() {
  //   // return this.talkService.sse();
  // }
}
