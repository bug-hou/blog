import { Controller, Post, Body, Param, Delete, Get } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { User } from '@app/auth/verify/verify.decorator';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('favorite')
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) { }

  @ApiOperation({ summary: 'Add a book to favorites' })
  @ApiResponse({ status: 201, description: 'The book has been successfully added to favorites.' })
  @Post()
  create(@Body() createFavoriteDto: CreateFavoriteDto, @User("id") userId: number) {
    return this.favoriteService.create(createFavoriteDto, userId);
  }

  @ApiOperation({ summary: 'Remove a book from favorites' })
  @ApiParam({ name: 'bookId', description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'The book has been successfully removed from favorites.' })
  @Delete(':bookId')
  cancel(@Param('bookId') bookId: number, @User("id") userId: number) {
    return this.favoriteService.cancelFavorite(bookId, userId);
  }

  @ApiOperation({ summary: 'Get favorite count for a book' })
  @ApiParam({ name: 'bookId', description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'Returns the favorite count for the book.' })
  @Get(':bookId/count')
  count(@Param('bookId') bookId: number) {
    return this.favoriteService.countFavorites(bookId);
  }
}
