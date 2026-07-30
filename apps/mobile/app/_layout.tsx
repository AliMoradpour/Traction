import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { useAuthStore } from '@/store/auth.store';
import { queryClient } from '@/lib/queryClient';
import { setAuthFailureCallback } from '@/api/interceptors';
import { issueReporter } from '@/lib/issueReporter';
import { useConnectivity } from '@/hooks/useConnectivity';
import { perf } from '@/lib/perf';

SplashScreen.preventAutoHideAsync();

function OfflineBanner() {
  const { isOffline } = useConnectivity();
  if (!isOffline) return null;
  return (
    <View style={offlineStyles.banner}>
      <Text style={offlineStyles.text}>You are offline</Text>
    </View>
  );
}

const offlineStyles = StyleSheet.create({
  banner: {
    backgroundColor: '#F59E0B',
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (isLoading) return;

    const route = '/' + segments.join('/');
    issueReporter.setCurrentRoute(route);

    const seg0 = segments[0] as string;
    const inAuthGroup = seg0?.startsWith('(auth)') ?? false;
    const inOnboardingGroup = seg0?.startsWith('(onboarding)') ?? false;
    const isIndex = segments.length <= 1;
    const isWelcomeIntroRoute = (segments as string[]).includes('welcome-intro');

    if (!isAuthenticated && !inAuthGroup && !inOnboardingGroup && !isIndex) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup && !isWelcomeIntroRoute) {
      router.replace('/(app)/today');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="(modals)" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="tasks" options={{ headerShown: false }} />
      <Stack.Screen name="focus" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();

  useEffect(() => {
    perf.mark('auth-load-start');
    loadStoredAuth().then(() => {
      perf.measure('Auth token load', 'auth-load-start');
    });
  }, []);

  useEffect(() => {
    setAuthFailureCallback(() => {
      clearAuth();
      queryClient.clear();
      router.replace('/(auth)/login');
    });
  }, []);

  useEffect(() => {
    perf.mark('splash-hide');
    SplashScreen.hideAsync().then(() => {
      perf.measure('Splash screen', 'splash-hide');
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ErrorBoundary>
              <OfflineBanner />
              <RootLayoutNav />
            </ErrorBoundary>
            <StatusBar style="auto" />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
