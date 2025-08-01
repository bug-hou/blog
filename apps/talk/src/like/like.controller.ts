import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { Request } from 'express';

@Controller('talk/like')
export class LikeController {
  constructor(private readonly likeService: LikeService) { }

  @Post()
  create(@Body() createLikeDto: CreateLikeDto, @Req() req: Request) {
    const { id } = req.user;
    return this.likeService.create(createLikeDto, id);
  }
  @Post('cancel')
  cancel(@Body() { talkId }: CreateLikeDto, @Req() req: Request) {
    const { id } = req.user;
    return this.likeService.cancelLike(talkId, id);
  }

  @Get('count/:talkId')
  getCount(@Param('talkId') talkId: string) {
    return this.likeService.countLikes(talkId);
  }
}
