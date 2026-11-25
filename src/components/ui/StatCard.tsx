import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, typography } from '../../theme/tokens';

type Props = { label: string; value: number; tone: 'primary' | 'good' | 'warning' | 'critical' | 'expired'; icon?: React.ReactNode };

export function StatCard({ label, value, tone, icon }: Props) {
  const { theme } = useTheme();
  const color = theme.colors[tone];
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={[styles.icon, { backgroundColor: color + '1A' }]}>{icon}</View>
      <Text style={[styles.value, typography.h2, { color }]}>{value}</Text>
      <Text style={[styles.label, typography.caption, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: 4,
  },
  icon: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  value: { fontWeight: '700' },
  label: { textAlign: 'center' },
});
