import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { userType } from '../../../../database/enums/userType.enum';
import { UserRole } from '../../../../database/enums/user-role.enum';
import { BuyerType } from '../../../../database/enums/buyer.enum';

// Body `userType` of POST /identity/profile — reuses BuyerType/UserRole values.
export const ProfileUserType = {
  INDIVIDUAL: BuyerType.INDIVIDUAL,
  BUSINESS: BuyerType.BUSINESS,
  SELLER: UserRole.SELLER,
  TRANSPORTER: UserRole.TRANSPORTER,
  TEAM: UserRole.TEAM,
} as const;
export type ProfileUserType =
  (typeof ProfileUserType)[keyof typeof ProfileUserType];

// Kept beside ProfileUserType; @IsIn has already validated userType.
export function toRoleAndBuyerType(userType: ProfileUserType): {
  role: UserRole;
  buyerType?: BuyerType;
} {
  if (userType === BuyerType.INDIVIDUAL || userType === BuyerType.BUSINESS) {
    return { role: UserRole.BUYER, buyerType: userType };
  }
  return { role: userType };
}

export class ProfileDto {
  @ApiProperty({
    enum: Object.values(ProfileUserType),
    example: ProfileUserType.INDIVIDUAL,
    description:
      'Account type: INDIVIDUAL/BUSINESS (buyer), SELLER, TRANSPORTER or TEAM (invited member).',
  })
  @IsIn(Object.values(ProfileUserType))
  userType: ProfileUserType;

  @ApiProperty({
    example: 'John',
    description: 'User first name.',
  })
  @IsString()
  fName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name.',
  })
  @IsString()
  lName: string;

  @ApiProperty({
    example: '+966501234567',
    description:
      'Saudi mobile number in international format (+9665XXXXXXXX). For business and warehouse accounts, the business contact mobile. SMS notifications are sent here.',
  })
  // Mobile-only shape: IsPhoneNumber('SA') alone also accepts landlines, which cannot receive SMS.
  @Matches(/^\+9665\d{8}$/, {
    message:
      'phoneNumber must be a Saudi mobile number in the format +9665XXXXXXXX',
  })
  @IsPhoneNumber('SA')
  phoneNumber: string;

  @ApiProperty({
    example: true,
    description: 'Whether the user has accepted the terms and conditions.',
  })
  @IsBoolean()
  termsAccepted: boolean;

  @ApiPropertyOptional({
    enum: userType,
    example: userType.SAUDI_CITIZEN,
    nullable: true,
    description: 'Legal/individual type of the user.',
  })
  @IsOptional()
  @IsEnum(userType)
  type?: userType | null;

  // Set by the controller; the validator only stops forbidNonWhitelisted rejecting it.
  @ApiHideProperty()
  @IsOptional()
  @IsEnum(BuyerType)
  buyerType?: BuyerType;

  // Set from userType by the controller, not by the client.
  @ApiHideProperty()
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  // Onboarding progress and verification are server-owned, so not accepted here.

  @IsOptional()
  @IsIn(['buyer_team_member', 'seller_team_member', 'transporter_team_member'])
  inviteType?:
    'buyer_team_member' | 'seller_team_member' | 'transporter_team_member';

  @ApiPropertyOptional({
    description: 'JWT invite token from the team-invite email link.',
  })
  @IsOptional()
  @IsString()
  invitationToken?: string;
}
