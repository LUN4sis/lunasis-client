/**
 * 테마 설정
 * 기존 Colors.ts를 theme.ts로 전환
 * web 앱의 SCSS 변수들을 기반으로 구성
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const theme = {
  colors: {
    black: '#000000',
    white: '#ffffff',
    gray: {
      50: '#f6f6f6',
      100: '#f2f2f2',
      150: '#eaeaea',
      200: '#e3e3e3',
      300: '#d9d9d9',
      400: '#bcbbbb',
      500: '#9b9b9b',
      600: '#8c8c8c',
      700: '#667085',
      800: '#666666',
      900: '#0f0f0f',
    },
    red: {
      default: '#ff6a6a',
      300: '#ffbaba',
    },
    orange: {
      default: '#ffac5a',
      100: '#ffe8cd',
      300: '#ffc994',
    },
    purple: {
      default: '#c679d0',
      300: '#deb5e3',
      500: '#a778e3',
      700: '#7047a3',
      800: '#7509ff',
    },
  },
  spacing: {
    0: 0,
    1: 6, // 0.37rem * 16
    2: 8, // 0.5rem * 16
    3: 12, // 0.75rem * 16
    4: 19, // 1.19rem * 16
    5: 24, // 1.5rem * 16
    6: 30, // 1.88rem * 16
    8: 35, // 2.19rem * 16
    10: 53, // 3.3rem * 16
  },
  borderRadius: {
    sm: 5, // 0.3125rem * 16
    md: 7, // 0.4375rem * 16
    lg: 9, // 0.5625rem * 16
    xl: 10, // 0.625rem * 16
    '2xl': 12, // 0.75rem * 16
    '3xl': 15, // 0.9375rem * 16
    '4xl': 20, // 1.25rem * 16
    '5xl': 50, // 3.125rem * 16
    '6xl': 60, // 3.75rem * 16
    '7xl': 200, // 12.5rem * 16
  },
  typography: {
    fontSizes: {
      xs: 8, // 0.5rem * 16
      sm: 10, // 0.625rem * 16
      base: 12, // 0.75rem * 16
      lg: 13, // 0.8125rem * 16
      xl: 15, // 0.9375rem * 16
      '2xl': 18, // 1.125rem * 16
      '3xl': 20, // 1.25rem * 16
      '4xl': 22, // 1.375rem * 16
      '5xl': 27, // 1.675rem * 16
    },
    fontWeights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  // 기존 호환성을 위한 light/dark 테마
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
} as const;

export type Theme = typeof theme;
export type ColorScheme = keyof typeof theme.light & keyof typeof theme.dark;

// 하위 호환성을 위한 기본 export
export default theme;
