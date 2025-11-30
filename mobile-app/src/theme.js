import { DefaultTheme } from 'react-native-paper';

export const colors = {
  primary: '#2ECC71',      // Green
  secondary: '#3498DB',    // Blue
  accent: '#E67E22',       // Orange
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  disabled: '#BDC3C7',
  placeholder: '#95A5A6',
  border: '#DDDDDD',
  card: '#FFFFFF',
  shadow: '#000000',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
  },
  roundness: 8,
  fonts: {
    regular: {
      fontFamily: 'NotoSansBengali-Regular',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'NotoSansBengali-Medium',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'NotoSansBengali-Bold',
      fontWeight: '700',
    },
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: colors.text,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    color: colors.text,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: colors.text,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.text,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.textSecondary,
  },
};

export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
