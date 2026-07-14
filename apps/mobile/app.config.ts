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
      backgroundColor: '#0F172A',
    },
    package: 'com.traction.app',
  },
  plugins: ['expo-router', 'expo-font'],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
