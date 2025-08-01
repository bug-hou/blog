import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Books, BooksTags } from './entities/book.entity';
import { In, Repository } from 'typeorm';
import { CreateBookDto, CreateTag } from './dto/create-book.dto';
import { CustomError } from '@app/common/custom-error/custom-error';
import { InternalError, NotFoundAssetsError } from '@app/common/config/error.config';
import { OssService } from '@app/oss';
import { User } from 'apps/password/src/user/entities/user.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { ChaptersService } from './chapters/chapters.service';
import { AuthService } from '@app/auth';

interface IsBuy {
  userId: string;
  role: string;
}
interface IsLike {
  userId: string;
}

interface IsFavorite {
  userId: string;
}

interface BookCount {
  bookId: number;
}

interface IProcessData {
  isBuy: IsBuy;
  isLike: IsLike;
  isFavorite: IsFavorite;
  bookCount: BookCount;
}

type FlattenObject<T extends Record<string, any>> = T extends object
  ? {
    [K in keyof T as T[K] extends Record<string, any>
    ? keyof T[K]
    : K
    ]: K extends keyof T
    ? T[K] extends Record<string, any>
    ? T[K][keyof T[K] & keyof FlattenObject<T[K]>]
    : T[K]
    : never
  }
  : T;

@Injectable()
export class BooksService {
  @InjectRepository(Books)
  private readonly booksRepository: Repository<Books>;

  @InjectRepository(BooksTags)
  private readonly tagsRespository: Repository<BooksTags>;

  @Inject(OssService)
  private readonly ossService: OssService;
  @Inject(ChaptersService)
  private readonly chaptersService: ChaptersService;
  @Inject(AuthService)
  private readonly authService: AuthService;

  async findAllTags() {
    const [data, total] = await this.tagsRespository.findAndCount();
    return {
      data,
      total
    }
  }
  async createTag(data: CreateTag) {
    return await this.tagsRespository.save(data);
  }
  async updateTag(data: CreateTag, tagId: number) {
    return await this.tagsRespository.update(tagId, data);
  }

  async processBooks<T extends keyof IProcessData>(book: any, relevance: T[], options: FlattenObject<{
    [key in T]: IProcessData[key]
  }>) {
    const { userId, role } = options as any;
    for (const key of relevance) {
      if (key === "isBuy") {
        book.isBuy = book.users.some(user => user.id === userId) || this.authService.userRoleJudge(role);
      }
      if (key === "bookCount") {
        book.bookCount = await this.chaptersService.findCountByBookId(book.id);
      }
      if (key === "isLike") {
        book.isLike = book.likes.some(like => like.userId === +userId);
      }
      if (key === "isFavorite") {
        book.isFavorite = book.favorites.some(favorite => favorite.userId === +userId);
      }
    }
  }
  async getBooksByTag(names: string[], userId: string, role: string) {
    let [data, count] = await this.booksRepository.findAndCount({
      where: {
        isPublic: true,
        tags: {
          name: In(names)
        }
      },
    })

    data = await this.booksRepository.find({
      where: {
        id: In(data.map(item => item.id)),
      },
      relations: ['tags', "likes", "users", "favorites"]
    })

    const iconData = await this.tagsRespository.find({
      where: {
        name: In(names)
      }
    })
    return {
      data: data.map(async item => {
        return await this.processBooks<"isBuy" | "bookCount" | "isLike" | "isFavorite">(item, ["isBuy", "bookCount", "isLike", "isFavorite"], {
          userId,
          role,
          bookId: item.id
        })
      }),
      iconData,
      count
    };
  }

  async findBook(bookId: number) {
    const where = { id: bookId, isFinished: true };
    const book = await this.booksRepository.findOne({
      where,
      relations: [
        "tags",
        "likes",
        "favorites",
        "users"
      ]
    });
    if (!book) {
      throw NotFoundAssetsError;
    }
    return book;
  }

  async create(data: CreateBookDto) {
    const { tags, ...other } = data;
    const tagList = await this.tagsRespository.find({
      where: {
        id: In(tags)
      }
    });
    const book = this.booksRepository.create({
      ...other,
      tags: tagList
    });
    return await this.booksRepository.save(book);
  }

  async update(data: any, bookId: number) {
    try {
      const book = await this.findBook(bookId);
      if (data.tags) {
        data.tags = await this.tagsRespository.find({
          where: {
            id: In(data.tags)
          }
        })
      }
      Object.assign(book, data);
      return await this.booksRepository.save(book);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(InternalError);
    }
  }

  async getDetail(bookId: number, userId: string, role: string) {
    const book = await this.booksRepository.findOne({
      where: { id: bookId },
      relations: ['tags', "likes", "favorites", "users"]
    });
    return await this.processBooks<"isBuy" | "bookCount" | "isLike" | "isFavorite">(book, ["isBuy", "bookCount", "isLike", "isFavorite"], {
      userId,
      role,
      bookId
    })
  }

  async findAll({ page, size, userId, role }) {
    try {
      const [data, total] = await this.booksRepository.findAndCount({
        where: {
          isPublic: true,
        },
        skip: (page - 1) * size,
        take: size,
        relations: ['tags', "likes", "favorites", "users"]
      });
      return {
        data: data.map(item => {
          return this.processBooks<"isBuy" | "bookCount" | "isLike" | "isFavorite">(item, ["isBuy", "bookCount", "isLike", "isFavorite"], {
            userId,
            role,
            bookId: item.id
          })
        }),
        total,
        page,
        size
      }
    } catch (error) {

    }
  }

  async findOneChapter(bookId: string, key: string) {
    const { Body, ETag }: any = await this.ossService.getObject(key);
    return {
      content: Body.toString(),
      etag: ETag.toString()
    };
  }

  @OnEvent("books.updateTimeAndWordCount")
  async updateTimeAndWordCount({ chapterId, readTime, wordCount }: { chapterId: number, readTime: number, wordCount: number }) {
    const { book } = await this.chaptersService.findOne(chapterId, true) as any;
    book.readTime += readTime;
    book.wordCount += wordCount;
    return await this.booksRepository.update(book.id, book);
  }

  @OnEvent("books.decreaseTimeAndWordCount")
  async decreaseTimeAndWordCount({ bookId, readTime, wordCount }: { bookId: number, readTime: number, wordCount: number }) {
    const book = await this.findBook(bookId);
    book.readTime -= readTime;
    book.wordCount -= wordCount;
    return await this.booksRepository.update(bookId, book);
  }

  async DescriptBuyStatus(bookId: number, userId: string, role: string, books: string[]) {
    if (this.authService.userRoleJudge(role) || (books ?? []).includes(bookId.toString())) {
      return true;
    }
    const book = await this.booksRepository.findOne({
      where: { id: bookId },
      relations: ["users"]
    });
    if (!book) {
      throw NotFoundAssetsError;
    }
    return book.users.some(user => user.id === userId);
  }
}
