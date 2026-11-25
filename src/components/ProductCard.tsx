import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Package } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/tokens';
import { Badge } from './ui/Badge';
import { formatNumber } from '../utils/format';
import { formatDate } from '../utils/dates';
import type { ProductSummary } from '../types/models';

export function ProductCard({ item, onPress }: { item: ProductSummary; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: theme.colors.primarySoft }}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
          <Package size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.nameBox}>
          <Text style={[styles.name, typography.bodyLg, { color: theme.colors.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[typography.caption, { color: theme.colors.textMuted }]}>{item.category ?? 'بدون فئة'}</Text>
        </View>
        <Badge status={item.status} days={item.daysLeft} />
      </View>
      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <Text style={[typography.caption, { color: theme.colors.textMuted }]}>المخزون: <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{formatNumber(item.totalQuantity)}</Text></Text>
        <Text style={[typography.caption, { color: theme.colors.textMuted }]}>التشغيلات: {item.batchCount}</Text>
        <Text style={[typography.caption, { color: theme.colors.textMuted }]}>أقرب صلاحية: {formatDate(item.nearestExpiry)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, gap: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  nameBox: { flex: 1 },
  name: { fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: spacing.sm, flexWrap: 'wrap', gap: 6 },
});
