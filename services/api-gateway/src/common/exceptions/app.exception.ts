// common/exceptions/app.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    errorCode: string,
    message: string,
    status: HttpStatus,
    data?: Record<string, unknown>,
  ) {
    super(
      {
        status,
        error_code: errorCode,
        message,
        ...data,
      },
      status,
    );
  }
}
