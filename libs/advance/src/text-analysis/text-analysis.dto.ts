import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class SaveDocDto {
  @IsNumber()
  chapterId: number;

  @IsString()
  
  title: string;

  @IsString()
  description: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}

export class UpdateChapterDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  content?: string;
}

export class SearchDto {
  @IsString()
  query: string;
}

export class QueryHunYuanAiDto {
  @IsString()
  content: string;

  @IsNumber()
  @IsOptional()
  chapterId?: number;
}
