import { Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Repository } from 'typeorm';
import { CustomError } from '@app/common/custom-error/custom-error';
import { InternalError } from '@app/common/config/error.config';

@Injectable()
export class LikeService {
  @InjectRepository(Like)
  private readonly likeRepository: Repository<Like>;

  create(createLikeDto: CreateLikeDto, userId: number) {
    try {
      const like = this.likeRepository.create({
        ...createLikeDto,
        userId,
        status: 1
      });
      return this.likeRepository.save(like);
    } catch (error) {
      throw new CustomError(InternalError, { message: error.message });
    }
  }

  async cancelLike(bookId: number, userId: number) {
    try {
      const like = await this.likeRepository.findOne({ where: { bookId, userId } });
      if (!like) {
        throw new CustomError(InternalError, { message: 'Like not found' });
      }
      like.status = 0;
      return this.likeRepository.save(like);
    } catch (error) {
      throw new CustomError(InternalError, { message: error.message });
    }
  }

  async dislike(bookId: number, userId: number) {
    try {
      const like = await this.likeRepository.findOne({ where: { bookId, userId } });
      if (!like) {
        throw new CustomError(InternalError, { message: 'Like not found' });
      }
      like.status = -1;
      return this.likeRepository.save(like);
    } catch (error) {
      throw new CustomError(InternalError, { message: error.message });
    }
  }

  async countLikes(bookId: number) {
    try {
      return this.likeRepository.count({
        where: { bookId, status: 1 }
      });
    } catch (error) {
      throw new CustomError(InternalError, { message: error.message });
    }
  }
}
