import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  version?: number;

  @IsNumber()
  @IsNotEmpty()
  bookId: number;

  @IsString()
  @IsNotEmpty()
  kind: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @IsOptional()
  index?: number;
}

export class PaginationOptions {
  @IsNumber()
  bookId: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  page: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  pageSize: number;
}

export class CreateVersionDto {
  @IsNumber()
  @IsNotEmpty()
  chapterId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsNotEmpty()
  version: number;
}