export const radius = {
  none: 0,
  xs: 2,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 24,
  xxl: 28,
  sheet: 32,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;

