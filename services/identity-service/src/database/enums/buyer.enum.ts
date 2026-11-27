export enum BuyerType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
}
export enum PreferredStorageType {
  DRY = 'DRY',
  AC = 'AC',
  COOL = 'COOL',
  FROZEN = 'FROZEN',
}
export enum BuyerTeamRole {
  BUYER_ADMIN = 'BUYER_ADMIN',
  STANDARD_USER = 'STANDARD_USER',
}

export enum BuyerOnboardingStep {
  PREFERENCES = 'preferences',
  BUSINESS = 'business',
  VERIFICATION = 'verification',
}

// Single source of step order; a step's index = steps done before it.
export const BUYER_ONBOARDING_STEPS: Record<
  BuyerType,
  readonly BuyerOnboardingStep[]
> = {
  [BuyerType.BUSINESS]: [
    BuyerOnboardingStep.PREFERENCES,
    BuyerOnboardingStep.BUSINESS,
    BuyerOnboardingStep.VERIFICATION,
  ],
  [BuyerType.INDIVIDUAL]: [
    BuyerOnboardingStep.PREFERENCES,
    BuyerOnboardingStep.VERIFICATION,
  ],
};
