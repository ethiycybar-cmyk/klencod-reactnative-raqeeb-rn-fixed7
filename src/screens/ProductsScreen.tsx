import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { Plus } from 'lucide-react-native';
import { Screen } from '../components/ui/Screen';
import { SearchBar } from '../components/ui/SearchBar';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductCard } from '../components/ProductCard';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/tokens';
import { listProducts } from '../data/repositories/productsRepo';
import type { ProductSummary } from '../types/models';
import type { TabScreenProps } from '../app/navigation/types';

export function ProductsScreen({ navigation }: TabScreenProps<'Products'>) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [items, setItems] = useState<ProductSummary[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const load = useCallback(() => setItems(listProducts(debounced)), [debounced]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen title="المنتجات" subtitle={`${items.length} منتجاً`} scroll={false}>
      <SearchBar value={query} onChange={setQuery} placeholder="ابحث بالاسم أو الباركود أو الفئة" />
      <FlashList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ProductCard item={item} onPress={() => navigation.navigate({ name: 'ProductDetail', params: { id: item.id } })} />}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 100, gap: spacing.sm }}
        ListEmptyComponent={<EmptyState title="لا توجد منتجات" message="أضف أول منتج للبدء في إدارة المخزون." actionLabel="إضافة منتج" onAction={() => navigation.navigate({ name: 'ProductForm', params: {} })} />}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="إضافة منتج"
        onPress={() => navigation.navigate({ name: 'ProductForm', params: {} })}
        android_ripple={{ color: '#FFFFFF33' }}
        style={({ pressed }) => [styles.fab, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.85 : 1 }]}
      >
        <Plus size={26} color="#FFFFFF" />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  fab: { position: 'absolute', end: spacing.lg, bottom: spacing.xl, width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
});
