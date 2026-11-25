import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

import { AppException } from '../exceptions/app.exception';
import { PUBLIC_PATHS, PUBLIC_PREFIXES } from '../../config/routes.config';
import { JwtVerifier } from '../../modules/auth/jwt-verifier';

@Injectable()
export class AuthenticateMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtVerifier: JwtVerifier,
    private readonly config: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const path = req.originalUrl.split('?')[0];

    if (
      PUBLIC_PATHS.includes(path) ||
      PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix))
    ) {
      next();
      return;
    }

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new AppException(
          'MISSING_BEARER_TOKEN',
          'Missing bearer token',
          401,
        );
      }

      const token = authHeader.slice('Bearer '.length);
      const { sub } = await this.jwtVerifier.verify(token);

      const timestamp = Date.now().toString();
      const secret = this.config.get<string>('INTERNAL_HMAC_SECRET')!;
      // Signed, not just forwarded: stops a replay under a different user.
      const canonical = `${req.method}\n${path}\n${sub}\n${timestamp}`;
      const signature = createHmac('sha256', secret)
        .update(canonical)
        .digest('hex');

      // A client-sent x-email is dropped, so nothing downstream can trust a forged one.
      delete req.headers['x-email'];
      req.headers['x-user-id'] = sub;
      req.headers['x-flx-timestamp'] = timestamp;
      req.headers['x-flx-signature'] = signature;

      next();
    } catch (error) {
      // Outside Nest's filters, so the error response is sent directly.
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json(error.getResponse());
      } else {
        // jose's own errors: expired, bad signature, wrong issuer/audience.
        const invalid = new AppException(
          'INVALID_TOKEN',
          'Access token is invalid or expired',
          HttpStatus.UNAUTHORIZED,
        );
        res.status(invalid.getStatus()).json(invalid.getResponse());
      }
    }
  }
}
