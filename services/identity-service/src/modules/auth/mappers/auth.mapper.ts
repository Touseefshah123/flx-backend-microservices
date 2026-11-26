import { UserEntity } from '../../../database/entities/users.entity';
import { AuthResult } from '../interfaces/auth.interface';
import { IssuedTokens } from '../interfaces/token.interface';

export function toAuthResult(
  user: Pick<UserEntity, 'userId' | 'email'>,
  tokens: IssuedTokens,
): AuthResult {
  return {
    userId: user.userId,
    email: user.email,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
  };
}
