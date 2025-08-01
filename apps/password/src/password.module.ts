import { Module } from '@nestjs/common';
import { PasswordController } from './password.controller';
import { PasswordService } from './password.service';
import { UserModule } from './user/user.module';
import { AuthModule } from '@app/auth';
import { TypeormModule } from '@app/typeorm';
import { User } from './user/entities/user.entity';
import { Books, BooksChaptersUser, BooksTags } from 'apps/books/src/entities/book.entity';
import { Like } from 'apps/books/src/like/entities/like.entity';
import { Chapters, ChapterWithVersion } from 'apps/books/src/chapters/entities/chapters.entity';
import { Favorite } from 'apps/books/src/favorite/entities/favorite.entity';

@Module({
  imports: [
    UserModule,
    AuthModule,
    TypeormModule.register([User, Books, Like, Chapters, ChapterWithVersion, BooksTags, Favorite, BooksChaptersUser])
  ],
  controllers: [
    PasswordController,
  ],
  providers: [
    PasswordService,
  ],
  exports: [
    PasswordService
  ]
})
export class PasswordModule {
}
