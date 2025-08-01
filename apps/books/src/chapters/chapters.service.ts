import { Inject, Injectable } from '@nestjs/common';
import { CreateChapterDto, CreateVersionDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Chapters, ChapterWithVersion } from './entities/chapters.entity';
import { OssService } from '@app/oss';
import * as path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { TextAnalysisService } from '@app/advance/text-analysis/text-analysis.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { NotPurchasedError } from '@app/common/config/error.config';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapters)
    private readonly chaptersRepository: Repository<Chapters>,
    @Inject(OssService)
    private readonly ossService: OssService,
    @Inject(ConfigService)
    private readonly configServer: ConfigService,
    @Inject(TextAnalysisService)
    private readonly textAnalysisService: TextAnalysisService,
    @InjectRepository(ChapterWithVersion)
    private readonly chapterWithVersionRepository: Repository<ChapterWithVersion>,
    @Inject(EventEmitter2)
    private readonly eventEmitter: EventEmitter2
  ) { }

  async findAll({ bookId }: any) {
    const [data, count] = await this.chaptersRepository.findAndCount({
      where: {
        book: {
          id: bookId
        }
      },
      order: {
        index: "ASC",
        createdAt: "DESC"
      },
      relations: ["likes"]
    });
    return {
      data,
      count,
    }
  }

  async findCountByBookId(bookId: number) {
    return await this.chaptersRepository.count({
      where: {
        book: {
          id: bookId
        }
      }
    })
  }

  async DescriptMenuList(bookId: number, userId: string) {
    const result = await this.chaptersRepository.find({
      where: {
        book: {
          id: bookId
        }
      },
      select: ["id", "title", "index", "createdAt", "updatedAt", "kind", "type", "chapterUsers"],
      relations: {
        chapterUsers: true
      },
      order: {
        index: "ASC",
        createdAt: "DESC"
      }
    })
    return result.map(item => {
      return {
        ...item,
        isRead: item.chapterUsers.some(chapterUser => chapterUser.user.id === userId)
      }
    })
  }

  async findOne(id: number, isBuy: boolean) {
    const chapterData = await this.chaptersRepository.findOne({ where: { id }, relations: ["likes", "chapterWithVersions"] });
    if (!chapterData) return null;
    const isReturn = !isBuy && chapterData.type !== "free";
    if (isReturn) {
      return NotPurchasedError;
    }
    const { keywords, ...otherData } = await this.textAnalysisService.findChapterById(id);
    return {
      ...chapterData,
      ...otherData
    };
  }

  async create(createChapterDto: CreateChapterDto) {
    let curIndex = createChapterDto.index;
    const { bookId, version = 0, ...data } = createChapterDto;
    if (!curIndex) {
      curIndex = await this.chaptersRepository.count({
        where: {
          book: {
            id: bookId
          }
        }
      });
    }
    const chapterWithVersion = this.chapterWithVersionRepository.create({
      version,
      content: data.content,
      book: { id: bookId },
    })
    const result = await this.chaptersRepository.save({
      ...data,
      index: curIndex * 10,
      book: { id: bookId },
      chapterWithVersions: [chapterWithVersion]
    });
    return result;
  }
  async addVersion(createChapterDto: CreateVersionDto) {
    const { chapterId, content, version } = createChapterDto;
    const chapter = await this.chaptersRepository.findOne({ where: { id: chapterId } });
    if (!chapter) return null;
    const chapterWithVersion = this.chapterWithVersionRepository.create({
      version,
      content,
      book: chapter.book,
    })
    return await this.chaptersRepository.save({
      ...chapter,
      chapterWithVersions: [chapterWithVersion]
    });
  }
  async update(id: number, updateChapterDto: UpdateChapterDto) {
    const { version, content } = updateChapterDto;
    if (version && content) {
      await this.chapterWithVersionRepository.update({ chapter: { id }, version }, {
        content
      })
    }
    await this.chaptersRepository.update(id, updateChapterDto);
    return this.chaptersRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const chapter = await this.chaptersRepository.findOne({
      where: { id }, relations: {
        book: true
      }
    });
    if (!chapter) return null;
    const { readTime, words } = await this.textAnalysisService.findChapterById(id) as any;
    const data = {
      bookId: chapter.book.id,
      readTime: readTime?.time ?? 0,
      wordCount: words ?? 0,
    };
    const res = await this.chaptersRepository.remove(chapter);
    if (readTime?.time && words) {
      this.eventEmitter.emit("books.decreaseTimeAndWordCount", data);
    }
    await this.textAnalysisService.removeChapter(chapter.id);
    return res;
  }

  async uploadImage(src: string): Promise<string> {
    try {
      // 下载图片
      const response = await axios.get(src, { responseType: 'arraybuffer' });

      // 上传到COS
      const cosKey = `images/${uuidv4()}`;
      await this.ossService.putObject(cosKey, response.data);

      // 返回COS地址
      return path.join(this.configServer.get("cos.accelerateUrl"), cosKey);
    } catch (error) {
      throw new Error(`图片处理失败: ${error.message}`);
    }
  }

  async uploadChapter(body: { path: string, contentType: string }) {
    const {
      headers,
      Key,
      expiration,
    } = await this.ossService.saveJsonToCos(body, "chapters");
    const url = path.join(this.configServer.get("cos.URL"), Key);
    const accelerateUrl = path.join(this.configServer.get("cos.accelerateUrl"), Key);
    return {
      url,
      accelerateUrl,
      headers,
      expiration,
    }
  }
}
