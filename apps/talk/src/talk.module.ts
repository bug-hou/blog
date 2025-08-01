import { Module } from '@nestjs/common';
import { TalkController } from './talk.controller';
import { TalkService } from './talk.service';
import { CommonModule } from '@app/common';
import { OssModule } from '@app/oss';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentPublishEntity, CommentPublishEntitySchema } from './entities/talk.entiry';
import { AuthModule } from '@app/auth';
import { TypeormModule } from '@app/typeorm';
import { Like } from './like/entities/like.entity';
import { User } from 'apps/password/src/user/entities/user.entity';
import { Books, BooksChaptersUser, BooksTags } from 'apps/books/src/entities/book.entity';
import { Like as BooksLike } from 'apps/books/src/like/entities/like.entity';
import { UserModule } from 'apps/password/src/user/user.module';
import { LikeModule } from './like/like.module';
import { Chapters, ChapterWithVersion } from 'apps/books/src/chapters/entities/chapters.entity';
import { Favorite } from 'apps/books/src/favorite/entities/favorite.entity';

@Module({
  imports: [
    AuthModule,
    CommonModule,
    OssModule,
    UserModule,
    LikeModule,
    TypeormModule.register([Like, User, Books, BooksLike, Chapters, BooksChaptersUser, Favorite, BooksTags, ChapterWithVersion]),
    MongooseModule.forFeature([
      {
        name: CommentPublishEntity.name,
        schema: CommentPublishEntitySchema
      }
    ])
  ],
  controllers: [TalkController],
  providers: [TalkService],
})
export class TalkModule { }
