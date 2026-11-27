import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { ProfileDto } from '../dtos/profile.dto';
import { ProfileResponseDto } from './dtos/profile-response.dto';

const baseProfile = {
  fName: 'John',
  lName: 'Doe',
  phoneNumber: '+966501234567',
  termsAccepted: true,
  type: 'SAUDI_CITIZEN',
};

export function ApiCreateProfile() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create the FLX profile for the signed-up account',
      description: [
        'Set `userType` in the body to one of:',
        '',
        '- **INDIVIDUAL** – individual buyer (no business or team steps)',
        '- **BUSINESS** – business buyer (creates a buyer + business record)',
        '- **SELLER** – seller account',
        '- **TRANSPORTER** – transporter account',
        '- **TEAM** – invited team member (requires `invitationToken` and `inviteType` in the body)',
      ].join('\n'),
    }),
    // Swagger UI renders `examples` as a dropdown that fills the body, userType included.
    ApiBody({
      type: ProfileDto,
      examples: {
        INDIVIDUAL: {
          summary: 'INDIVIDUAL – individual buyer',
          value: { userType: 'INDIVIDUAL', ...baseProfile },
        },
        BUSINESS: {
          summary: 'BUSINESS – business buyer',
          value: { userType: 'BUSINESS', ...baseProfile },
        },
        SELLER: {
          summary: 'SELLER – seller account',
          value: { userType: 'SELLER', ...baseProfile },
        },
        TRANSPORTER: {
          summary: 'TRANSPORTER – transporter account',
          value: { userType: 'TRANSPORTER', ...baseProfile },
        },
        TEAM: {
          summary: 'TEAM – invited team member',
          value: {
            userType: 'TEAM',
            ...baseProfile,
            inviteType: 'buyer_team_member',
            invitationToken: '<token from the invite email link>',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Invalid userType, or phoneNumber is not a Saudi mobile (+9665XXXXXXXX)',
    }),
    ApiResponse({ status: HttpStatus.CREATED, type: ProfileResponseDto }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Profile is already complete',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User account not found',
    }),
  );
}
