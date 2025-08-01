import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Inject, Injectable } from '@nestjs/common';
import { CustomError } from '@app/common/custom-error/custom-error';
import { JwtParseError, UserBannedError, UserNotAuthenticatedError } from '@app/common/config/error.config';
import { RedisService } from '@app/redis';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  @Inject(RedisService)
  private readonly redisService: RedisService;
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: readFileSync(join(process.cwd(), 'keys', 'public.key')), // 公钥验证
      algorithms: ['RS256'] // 强制算法校验
    });
  }

  async validate(payload: { sub: number, username: string, iat: number, exp: number, secretId: string; role: string; status: string; }) {
    let { secretId, sub, username, role, status, } = payload;
    if (!["admin", "manager"].includes(role)) {
      if (status === "0") {
        status = await this.redisService.sGet(`user-status:${sub}`) as string;
        if (status === '0') {
          throw new CustomError(UserNotAuthenticatedError);
        }
      }
      if (status === "2") {
        throw new CustomError(UserBannedError);
      }
    }
    const value = await this.redisService.sGet(`user-token:${secretId}`);
    if (!value) {
      throw new CustomError(JwtParseError, { message: "Token has been invalid" });
    }
    const books = await this.redisService.jsonGet(`user-books:${sub}`);
    return { id: sub, username, role, books }; // 注入到 req.user
  }
}