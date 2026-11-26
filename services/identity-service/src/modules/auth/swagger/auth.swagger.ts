import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthResponseDto } from './dtos/auth-response.dto';

export function ApiSignup() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create an account, publish user.created and issue tokens',
    }),
    ApiResponse({ status: HttpStatus.CREATED, type: AuthResponseDto }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Email already registered',
    }),
  );
}

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Verify credentials and issue tokens' }),
    ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid email or password, or the account is disabled',
    }),
  );
}

export function ApiRefresh() {
  return applyDecorators(
    ApiOperation({ summary: 'Issue a new access and refresh token pair' }),
    ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Missing, invalid, expired or revoked refresh token',
    }),
  );
}

export function ApiLogout() {
  return applyDecorators(
    ApiOperation({
      summary: 'End every session for the user and clear the refresh cookie',
    }),
    ApiResponse({ status: HttpStatus.NO_CONTENT }),
  );
}
