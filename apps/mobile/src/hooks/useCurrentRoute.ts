import { usePathname } from 'expo-router';

/** The full route path of the focused screen (e.g. "/goals"), not the layout group name. */
export function useCurrentRoute(): string {
  return usePathname() || 'unknown';
}
