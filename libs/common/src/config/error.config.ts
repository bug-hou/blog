export interface ErrorData {
  message: string;
  code: number;
  errorType: string;
}

export const InternalError = {
  message: 'Internal server error',
  code: 500,
  errorType: 'InternalError'
}

export const UnauthorizedError = {
  message: 'Unauthorized',
  code: 401,
  errorType: 'UnauthorizedError'
}

export const ParameterError = {
  message: 'Parameter error',
  code: 400,
  errorType: 'ParameterError'
}

export const TimeoutError = {
  message: 'Request timeout',
  code: 408,
  errorType: 'TimeoutError'
}

export const JwtParseError = {
  message: 'JWT parse error',
  code: 400,
  errorType: 'JwtParseError'
}

export const NotFoundAssetsError = {
  message: 'Resource not found',
  code: 404,
  errorType: 'NotFoundAssetsError'
}

export const TransformError = {
  message: 'Transform type error',
  code: 400,
  errorType: 'TransformError'
}
export const UserNotFoundError = {
  message: 'User not found',
  code: 404,
  errorType: 'UserNotFoundError'
}

export const AlreadyExistsError = {
  message: 'Resource already exists',
  code: 409,
  errorType: 'AlreadyExistsError'
}

export const UserNotAuthenticatedError = {
  message: 'User not authenticated',
  code: 401,
  errorType: 'UserNotAuthenticatedError'
}

export const UserBannedError = {
  message: 'User has been banned',
  code: 403,
  errorType: 'UserBannedError'
}

export const CodeInvalidOrExpiredError = {
  message: 'Code is invalid or has expired',
  code: 410,
  errorType: 'CodeInvalidOrExpiredError'
}

export const EmailAlreadyExistsError = {
  message: 'Email already exists',
  code: 409,
  errorType: 'EmailAlreadyExistsError'
}
export const NotPurchasedError = {
  message: 'Resource not purchased',
  code: 402,
  errorType: 'NotPurchasedError'
}