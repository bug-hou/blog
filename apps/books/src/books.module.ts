import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { AuthModule } from '@app/auth';
import { CommonModule } from '@app/common';
import { TypeormModule } from '@app/typeorm';
import { User } from 'apps/password/src/user/entities/user.entity';
import { OssModule } from '@app/oss';
import { Books, BooksChaptersUser, BooksTags } from './entities/book.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeModule } from './like/like.module';
import { FavoriteModule } from './favorite/favorite.module';
import { Like } from './like/entities/like.entity';
import { AdvanceModule } from '@app/advance';
import { ChaptersModule } from './chapters/chapters.module';
import { Chapters, ChapterWithVersion } from './chapters/entities/chapters.entity';
import { Favorite } from './favorite/entities/favorite.entity';
import { UserModule } from 'apps/password/src/user/user.module';

@Module({
  imports: [
    AuthModule,
    CommonModule,
    OssModule,
    TypeormModule.register([User, Books, Like, Chapters, BooksTags, Favorite, BooksChaptersUser, ChapterWithVersion]),
    TypeOrmModule.forFeature([Books, BooksTags]),
    LikeModule,
    FavoriteModule,
    AdvanceModule,
    ChaptersModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService]
})
export class BooksModule { }
