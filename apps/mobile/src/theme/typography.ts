import type { TextStyle } from 'react-native';

export const fontFamily = {
  sans: 'Inter',
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const typography = {
  displayLg: {
    fontFamily: fontFamily.sans,
    fontSize: 34,
    fontWeight: fontWeight.bold,
    lineHeight: 41,
    letterSpacing: 0,
  },
  displayLgMobile: {
    fontFamily: fontFamily.sans,
    fontSize: 28,
    fontWeight: fontWeight.bold,
    lineHeight: 34,
    letterSpacing: 0,
  },
  headlineMd: {
    fontFamily: fontFamily.sans,
    fontSize: 22,
    fontWeight: fontWeight.semibold,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMd: {
    fontFamily: fontFamily.sans,
    fontSize: 18,
    fontWeight: fontWeight.semibold,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyLg: {
    fontFamily: fontFamily.sans,
    fontSize: 17,
    fontWeight: fontWeight.regular,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyMd: {
    fontFamily: fontFamily.sans,
    fontSize: 15,
    fontWeight: fontWeight.regular,
    lineHeight: 20,
    letterSpacing: 0,
  },
  bodySm: {
    fontFamily: fontFamily.sans,
    fontSize: 14,
    fontWeight: fontWeight.regular,
    lineHeight: 20,
    letterSpacing: 0,
  },
  labelSm: {
    fontFamily: fontFamily.sans,
    fontSize: 13,
    fontWeight: fontWeight.medium,
    lineHeight: 18,
    letterSpacing: 0,
  },
  labelXs: {
    fontFamily: fontFamily.sans,
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    lineHeight: 13,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  timer: {
    fontFamily: fontFamily.sans,
    fontSize: 64,
    fontWeight: fontWeight.bold,
    lineHeight: 64,
    letterSpacing: 0,
  },
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;

