import { ArgumentMetadata, ValidationPipe, ValidationPipeOptions } from "@nestjs/common";
import { CustomError } from "../custom-error/custom-error";
import { TransformError } from "../config/error.config";

export class CustomValidationPipe extends ValidationPipe {
  constructor(options: ValidationPipeOptions) {
    super(options);
  }

  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    try {
      const result = await super.transform(value, metadata);
      if (typeof result === "number" && isNaN(result)) {
        throw "transform error"
      }
      return result;
    } catch (error) {
      throw new CustomError(TransformError, error.response);
    }
  }
}
