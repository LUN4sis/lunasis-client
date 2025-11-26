import { theme } from './theme';

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
      return color.default as string;
    }
    if (typeof shade === 'number' && shade in color) {
      return color[shade as keyof typeof color] as string;
    }
    if ('default' in color) {
      return color.default as string;
    }
    if (colorName === 'gray' && 500 in color) {
      return color[500] as string;
    }
  }

  if (typeof color === 'string') {
    return color;
  }

  // fallback
  return '#000000';
}

export function getSpacing(multiplier: keyof typeof theme.spacing): number {
  return theme.spacing[multiplier];
}

export function getBorderRadius(size: keyof typeof theme.borderRadius): number {
  return theme.borderRadius[size];
}

export function getFontSize(size: keyof typeof theme.typography.fontSizes): number {
  return theme.typography.fontSizes[size];
}

export function getFontWeight(weight: keyof typeof theme.typography.fontWeights): string {
  return theme.typography.fontWeights[weight];
}
