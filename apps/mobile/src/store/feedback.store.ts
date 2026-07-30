import { create } from 'zustand';

export interface FeedbackItem {
  id: string;
  type: 'bug' | 'feature' | 'general';
  message: string;
  screen: string;
  timestamp: number;
  sent: boolean;
}

interface FeedbackState {
  feedbackItems: FeedbackItem[];
  addFeedback: (item: Omit<FeedbackItem, 'id' | 'timestamp' | 'sent'>) => void;
  markSent: (id: string) => void;
  clearSent: () => void;
  getUnsent: () => FeedbackItem[];
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  feedbackItems: [],
  addFeedback: (item) =>
    set((state) => ({
      feedbackItems: [
        ...state.feedbackItems,
        {
          ...item,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          sent: false,
        },
      ],
    })),
  markSent: (id) =>
    set((state) => ({
      feedbackItems: state.feedbackItems.map((f) =>
        f.id === id ? { ...f, sent: true } : f,
      ),
    })),
  clearSent: () =>
    set((state) => ({
      feedbackItems: state.feedbackItems.filter((f) => !f.sent),
    })),
  getUnsent: () => get().feedbackItems.filter((f) => !f.sent),
}));
