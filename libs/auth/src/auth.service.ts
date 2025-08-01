import { RedisService } from '@app/redis';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { generate8DigitCode } from '@utils/index';
interface User {
  id: string;
  username: string;
  role: string;
  status: "0" | "1" | "2";
  books: any[];
}

@Injectable()
export class AuthService {
  @Inject(RedisService)
  private readonly redisService: RedisService;
  constructor(private jwtService: JwtService) { }

  async sign(user: User) {
    const { id, username, status, role, books } = user;
    const secretId = generate8DigitCode();
    this.redisService.sSet(`user-token:${secretId}`, id); // 设置 redis 缓存
    this.redisService.jsonSet(`user-books:${id}`, books); // 设置 redis 缓存
    if (status !== '1') {
      this.redisService.sSet(`user-status:${id}`, status);
    }
    const payload = { sub: id, username, secretId, status, role };
    return {
      token: this.jwtService.sign(payload),
    };
  }


  userRoleJudge(role: string) {
    if (!["admin", "manager", "vip"].includes(role)) {
      return false
    }
    return true
  }
}
