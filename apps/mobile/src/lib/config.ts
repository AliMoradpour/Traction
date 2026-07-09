const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  isDev: process.env.EXPO_PUBLIC_APP_ENV === 'development',
  isStaging: process.env.EXPO_PUBLIC_APP_ENV === 'staging',
  isProduction: process.env.EXPO_PUBLIC_APP_ENV === 'production',
} as const;

export default config;
