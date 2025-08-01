import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { BooksService } from './books.service';
import { Post, Body } from '@nestjs/common';
import { CreateBookDto, CreateTag, QueryBooksDto, UpdateBookDto } from './dto/create-book.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Cache, OnlyUpdateCache } from '@app/common/cache/cache.decorator';
import { User } from '@app/auth/verify/verify.decorator';

@ApiTags('books')
@Controller()
export class BooksController {
  constructor(private readonly booksService: BooksService) { }

  @ApiOperation({ summary: 'Create a new book' })
  @ApiResponse({ status: 201, description: 'The book has been successfully created.' })
  @Post('create')
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @ApiOperation({ summary: 'Update a book by ID' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'The book has been successfully updated.' })
  @Post("update/:id")
  update(@Body() updateBookDto: UpdateBookDto, @Param("id") bookId: number) {
    return this.booksService.update(updateBookDto, bookId);
  }

  @ApiOperation({ summary: 'Get book details by ID' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'The book details.' })
  @Get('detail/:id')
  getDetail(@Param('id') bookId: number, @User("id") userId: string, @User("role") role: string) {
    return this.booksService.getDetail(bookId, userId, role);
  }

  @ApiOperation({ summary: 'Get paginated list of books' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'pageSize', description: 'Number of items per page', required: false })
  @ApiResponse({ status: 200, description: 'The paginated list of books.' })
  @Cache(
    "books:list",
    60 * 60 * 24, // Cache for 24 hours
    ["params"],
    {
      params: ['id']
    }
  )
  @Get("list")
  findAll(@Query("page") page: number = 1, @Query("pageSize") size: number = 10, @User("id") userId: string, @User("role") role: string) {
    return this.booksService.findAll({ page, size, userId, role });
  }

  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'The book details.' })
  @Cache(
    "books:id",
    60 * 60 * 24, // Cache for 24 hours
    ["params"],
    {
      params: ['id']
    }
  )

  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'The list of tags.' })
  @Cache(
    "tags",
    60 * 60 * 24,
  )
  @Get("tags")
  findAllTags() {
    return this.booksService.findAllTags();
  }

  @Post("createTag")
  createTag(@Body() body: CreateTag) {
    return this.booksService.createTag(body);
  }

  @Post("updateTag/:id")
  updateTag(@Param("id") id: number, @Body() body: CreateTag) {
    return this.booksService.updateTag(body, id);
  }

  @Post("getBooksByTag")
  @Cache(
    "books:tags",
    60 * 60 * 24, // Cache for 24 hours
    ["body"],
    {
      body: ['tagId']
    }
  )
  getBooksByTag(@Body("names") names: string[], @User() { userId, role }: any) {
    return this.booksService.getBooksByTag(names, userId, role);
  }

  @Get("DescriptBuyStatus/:bookId")
  DescriptBuyStatus(@Param("bookId") bookId: number, @User("id") userId: string, @User("role") role: string, @User("books") books: any[]) {
    return this.booksService.DescriptBuyStatus(bookId, userId, role, books);
  }
}
