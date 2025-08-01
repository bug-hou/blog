import { IsString, IsOptional, IsUrl, IsNumber } from 'class-validator';

export class UpdateChapterDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  version?: number;

  @IsNumber()
  @IsOptional()
  index?: number;

  @IsString()
  @IsOptional()
  kind?: string;

  @IsString()
  @IsOptional()
  type?: string;
}
export class UploadImage {
  @IsUrl()
  src: string;
}
export class UploadContent {
  @IsString()
  path: string;
  @IsString()
  contentType: string
}