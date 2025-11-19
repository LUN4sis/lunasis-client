/**
 * 테마 유틸리티 함수
 * theme 값을 쉽게 사용할 수 있도록 도와주는 헬퍼 함수들
 */

import { theme } from './theme';

/**
 * 색상 값을 가져옵니다
 * @example getColor('gray', 500) => '#9b9b9b'
 * @example getColor('purple', 'default') => '#c679d0'
 */
export function getColor(
  colorName: 'gray' | 'red' | 'orange' | 'purple',
  shade:
    | number
    | 'default'
    | '300'
    | '500'
    | '700'
    | '800'
    | '100'
    | '150'
    | '200'
    | '400'
    | '600'
    | '50',
): string {
  const color = theme.colors[colorName];

  if (typeof color === 'object') {
    if (shade === 'default' && 'default' in color) {
      return color.default;
    }
    if (typeof shade === 'number' && shade in color) {
      return color[shade as keyof typeof color] as string;
    }
  }

  return color as string;
}

/**
 * 간격 값을 가져옵니다
 * @example getSpacing(2) => 8
 */
export function getSpacing(multiplier: keyof typeof theme.spacing): number {
  return theme.spacing[multiplier];
}

/**
 * 테두리 반경 값을 가져옵니다
 * @example getBorderRadius('md') => 7
 */
export function getBorderRadius(size: keyof typeof theme.borderRadius): number {
  return theme.borderRadius[size];
}

/**
 * 폰트 크기를 가져옵니다
 * @example getFontSize('base') => 12
 */
export function getFontSize(size: keyof typeof theme.typography.fontSizes): number {
  return theme.typography.fontSizes[size];
}

/**
 * 폰트 두께를 가져옵니다
 * @example getFontWeight('bold') => '700'
 */
export function getFontWeight(weight: keyof typeof theme.typography.fontWeights): string {
  return theme.typography.fontWeights[weight];
}
