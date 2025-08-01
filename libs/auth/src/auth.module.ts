import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CommonModule } from '@app/common';
import { JwtModule } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { join } from 'path';
import { JwtStrategy } from './strategy/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { PassportGuard } from './passport/passport.guard';
import { RedisModule, RedisService } from '@app/redis';

@Module({
  imports: [
    CommonModule,
    RedisModule,
    JwtModule.registerAsync({
      useFactory() {
        return {
          privateKey: readFileSync(join(process.cwd(), 'keys', 'private.key')).toString().replace(/\\n/g, '\n'),
          publicKey: readFileSync(join(process.cwd(), 'keys', 'public.key')).toString().replace(/\\n/g, '\n'),
          signOptions: {
            algorithm: 'RS256', // 非对称加密算法
            expiresIn: '7d'     // 令牌有效期
          },
          verifyOptions: { algorithms: ['RS256'] }
        }
      },
    })
  ],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: PassportGuard
    }
  ],
  exports: [AuthService],
})
export class AuthModule { }
