import { create } from 'zustand';

interface OnboardingState {
  currentStep: number;
  intent: string | null;
  wakePattern: string | null;
  goalTemplate: string | null;
  isCompleted: boolean;
  setCurrentStep: (step: number) => void;
  setIntent: (intent: string) => void;
  setWakePattern: (pattern: string) => void;
  setGoalTemplate: (template: string) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  intent: null,
  wakePattern: null,
  goalTemplate: null,
  isCompleted: false,
  setCurrentStep: (step) => set({ currentStep: step }),
  setIntent: (intent) => set({ intent }),
  setWakePattern: (pattern) => set({ wakePattern: pattern }),
  setGoalTemplate: (template) => set({ goalTemplate: template }),
  completeOnboarding: () => set({ isCompleted: true }),
  reset: () =>
    set({
      currentStep: 1,
      intent: null,
      wakePattern: null,
      goalTemplate: null,
      isCompleted: false,
    }),
}));
