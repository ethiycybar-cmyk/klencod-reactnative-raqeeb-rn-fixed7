/** رموز نظام التصميم — مصدر الحقيقة للألوان والمقاسات في كل الشاشات. */

export const palette = {
  shield: {
    50: '#E8F0FE',
    100: '#C5DBFC',
    200: '#9EC4FA',
    300: '#74ADF7',
    400: '#539BF5',
    500: '#1565C0',
    600: '#0D47A1',
    700: '#0A3880',
    800: '#072A60',
    900: '#041B3F',
  },
  status: {
    good: '#10B981',
    warning: '#F59E0B',
    critical: '#EF4444',
    expired: '#7F1D1D',
  },
  light: {
    background: '#F5F7FB',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF3FA',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    header: '#0D47A1',
    onHeader: '#FFFFFF',
    overlay: 'rgba(15,23,42,0.45)',
  },
  dark: {
    background: '#0B1220',
    surface: '#111C2E',
    surfaceAlt: '#17243A',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    border: '#24344E',
    header: '#0A3880',
    onHeader: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.65)',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  caption: { fontSize: 12, lineHeight: 17, fontWeight: '400' as const },
  bodySm: { fontSize: 13, lineHeight: 19, fontWeight: '400' as const },
  body: { fontSize: 14, lineHeight: 21, fontWeight: '400' as const },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  h3: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const },
  h2: { fontSize: 22, lineHeight: 30, fontWeight: '700' as const },
  h1: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
} as const;

export type Theme = {
  dark: boolean;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    border: string;
    header: string;
    onHeader: string;
    overlay: string;
    primary: string;
    primaryDeep: string;
    primarySoft: string;
    good: string;
    warning: string;
    critical: string;
    expired: string;
  };
};

export const lightTheme: Theme = {
  dark: false,
  colors: {
    ...palette.light,
    primary: palette.shield[500],
    primaryDeep: palette.shield[700],
    primarySoft: palette.shield[50],
    good: palette.status.good,
    warning: palette.status.warning,
    critical: palette.status.critical,
    expired: palette.status.expired,
  },
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    ...palette.dark,
    primary: palette.shield[400],
    primaryDeep: palette.shield[600],
    primarySoft: palette.shield[900],
    good: palette.status.good,
    warning: palette.status.warning,
    critical: palette.status.critical,
    expired: palette.status.expired,
  },
};

export const statusColor = (status: keyof typeof palette.status, theme: Theme): string =>
  theme.colors[status];
