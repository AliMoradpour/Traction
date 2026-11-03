import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Traction',
  slug: 'traction',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/assets/logos/icon.png',
  scheme: 'traction',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.traction.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/logos/adaptive-icon.png',
      backgroundColor: '#101729',
    },
    package: 'com.traction.app',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-secure-store',
    'expo-splash-screen',
    'expo-status-bar',
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
