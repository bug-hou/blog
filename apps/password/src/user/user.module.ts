import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '@app/auth';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LocalStrategy } from './stragegy/local.strategy';
import { OssModule } from '@app/oss';
import { RedisModule, RedisService } from '@app/redis';
import { EmailModule } from '@app/email';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    OssModule,
    RedisModule,
    EmailModule
  ],
  controllers: [UserController],
  providers: [UserService, LocalStrategy],
  exports: [UserService]
})
export class UserModule { }
