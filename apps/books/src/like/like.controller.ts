import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { Request } from 'express';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) { }

  @Post()
  create(@Body() createLikeDto: CreateLikeDto, @Req() req: Request) {
    const { id } = req.user;
    return this.likeService.create(createLikeDto, id);
  }
  @Post('cancel')
  cancel(@Body() { bookId }: CreateLikeDto, @Req() req: Request) {
    const { id } = req.user;
    return this.likeService.cancelLike(bookId, id);
  }
  @Post("dislike")
  dislike(@Body() { bookId }: CreateLikeDto, @Req() req: Request) {
    const { id } = req.user;
    return this.likeService.dislike(bookId, id);
  }

  @Get('count/:bookId')
  getCount(@Param('bookId') bookId: number) {
    return this.likeService.countLikes(bookId);
  }
}
