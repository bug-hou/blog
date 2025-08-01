import { Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { EntityManager, Repository } from 'typeorm';
import { CustomError } from '@app/common/custom-error/custom-error';
import { AlreadyExistsError, InternalError } from '@app/common/config/error.config';

@Injectable()
export class LikeService {
  @InjectRepository(Like)
  private readonly likeRepository: Repository<Like>;

  async create(createLikeDto: CreateLikeDto, userId: number) {
    const { talkId } = createLikeDto;
    const existingLike = await this.likeRepository.findOne({ where: { talkId, userId } });
    if (existingLike) {
      return this.likeRepository.update(existingLike.id, {
        status: existingLike.status === 1 ? 0 : 1
      });
    }
    return this.likeRepository.insert({
      ...createLikeDto,
      userId,
      status: 1
    });
  }

  async cancelLike(talkId: string, userId: number) {
    const like = await this.likeRepository.findOne({ where: { talkId, userId } });
    if (!like) {
      throw new CustomError(InternalError, { message: 'Like not found' });
    }
    like.status = 0;
    return this.likeRepository.save(like);

  }

  async countLikes(talkId: string) {
    return await this.likeRepository.count({
      where: { talkId, status: 1 }
    });
  }

  async findLikesByTalkId(talkId: string, userId: number) {
    return this.likeRepository.count({
      where: { talkId, userId, status: 1 },
    });
  }
}
