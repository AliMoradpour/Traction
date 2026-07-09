import { create } from 'zustand';

interface UIState {
  colorScheme: 'light' | 'dark' | 'system';
  isOnboarded: boolean;
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => void;
  setOnboarded: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  colorScheme: 'system',
  isOnboarded: false,
  setColorScheme: (scheme) => set({ colorScheme: scheme }),
  setOnboarded: (value) => set({ isOnboarded: value }),
}));
