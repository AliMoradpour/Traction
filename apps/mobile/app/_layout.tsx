import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet,Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { setAuthFailureCallback } from '@/api/interceptors';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { useConnectivity } from '@/hooks/useConnectivity';
import { issueReporter } from '@/lib/issueReporter';
import { perf } from '@/lib/perf';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/store/auth.store';

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
    backgroundColor: '#D9895A',
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
    const isIndex = segments.length <= 1;
    // Post-signup screens live in (auth) but are shown to authenticated users; don't bounce them.
    // Register and login navigate on their own once signed in (register goes to onboarding),
    // so redirecting from them here would race that navigation and skip onboarding.
    const isPostSignupRoute = (segments as string[]).some(
      (s) => s === 'welcome-intro' || s === 'onboarding' || s === 'register' || s === 'login',
    );

    if (!isAuthenticated && !inAuthGroup && !isIndex) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup && !isPostSignupRoute) {
      router.replace('/(app)/today');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false, presentation: 'modal' }} />
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
