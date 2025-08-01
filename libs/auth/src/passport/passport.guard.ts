import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IsJumpVerify } from '../config/const.config';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CustomError } from '@app/common/custom-error/custom-error';
import { UnauthorizedError } from '@app/common/config/error.config';
import { RedisService } from '@app/redis';

@Injectable()
export class PassportGuard extends AuthGuard("jwt") {
  @Inject(Reflector)
  private readonly reflector: Reflector;

  constructor() {
    super();
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const isJumpVerify = this.reflector.getAllAndOverride(IsJumpVerify, [context.getHandler(), context.getClass()]);
    const req = context.switchToHttp().getRequest<Request>();
    if (isJumpVerify) {
      return true;
    }
    const result = await super.canActivate(context);
    console.log(req.user);
    return !!result;
  }
}
