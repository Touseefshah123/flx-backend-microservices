import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  // Kept from the auth-service response so the frontend contract does not change; holds users.userId.
  @ApiProperty()
  userAccountId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  accessToken: string;
}
