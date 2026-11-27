import { UserEntity } from '../../../../database/entities/users.entity';
import { ProfileResult } from '../interfaces/profile-result.interface';

export function toProfileResult(user: UserEntity): ProfileResult {
  return {
    userId: user.userId,
    phoneNumber: user.phoneNumber,
    role: user.role,
    isProfileComplete: user.isProfileComplete,
    onboardingStep: user.onboardingStep,
    onboardingType: user.onboardingType,
    verificationStatus: user.verificationStatus,
  };
}
