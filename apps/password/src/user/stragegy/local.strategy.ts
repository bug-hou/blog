import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user.service';
import { CustomError } from '@app/common/custom-error/custom-error';
import { ParameterError } from '@app/common/config/error.config';
// import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  @Inject(UserService)
  private userService: UserService;

  constructor() {
    super({
      usernameField: "email"
    });
  }

  async validate(email: string, password: string) {
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new CustomError(ParameterError);
    }
    const { password: pass, ...data } = user;
    return data;
  }
}
