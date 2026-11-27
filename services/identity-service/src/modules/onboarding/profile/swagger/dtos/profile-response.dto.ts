import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserRole } from '../../../../../database/enums/user-role.enum';
import { VerificationStatus } from '../../../../../database/enums/verificationStatus.enum';
import { ProfileResult } from '../../interfaces/profile-result.interface';

export class ProfileResponseDto implements ProfileResult {
  @ApiProperty()
  userId: string;

  @ApiPropertyOptional({ example: '+966501234567', nullable: true })
  phoneNumber: string | null;

  @ApiPropertyOptional({ enum: UserRole, nullable: true })
  role: UserRole | null;

  @ApiProperty()
  isProfileComplete: boolean;

  @ApiProperty()
  onboardingStep: number;

  @ApiPropertyOptional({ nullable: true })
  onboardingType: string | null;

  @ApiProperty({ enum: VerificationStatus })
  verificationStatus: VerificationStatus;
}
