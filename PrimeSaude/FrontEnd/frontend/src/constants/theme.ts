import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1a2e22',
    background: '#f4f6f5',
    backgroundElement: '#e2e8e4',
    backgroundSelected: '#c8ddd0',
    textSecondary: '#3d7a5c',
  },
  dark: {
    text: '#ffffff',
    background: '#1a2e22',
    backgroundElement: '#15241b',
    backgroundSelected: '#2d5a40',
    textSecondary: '#7ab89a',
  },
  // Paleta Prime Saúde (Figma)
  forestDark: '#1a2e22',
  forestSurface: '#15241b',
  sageDark: '#2d5a40',
  sageMedium: '#3d7a5c',
  sageAccent: '#7ab89a',
  warmCream: '#c8ddd0',
  danger: '#c0392b',
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;