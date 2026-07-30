import { useFeedbackStore } from '../store/feedback.store';
import { sendFeedback } from '../api/feedback';
import { useCurrentRoute } from './useCurrentRoute';

export function useFeedback() {
  const { addFeedback, markSent, getUnsent, clearSent } = useFeedbackStore();
  const currentRoute = useCurrentRoute();

  const submitFeedback = async (type: 'bug' | 'feature' | 'general', message: string) => {
    addFeedback({ type, message, screen: currentRoute });
    try {
      await sendFeedback({ type, message, screen: currentRoute });
    } catch {
      // Will retry later
    }
  };

  return { submitFeedback, getUnsent, clearSent };
}
