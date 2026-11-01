import { resolveApiUrl } from './apiUrl';

const config = {
  apiUrl: resolveApiUrl(process.env.EXPO_PUBLIC_API_URL),
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  isDev: process.env.EXPO_PUBLIC_APP_ENV === 'development',
  isStaging: process.env.EXPO_PUBLIC_APP_ENV === 'staging',
  isProduction: process.env.EXPO_PUBLIC_APP_ENV === 'production',
} as const;

export default config;
