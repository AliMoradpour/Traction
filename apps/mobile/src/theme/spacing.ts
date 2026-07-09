export const spacing = {
  none: 0,
  hairline: 1,
  px: 1,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  gutter: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  marginMobile: 20,
  marginDesktop: 40,
  controlHeightSm: 36,
  controlHeightMd: 48,
  controlHeightLg: 56,
  bottomTabHeight: 68,
} as const;

export type SpacingToken = keyof typeof spacing;

