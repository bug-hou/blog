import { SetMetadata } from '@nestjs/common';
import { IsAdminUse, IsJumpVerify } from '../config/const.config';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const JumpJWT = (isJump: boolean) => SetMetadata(IsJumpVerify, isJump);

// export const verifyBookId=(bookId:number)=>

export const verifyAdmin = (isAdmin: boolean) => SetMetadata(IsAdminUse, isAdmin);

export const User = createParamDecorator(
  (key: "id" | "username" | "role" | "books", ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return key ? request.user[key] : request.user;
  },
);
