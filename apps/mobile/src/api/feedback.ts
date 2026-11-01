import { apiClient } from './client';

export interface FeedbackPayload {
  clientId: string;
  type: 'bug' | 'feature' | 'general';
  message: string;
  screen: string;
}

/** Throws on failure so callers can keep the item queued for retry. */
export async function sendFeedback(feedback: FeedbackPayload): Promise<void> {
  await apiClient.post('/feedback', feedback);
}

/** 4xx (other than auth/timeout/rate-limit) means retrying the same payload will never succeed. */
export function isPermanentFeedbackError(error: unknown): boolean {
  // The response interceptor rejects with a normalized ApiErrorResponse carrying `status`.
  const status = (error as { status?: number })?.status;
  return (
    status !== undefined &&
    status >= 400 &&
    status < 500 &&
    status !== 401 &&
    status !== 408 &&
    status !== 429
  );
}
