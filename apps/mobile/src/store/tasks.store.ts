import { create } from 'zustand';

interface TasksState {
  selectedTaskId: string | null;
  focusSessionActive: boolean;
  selectTask: (id: string) => void;
  clearSelection: () => void;
  setFocusSessionActive: (active: boolean) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  selectedTaskId: null,
  focusSessionActive: false,
  selectTask: (id) => set({ selectedTaskId: id }),
  clearSelection: () => set({ selectedTaskId: null }),
  setFocusSessionActive: (active) => set({ focusSessionActive: active }),
}));
