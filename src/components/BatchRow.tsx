import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/tokens';
import { Badge } from './ui/Badge';
import { formatDate } from '../utils/dates';
import { formatNumber } from '../utils/format';
import type { BatchWithProduct } from '../types/models';

export function BatchRow({ item, onPress }: { item: BatchWithProduct; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: theme.colors.surface, borderColor: item.status === 'expired' ? theme.colors.critical + '66' : theme.colors.border, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={styles.main}>
        <Text style={[styles.product, typography.bodyLg, { color: theme.colors.text }]} numberOfLines={1}>{item.productName}</Text>
        <Text style={[typography.caption, { color: theme.colors.textMuted }]}>
          تشغيلة {item.batchNumber} · الكمية {formatNumber(item.quantity)}
        </Text>
      </View>
      <View style={styles.side}>
        <Badge status={item.status} days={item.daysLeft} />
        <Text style={[typography.caption, { color: theme.colors.textMuted }]}>انتهاء: {formatDate(item.expiryDate)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, alignItems: 'center' },
  main: { flex: 1, gap: 2 },
  product: { fontWeight: '700' },
  side: { alignItems: 'flex-end', gap: 4 },
});
