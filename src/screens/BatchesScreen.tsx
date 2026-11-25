import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { Plus } from 'lucide-react-native';
import { Screen } from '../components/ui/Screen';
import { SearchBar } from '../components/ui/SearchBar';
import { EmptyState } from '../components/ui/EmptyState';
import { BatchRow } from '../components/BatchRow';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/tokens';
import { listBatches } from '../data/repositories/batchesRepo';
import type { BatchWithProduct, StatusLevel } from '../types/models';
import type { TabScreenProps } from '../app/navigation/types';

const FILTERS: { key: StatusLevel | 'all'; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'critical', label: 'حرج' },
  { key: 'warning', label: 'قريب' },
  { key: 'expired', label: 'منتهي' },
  { key: 'good', label: 'جيد' },
];

export function BatchesScreen({ navigation }: TabScreenProps<'Batches'>) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filter, setFilter] = useState<StatusLevel | 'all'>('all');
  const [items, setItems] = useState<BatchWithProduct[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const load = useCallback(() => setItems(listBatches(debounced, filter)), [debounced, filter]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen title="التشغيلات" subtitle={`${items.length} تشغيلة · الأقرب للانتهاء أولاً`} scroll={false}>
      <SearchBar value={query} onChange={setQuery} placeholder="ابحث بالمنتج أو رقم التشغيلة" />
      <FlashList
        horizontal
        data={FILTERS}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setFilter(item.key)}
            style={({ pressed }) => [
              styles.filter,
              {
                backgroundColor: filter === item.key ? theme.colors.primary : theme.colors.surface,
                borderColor: filter === item.key ? theme.colors.primary : theme.colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[styles.filterText, { color: filter === item.key ? '#FFFFFF' : theme.colors.text }]}>{item.label}</Text>
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: spacing.sm, gap: spacing.xs }}
        style={styles.filters}
      />
      <FlashList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <BatchRow item={item} onPress={() => navigation.navigate({ name: 'BatchForm', params: { id: item.id, productId: item.productId } })} />}
        style={styles.list}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: 100 }}
        ListEmptyComponent={<EmptyState title="لا توجد تشغيلات" message="أضف تشغيلة جديدة أو غيّر الفلتر." actionLabel="إضافة تشغيلة" onAction={() => navigation.navigate({ name: 'BatchForm', params: {} })} />}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="إضافة تشغيلة"
        onPress={() => navigation.navigate({ name: 'BatchForm', params: {} })}
        style={({ pressed }) => [styles.fab, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.85 : 1 }]}
      >
        <Plus size={26} color="#FFFFFF" />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  filters: { height: 48, flexGrow: 0 },
  filter: { borderWidth: 1, borderRadius: radius.pill, overflow: 'hidden' },
  filterText: { fontWeight: '600', fontSize: 13, paddingHorizontal: 14, paddingVertical: 8 },
  fab: { position: 'absolute', end: spacing.lg, bottom: spacing.xl, width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', elevation: 6 },
});
