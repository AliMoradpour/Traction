import { useNavigation } from 'expo-router';
import { useState, useEffect } from 'react';

export function useCurrentRoute(): string {
  const navigation = useNavigation();
  const [route, setRoute] = useState(navigation.getState()?.routes?.[navigation.getState()?.index ?? 0]?.name ?? 'unknown');

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      const state = navigation.getState();
      if (state) {
        const current = state.routes[state.index];
        setRoute(current.name);
      }
    });

    return unsubscribe;
  }, [navigation]);

  return route;
}
