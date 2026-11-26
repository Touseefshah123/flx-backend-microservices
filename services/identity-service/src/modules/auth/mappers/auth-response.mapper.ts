import { AuthResult } from '../interfaces/auth.interface';
import { AuthResponseDto } from '../swagger/dtos/auth-response.dto';

// Drops the refresh token here; it only ever travels in the HttpOnly cookie.
export function toAuthResponseDto(result: AuthResult): AuthResponseDto {
  return {
    userAccountId: result.userId,
    email: result.email,
    accessToken: result.accessToken,
  };
}
