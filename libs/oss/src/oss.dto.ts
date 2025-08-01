import { ApiProperty } from "@nestjs/swagger";
import { IsValidPathConstraint } from "@utils/nest-declared";
import { IsString, Validate } from "class-validator";

export class SaveToCosDto {
  @IsString({ message: '路径必须是字符串' })
  @Validate(IsValidPathConstraint, { message: '路径格式不正确' })
  @ApiProperty({ description: '文件路径', example: "abc.png", name: "path" })
  path: string;

  @IsString({ message: 'contentType必须是字符串' })
  @ApiProperty({ description: 'contentType', example: "image/png", name: "contentType" })
  contentType: string;
}