import { JWK } from 'jose';

import { UserEntity } from '../../../database/entities/users.entity';

export type UserForToken = Pick<
  UserEntity,
  'userId' | 'email' | 'tokenVersion'
>;

export interface AccessTokenClaims {
  sub: string;
  email: string;
  tv: number;
}

export interface RefreshTokenClaims {
  sub: string;
  tv: number;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface TokenPort {
  getPublicJwk(): JWK;
  issueTokens(user: UserForToken): Promise<IssuedTokens>;
  verifyRefreshToken(token: string): Promise<RefreshTokenClaims>;
}
