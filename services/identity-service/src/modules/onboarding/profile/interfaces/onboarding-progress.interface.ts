export interface OnboardingStepResult {
  step: number;
  name: string;
  data: Record<string, unknown> | null;
}

// All steps of a role's flow; ProfileService decides which are complete.
export interface OnboardingFlow {
  onboardingType: string | null;
  steps: OnboardingStepResult[];
}

export interface OnboardingProgressResult {
  onboardingType: string | null;
  isProfileComplete: boolean;
  totalSteps: number;
  completedSteps: number;
  // null once every step is done; the frontend redirects here otherwise.
  nextStep: { step: number; name: string } | null;
  // Completed steps only.
  steps: OnboardingStepResult[];
}
