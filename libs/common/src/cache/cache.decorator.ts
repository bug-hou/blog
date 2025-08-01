import { applyDecorators, SetMetadata } from '@nestjs/common';

export const Cache = (name: string, expire: number, dynamicName?: ("params" | "query" | "body")[], options?: {
  params?: string[],
  query?: string[],
  body?: string[]
}) => applyDecorators(
  SetMetadata('enableCache', true),
  SetMetadata('enableName', name),
  SetMetadata('cacheExpire', expire),
  SetMetadata('dynamicName', dynamicName),
  SetMetadata('dynamicOptions', options)
);

export const OnlyUpdateCache = (name: string, expire: number, dynamicName?: ("params" | "query" | "body")[], options?: {
  params?: string[],
  query?: string[],
  body?: string[]
}) => applyDecorators(
  SetMetadata('enableCache', true),
  SetMetadata('onlyUpdateCache', true),
  SetMetadata('enableName', name),
  SetMetadata('cacheExpire', expire),
  SetMetadata('dynamicName', dynamicName),
  SetMetadata('dynamicOptions', options)
);
