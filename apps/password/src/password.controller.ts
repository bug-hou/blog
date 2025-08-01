import { Controller, Get } from '@nestjs/common';
import { PasswordService } from './password.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('password')
@Controller("password")
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) { }

  @ApiOperation({ summary: 'Get a welcome message' })
  @ApiResponse({ status: 200, description: 'Returns a welcome message.' })
  @Get()
  getHello(): string {
    return this.passwordService.getHello();
  }
}
