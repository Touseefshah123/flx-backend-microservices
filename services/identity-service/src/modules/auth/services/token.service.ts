import { readFileSync } from 'fs';

import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import {
  exportJWK,
  importPKCS8,
  importSPKI,
  JWK,
  jwtVerify,
  KeyLike,
  SignJWT,
} from 'jose';

import { AppException } from '../../../common/exceptions/app.exception';
import jwtConfig from '../../../config/jwt.config';
import {
  IssuedTokens,
  RefreshTokenClaims,
  TokenPort,
  UserForToken,
} from '../interfaces/token.interface';

// Both tokens are RS256 JWTs; nothing is stored, so refresh is revoked only by tokenVersion or expiry.
@Injectable()
export class TokenService implements TokenPort, OnModuleInit {
  private signingKey: KeyLike;
  private verifyKey: KeyLike;
  private publicJwk: JWK;

  constructor(
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {}

  async onModuleInit(): Promise<void> {
    const privateKeyPem = readFileSync(this.config.privateKeyPath, 'utf8');
    const publicKeyPem = readFileSync(this.config.publicKeyPath, 'utf8');
    this.signingKey = await importPKCS8(privateKeyPem, 'RS256');
    this.verifyKey = await importSPKI(publicKeyPem, 'RS256');

    this.publicJwk = await exportJWK(this.verifyKey);
    this.publicJwk.kid = this.config.keyId;
    this.publicJwk.alg = 'RS256';
    this.publicJwk.use = 'sig';
  }

  getPublicJwk(): JWK {
    return this.publicJwk;
  }

  async issueTokens(user: UserForToken): Promise<IssuedTokens> {
    const accessToken = await new SignJWT({
      email: user.email,
      tv: user.tokenVersion,
    })
      .setProtectedHeader({ alg: 'RS256', kid: this.config.keyId })
      .setSubject(user.userId)
      .setIssuer(this.config.issuer)
      .setAudience(this.config.audience)
      .setIssuedAt()
      .setExpirationTime(this.config.accessTtl)
      .sign(this.signingKey);

    const refreshTokenExpiresAt = new Date(
      Date.now() + this.config.refreshTtlDays * 24 * 60 * 60 * 1000,
    );
    const refreshToken = await new SignJWT({ tv: user.tokenVersion })
      .setProtectedHeader({ alg: 'RS256', kid: this.config.keyId })
      .setSubject(user.userId)
      .setIssuer(this.config.issuer)
      .setAudience(this.config.refreshAudience)
      .setIssuedAt()
      .setExpirationTime(refreshTokenExpiresAt)
      .sign(this.signingKey);

    return { accessToken, refreshToken, refreshTokenExpiresAt };
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenClaims> {
    try {
      const { payload } = await jwtVerify(token, this.verifyKey, {
        algorithms: ['RS256'],
        issuer: this.config.issuer,
        audience: this.config.refreshAudience,
      });
      if (typeof payload.sub !== 'string' || typeof payload.tv !== 'number') {
        throw new Error('malformed refresh token claims');
      }
      return { sub: payload.sub, tv: payload.tv };
    } catch {
      throw new AppException(
        'INVALID_REFRESH_TOKEN',
        'Refresh token is invalid or expired',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
