/**
 * FireHawk Brand Design Tokens
 * Based on @contact-biosolutions/fh-brand-kit
 */

export const brandColors = {
  // Primary (Deep Green) - FireHawk signature color
  primary: {
    50: '#f0f8f5',
    100: '#dcefde',
    200: '#bcdfc5',
    300: '#91c8a4',
    400: '#64a87f',
    500: '#2d5a47', // FireHawk Deep Green
    600: '#254832',
    700: '#1e3a28',
    800: '#182f21',
    900: '#14251b',
    950: '#0c281d',
  },
  
  // Secondary (Orange) - FireHawk accent
  secondary: {
    50: '#fef5f1',
    100: '#fce8df',
    200: '#f9d4c4',
    300: '#f4b89c',
    400: '#ed9168',
    500: '#f55a2b', // FireHawk Orange
    600: '#e14622',
    700: '#bd3518',
    800: '#9c2d18',
    900: '#80281a',
    950: '#7e1d07',
  },
  
  // Accent (Green)
  accent: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  // Neutral grays
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5', // FireHawk Gray Light
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#9e9e9e', // FireHawk Gray Medium
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#09090b',
  },
  
  // Semantic colors
  semantic: {
    success: {
      50: '#f0f8f5',
      500: '#2e7d32',
      600: '#2e7d32',
    },
    warning: {
      50: '#fff8e1',
      500: '#f57c00',
      600: '#f57c00',
    },
    error: {
      50: '#ffebee',
      500: '#c62828',
      600: '#c62828',
    },
    info: {
      50: '#e3f2fd',
      500: '#1565c0',
      600: '#1565c0',
    },
  },
};

export const typography = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
    serif: ['Merriweather', 'Georgia', '"Times New Roman"', 'serif'],
    mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['6rem', { lineHeight: '1' }],
    '9xl': ['8rem', { lineHeight: '1' }],
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

export const borderRadius = {
  none: '0px',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
};

// Helper functions for easy access
export const getColor = (path: string) => {
  const keys = path.split('.');
  let result: any = brandColors;
  for (const key of keys) {
    result = result[key];
  }
  return result;
};

export const getFontSize = (size: keyof typeof typography.fontSize) => {
  return typography.fontSize[size];
};

export const getSpacing = (size: keyof typeof spacing) => {
  return spacing[size];
};