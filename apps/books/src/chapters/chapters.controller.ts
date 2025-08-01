import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto, CreateVersionDto, PaginationOptions } from './dto/create-chapter.dto';
import { UpdateChapterDto, UploadContent, UploadImage } from './dto/update-chapter.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { User } from '@app/auth/verify/verify.decorator';
import { Request } from 'express';
import { NotPurchasedError } from '@app/common/config/error.config';
import { AuthService } from '@app/auth';

@ApiTags('chapters')
@Controller('chapters')
export class ChaptersController {
  @Inject(AuthService)
  private readonly authService: AuthService;
  constructor(private readonly chaptersService: ChaptersService) { }

  @ApiOperation({ summary: 'Get paginated list of chapters' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', description: 'Number of items per page', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns paginated list of chapters.' })
  @Post()
  findAll(@Body() { page = 1, pageSize = 10, bookId }: PaginationOptions) {
    return this.chaptersService.findAll({ page, pageSize, bookId });
  }

  @Get("DescriptMenuList")
  DescriptMenuList(@Query("bookId") bookId: number, @User("id") userId: string) {
    return this.chaptersService.DescriptMenuList(bookId, userId);
  }

  @ApiOperation({ summary: 'Get a chapter by ID' })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  @ApiResponse({ status: 200, description: 'Returns the chapter details.' })
  @Get(':id')
  findOne(@Param('id') id: number, @User() { role, books }: Request['user']) {
    const isBuy = this.authService.userRoleJudge(role) || (books ?? []).includes(id.toString());
    return this.chaptersService.findOne(id, isBuy);
  }

  @ApiOperation({ summary: 'Create a new chapter' })
  @ApiResponse({ status: 201, description: 'The chapter has been successfully created.' })
  @Post("create")
  create(@Body() createChapterDto: CreateChapterDto) {
    return this.chaptersService.create(createChapterDto);
  }

  @ApiOperation({ summary: 'Update a chapter by ID' })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  @ApiResponse({ status: 200, description: 'The chapter has been successfully updated.' })
  @Post('update/:id')
  update(@Param('id') id: number, @Body() updateChapterDto: UpdateChapterDto) {
    return this.chaptersService.update(id, updateChapterDto);
  }

  @ApiOperation({ summary: 'Delete a chapter by ID' })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  @ApiResponse({ status: 200, description: 'The chapter has been successfully deleted.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chaptersService.remove(+id);
  }

  @Post("upload-image")
  uploadImage(@Body() { src }: UploadImage) {
    return this.chaptersService.uploadImage(src);
  }

  @Post("descriptCosAuth")
  uploadChapter(@Body() body: UploadContent) {
    return this.chaptersService.uploadChapter(body);
  }

  @Post("create-version")
  addVersion(@Body() createVersionDto: CreateVersionDto) {
    return this.chaptersService.addVersion(createVersionDto);
  }
}
