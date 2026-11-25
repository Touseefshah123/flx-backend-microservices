import type { INestApplication } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { AuthenticateMiddleware } from './authenticate.middleware';
import { RequestIdMiddleware } from './request-id.middleware';

// Not configure(): consumer middleware and the catch-all 404 handler both
// register inside init(), leaving no slot for the proxies in between.
export function registerMiddleware(app: INestApplication): void {
  const requestIdMiddleware = app.get(RequestIdMiddleware);
  const authenticateMiddleware = app.get(AuthenticateMiddleware);

  app.use((req: Request, res: Response, next: NextFunction) =>
    requestIdMiddleware.use(req, res, next),
  );
  app.use((req: Request, res: Response, next: NextFunction) =>
    authenticateMiddleware.use(req, res, next).catch(next),
  );
}
