import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, typography } from '../../theme/tokens';
import { STATUS_LABEL } from '../../domain/expiry';
import type { StatusLevel } from '../../types/models';

export function Badge({ status, days }: { status: StatusLevel; days?: number | null }) {
  const { theme } = useTheme();
  const color = theme.colors[status];
  const suffix = days == null ? '' : status === 'expired' ? ` (منذ ${Math.abs(days)} يوم)` : ` (${days} يوم)`;
  return (
    <View style={[styles.badge, { backgroundColor: color + '1F', borderColor: color + '55' }]}>
      <Text style={[styles.text, typography.caption, { color }]}>{STATUS_LABEL[status] + suffix}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3, alignSelf: 'flex-start' },
  text: { fontWeight: '600' },
});
