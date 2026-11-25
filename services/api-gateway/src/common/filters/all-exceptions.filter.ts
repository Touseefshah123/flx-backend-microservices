import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error_code = 'INTERNAL_SERVER_ERROR';
    let extra: Record<string, unknown> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        error_code = 'HTTP_ERROR';
      } else if (res && typeof res === 'object') {
        const {
          message: msg,
          error_code: code,
          ...rest
        } = res as Record<string, unknown>;
        // Rebuilt below; left in, they would duplicate or contradict status.
        delete rest.statusCode;
        delete rest.status;

        if (msg) message = msg as string | string[];

        if (Array.isArray(msg)) {
          error_code = 'VALIDATION_ERROR';
        } else {
          error_code = (code as string) ?? 'HTTP_ERROR';
        }

        extra = rest;
      }
    }

    if (status >= 500) {
      const requestId = (request as { id?: string }).id;
      this.logger.error(
        `${requestId ? `[${requestId}] ` : ''}${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      status,
      error_code,
      message,
      ...extra,
    });
  }
}
