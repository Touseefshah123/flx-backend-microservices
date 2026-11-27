import { UserRole } from '../../../../database/enums/user-role.enum';
import { VerificationStatus } from '../../../../database/enums/verificationStatus.enum';

// What the API returns after createProfile — never the raw UserEntity. This
// is also the shape the frontend redirect decision (buyer/seller/transporter
// dashboard vs. complete-profile) is built from.
export interface ProfileResult {
  userId: string;
  phoneNumber: string | null;
  role: UserRole | null;
  isProfileComplete: boolean;
  onboardingStep: number;
  onboardingType: string | null;
  verificationStatus: VerificationStatus;
}
