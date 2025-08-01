import { HttpException } from "@nestjs/common";
import { ErrorData } from "../config/error.config";

export class CustomError extends HttpException {
  constructor(data: ErrorData, other?: Record<string, any>) {
    const info = Object.assign({}, data, other);
    super(info, info.code);
  }
}