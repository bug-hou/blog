import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { CustomError } from '@app/common/custom-error/custom-error';
import { CodeInvalidOrExpiredError, EmailAlreadyExistsError, InternalError, UserNotFoundError } from '@app/common/config/error.config';
import { AuthService } from '@app/auth';
import { OssService } from '@app/oss';
import { RedisService } from '@app/redis';
import { EmailService } from '@app/email';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @Inject(AuthService)
  private readonly authService: AuthService;

  @Inject(OssService)
  private readonly ossService: OssService;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(EmailService)
  private readonly emailService: EmailService;
  async create(createUserDto: CreateUserDto) {
    const data = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (data) {
      return EmailAlreadyExistsError;
    }

    const result = await this.userRepository.save(createUserDto);
    await this.sendVerifyCode(result.id);
    return result;
  }

  async verifyCode(code: string) {
    const userId = await this.redisService.sGet<string>(`verify-code:${code}`);
    if (!userId) {
      return CodeInvalidOrExpiredError;
    }
    await this.redisService.sDel(`verify-code:${code}`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return UserNotFoundError;
    }
    user.status = '1';
    await this.userRepository.save(user);

    await this.redisService.sSet(`user-status:${userId}`, '1');
    return {
      status: 200,
      message: "Verify code success"
    }
  }

  async sendVerifyCode(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new CustomError(UserNotFoundError);
    }
    const code = (+Math.random().toString().slice(2)).toString(36);
    await this.redisService.sSet(`verify-code:${code}`, user.id, 60 * 30);

    await this.emailService.sendMail({
      to: user.email,
      subject: 'Verify Code',
      html: this.emailService.getTemplate("verifyEmail", { link: `http://localhost:3000/verify/${code}` }),
    });
    return {
      status: 200,
      message: "Email sent"
    }
  }

  async validateUser(email: string, password: string) {
    return await this.userRepository.findOne({ where: { email, password } });
  }

  async sign(user) {
    return this.authService.sign(user);
  }

  async find(ids: string[]) {
    let allUsers = [];
    let notFindIds = [];
    ids.forEach(async id => {
      const user = await this.redisService.jsonGet(`user:${id}`);
      if (user) {
        allUsers.push(user);
      } else {
        notFindIds.push(id);
      }
    })
    if (notFindIds.length !== 0) {

      const result = await this.userRepository.find({
        where: {
          id: In(notFindIds)
        }
      });
      result.forEach(item => {
        this.redisService.jsonSet(`user:${item.id}`, item, 60 * 60 * 24);
      })
      allUsers = allUsers.concat(result);
    }
    return allUsers;
  }

  async update(id: string, updateUserDto: Partial<Pick<UpdateUserDto, 'username' | 'avatar'>>) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return new CustomError(UserNotFoundError);
      }
      if (updateUserDto.username !== undefined) {
        user.username = updateUserDto.username;
      }
      if (updateUserDto.avatar !== undefined) {
        user.avatar = updateUserDto.avatar;
      }
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      throw new CustomError(InternalError);
    }
  }

  async saveToCos(body: { path: string, contentType: string }) {
    return await this.ossService.saveJsonToCos(body, 'json');
  }

  async verifyBookAuth(id: string, bookId: number) {
    // this.redisService.sSet(`book-auth:${id}`, String(bookId), 60 * 60 * 24);
    return this.userRepository.findOne({ where: { id, books: { id: bookId } } });
  }
}
