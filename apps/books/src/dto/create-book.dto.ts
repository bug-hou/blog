import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsIn, IsArray, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray({})
  @IsOptional()
  tags?: number[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  currentPrice?: number;

  @IsNumber()
  @IsOptional()
  oldPrice?: number;

  @IsNumber()
  @IsOptional()
  updateChapterCount?: number;

  @IsNumber()
  @IsOptional()
  totalChapterCount?: number;
}

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  tags?: number[];

  @IsOptional()
  @IsBoolean()
  isFinished?: boolean;

  @IsNumber()
  @IsOptional()
  currentPrice?: number;

  @IsNumber()
  @IsOptional()
  oldPrice?: number;

  @IsNumber()
  @IsOptional()
  updateChapterCount?: number;

  @IsNumber()
  @IsOptional()
  totalChapterCount?: number;
}

export class QueryBooksDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number = 10;
}

export class CreateTag {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  type?: string;
}