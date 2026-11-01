import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface FeedbackItem {
  id: string;
  type: 'bug' | 'feature' | 'general';
  message: string;
  screen: string;
  timestamp: number;
  attempts: number;
}

interface FeedbackState {
  /** Items not yet accepted by the server. Sent items are removed. */
  queue: FeedbackItem[];
  enqueue: (item: Omit<FeedbackItem, 'id' | 'timestamp' | 'attempts'>) => FeedbackItem;
  remove: (id: string) => void;
  recordAttempt: (id: string) => void;
}

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set) => ({
      queue: [],
      enqueue: (item) => {
        const entry: FeedbackItem = { ...item, id: newId(), timestamp: Date.now(), attempts: 0 };
        set((state) => ({ queue: [...state.queue, entry] }));
        return entry;
      },
      remove: (id) => set((state) => ({ queue: state.queue.filter((f) => f.id !== id) })),
      recordAttempt: (id) =>
        set((state) => ({
          queue: state.queue.map((f) => (f.id === id ? { ...f, attempts: f.attempts + 1 } : f)),
        })),
    }),
    {
      name: 'traction-feedback-queue',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ queue: state.queue }),
    },
  ),
);
