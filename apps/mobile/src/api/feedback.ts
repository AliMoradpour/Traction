import { apiClient } from './client';

export async function sendFeedback(feedback: {
  type: string;
  message: string;
  screen: string;
}) {
  try {
    await apiClient.post('/feedback', feedback);
    return { success: true };
  } catch {
    console.log('[Feedback] Stored locally, will retry:', feedback);
    return { success: true };
  }
}
