import { create } from 'zustand';

interface GoalsState {
  selectedGoalId: string | null;
  selectGoal: (id: string) => void;
  clearSelection: () => void;
}

export const useGoalsStore = create<GoalsState>((set) => ({
  selectedGoalId: null,
  selectGoal: (id) => set({ selectedGoalId: id }),
  clearSelection: () => set({ selectedGoalId: null }),
}));
