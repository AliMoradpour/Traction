import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { isPermanentFeedbackError, sendFeedback } from '../api/feedback';
import { type FeedbackItem, useFeedbackStore } from '../store/feedback.store';
import { useCurrentRoute } from './useCurrentRoute';

export type SubmitResult = 'sent' | 'queued';

async function trySend(item: FeedbackItem): Promise<boolean> {
  const { remove, recordAttempt } = useFeedbackStore.getState();
  try {
    await sendFeedback({
      clientId: item.id,
      type: item.type,
      message: item.message,
      screen: item.screen,
    });
    remove(item.id);
    return true;
  } catch (error) {
    if (isPermanentFeedbackError(error)) {
      // The server rejected the payload itself; retrying can't help.
      console.warn('[Feedback] Dropping rejected item', item.id, error);
      remove(item.id);
    } else {
      recordAttempt(item.id);
    }
    return false;
  }
}

let flushing: Promise<void> | null = null;

/** Retry every queued item once. Concurrent calls share one in-flight flush. */
export function flushFeedbackQueue(): Promise<void> {
  if (!flushing) {
    flushing = (async () => {
      for (const item of useFeedbackStore.getState().queue) {
        await trySend(item);
      }
    })().finally(() => {
      flushing = null;
    });
  }
  return flushing;
}

export function useFeedback() {
  const currentRoute = useCurrentRoute();
  const enqueue = useFeedbackStore((s) => s.enqueue);
  const pendingCount = useFeedbackStore((s) => s.queue.length);
  const routeRef = useRef(currentRoute);
  routeRef.current = currentRoute;

  // Retry queued items once storage has rehydrated, and whenever the app returns to the foreground.
  useEffect(() => {
    const flushWhenHydrated = () => {
      void flushFeedbackQueue();
    };
    if (useFeedbackStore.persist.hasHydrated()) flushWhenHydrated();
    const unsubHydrate = useFeedbackStore.persist.onFinishHydration(flushWhenHydrated);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') flushWhenHydrated();
    });
    return () => {
      unsubHydrate();
      sub.remove();
    };
  }, []);

  const submitFeedback = useCallback(
    async (type: FeedbackItem['type'], message: string): Promise<SubmitResult> => {
      // Persist first so nothing is lost if the request or the app dies mid-flight.
      const item = enqueue({ type, message, screen: routeRef.current });
      return (await trySend(item)) ? 'sent' : 'queued';
    },
    [enqueue],
  );

  return { submitFeedback, currentRoute, pendingCount };
}
