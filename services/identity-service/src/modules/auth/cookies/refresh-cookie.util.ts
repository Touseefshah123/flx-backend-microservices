import { HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

import { AppException } from '../../../common/exceptions/app.exception';
import { AuthResult } from '../interfaces/auth.interface';

export const REFRESH_COOKIE = 'flx_rt';

export function readRefreshCookie(req: Request): string {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    throw new AppException(
      'MISSING_REFRESH_TOKEN',
      'No refresh token supplied',
      HttpStatus.UNAUTHORIZED,
    );
  }
  return token;
}

// HttpOnly so an XSS bug cannot read it; the access token goes in the body for the bearer header.
export function setRefreshCookie(
  res: Response,
  result: Pick<AuthResult, 'refreshToken' | 'refreshTokenExpiresAt'>,
  isProd: boolean,
): void {
  res.cookie(REFRESH_COOKIE, result.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires: result.refreshTokenExpiresAt,
    path: '/auth',
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
}
