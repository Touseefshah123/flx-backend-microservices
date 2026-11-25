import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Client value only if it is a UUID, so a crafted header cannot inject text into the logs.
    const incoming = req.headers['x-request-id'];
    const requestId =
      typeof incoming === 'string' && UUID.test(incoming)
        ? incoming
        : randomUUID();

    req.headers['x-request-id'] = requestId;
    (req as Request & { id?: string }).id = requestId;
    res.setHeader('x-request-id', requestId);

    next();
  }
}
