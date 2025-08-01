import { Injectable } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Repository } from 'typeorm';
import { CustomError } from '@app/common/custom-error/custom-error';
import { InternalError } from '@app/common/config/error.config';

@Injectable()
export class FavoriteService {
  @InjectRepository(Favorite)
  private readonly favoriteRepository: Repository<Favorite>;

  create(createFavoriteDto: CreateFavoriteDto, userId: number) {
    try {
      const favorite = this.favoriteRepository.create({
        ...createFavoriteDto,
        userId,
        status: 1
      });
      return this.favoriteRepository.save(favorite);
    } catch (error) {
      throw new CustomError(InternalError, { message: error.message });
    }
  }

  async cancelFavorite(bookId: number, userId: number) {
    try {
      const favorite = await this.favoriteRepository.findOne({ where: { bookId, userId } });
      if (!favorite) {
        throw new CustomError(InternalError, { message: 'Favorite not found' });
      }
      favorite.status = 0;
      return this.favoriteRepository.save(favorite);
    } catch (error) {
      throw new CustomError(InternalError, { message: error.message });
    }
  }

  async countFavorites(bookId: number) {
    try {
      return this.favoriteRepository.count({
        where: { bookId, status: 1 }
      });
    } catch (error) {
      throw new CustomError(InternalError, { message: error.message });
    }
  }
}
