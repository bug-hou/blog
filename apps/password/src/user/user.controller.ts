import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JumpJWT, User } from '@app/auth/verify/verify.decorator';
import { SaveToCosDto } from '@app/oss/oss.dto';
import { ResSaveToBody } from '@app/oss/oss.vo';
import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Cache } from '@app/common/cache/cache.decorator';

@ApiTags('用户相关接口')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post("register")
  @JumpJWT(true)
  @ApiOperation({ summary: '用户注册', description: '用于新用户注册账号' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  create(@Body() createUserDto: CreateUserDto) {
    try {
      return this.userService.create(createUserDto);
    } catch (error) {
      console.log("errrr", error)
    }
  }

  @Post("login")
  @JumpJWT(true)
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: '用户登录', description: '用户登录并返回token' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 200, description: '登录成功，返回用户信息和token' })
  @ApiResponse({ status: 401, description: '认证失败' })
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { id, username, role, books, status, ...data } = req.user;
    const { token } = await this.userService.sign({ id, username, role, books, status });
    res.setHeader('Authorization', `Bearer ${token}`);
    return {
      id,
      username,
      role,
      ...data
    };
  }

  @JumpJWT(true)
  @Get("verify/:token")
  async verify(@Param("token") token: string) {
    return this.userService.verifyCode(token);
  }

  @Post("send-verify-code")
  @ApiOperation({ summary: '发送验证码', description: '发送验证码到指定邮箱' })
  @ApiResponse({ status: 200, description: '验证码已发送' })
  async sendVerifyCode(@User("id") id: string) {
    return this.userService.sendVerifyCode(id);
  }


  @Post('update/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户信息', description: '更新当前登录用户的个人信息' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @User('id') userId: string
  ) {
    return this.userService.update(userId, updateUserDto);
  }

  @Post("save-to-cos")
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取cos的临时权限", description: "获取腾讯云COS的临时上传权限" })
  @ApiBody({ type: SaveToCosDto })
  @ApiResponse({
    status: 200,
    description: '返回COS临时权限',
    type: ResSaveToBody,
    example: {
      "headers": {
        "x-cos-acl": "default",
        "Content-Type": "image/png",
        "Authorization": "q-xxx-xx=sha1&q-ak=AKIDhFdomjU2OXSCJuQjxxxx-header-list=host&q-url-param-list=&q-signature=66c6942cebfd3e8e19cccc76f46d6daf32b24d6d"
      },
      "Key": "json/abc.png", "expiration": "2025-06-03T09:19:19.805Z"
    }
  })
  saveToCos(@Body() body: SaveToCosDto) {
    return this.userService.saveToCos(body);
  }

  @Post("profile/:id")
  @Cache(
    'user:profile',
    60 * 60 * 10,
    ["params"],
    {
      params: ['id']
    }
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取用户信息", description: "获取指定用户的信息" })
  @ApiResponse({
    status: 200,
    description: '返回用户信息',
    type: User,
    example: {
      "id": "1",
      "username": "admin",
      "email": "<EMAIL>",
      "avatar": "https://example.com/avatar.jpg",
      "isActive": true,
      "emailStatus": "0",
      "createdAt": "2024-06-01T12:00:00.000Z",
      "updatedAt": "2024-06-01T12:00:00.000Z"
    }
  })
  async getProfile(@Param('id') id: string) {
    return (await this.userService.find([id]))[0];
  }
}
