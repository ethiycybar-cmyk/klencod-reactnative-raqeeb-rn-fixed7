import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Boxes, CalendarClock, Package, Pencil, Plus, Trash2 } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/ui/Screen';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { BatchRow } from '../components/BatchRow';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/tokens';
import { deleteProduct, getProductSummary } from '../data/repositories/productsRepo';
import { listBatchesForProduct } from '../data/repositories/batchesRepo';
import type { BatchWithProduct, ProductSummary } from '../types/models';
import { useUIStore } from '../store/uiStore';
import type { RootStackParamList } from '../app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ route, navigation }: Props) {
  const id = route.params.id;
  const { theme } = useTheme();
  const show = useUIStore((s) => s.show);
  const [product, setProduct] = useState<ProductSummary | null>(() => getProductSummary(id));
  const [batches, setBatches] = useState<BatchWithProduct[]>([]);
  const [confirm, setConfirm] = useState(false);

  const load = useCallback(() => {
    setProduct(getProductSummary(id));
    setBatches(listBatchesForProduct(id));
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const remove = async () => {
    setConfirm(false);
    await deleteProduct(id);
    show('تم حذف المنتج وتشغيلاته', 'success');
    navigation.goBack();
  };

  return (
    <Screen
      title={product?.name ?? 'تفاصيل المنتج'}
      subtitle={product?.category ?? undefined}
      actions={
        <View style={styles.actions}>
          <Pressable onPress={() => navigation.navigate('ProductForm', { id })} hitSlop={10}>
            <Pencil size={19} color={theme.colors.onHeader} />
          </Pressable>
          <Pressable onPress={() => setConfirm(true)} hitSlop={10}>
            <Trash2 size={19} color={theme.colors.onHeader} />
          </Pressable>
        </View>
      }
    >
      {product ? (
        <>
          <Card>
            <View style={styles.titleRow}>
              <Text style={[typography.h3, { color: theme.colors.text, flex: 1 }]}>{product.name}</Text>
              <Badge status={product.status} days={product.daysLeft} />
            </View>
            {product.barcode ? <Text style={[typography.caption, { color: theme.colors.textMuted }]}>الباركود: {product.barcode}</Text> : null}
          </Card>

          <View style={styles.stats}>
            <StatCard label="إجمالي المخزون" value={product.totalQuantity} tone="primary" icon={<Package size={18} color={theme.colors.primary} />} />
            <StatCard label="عدد التشغيلات" value={product.batchCount} tone="good" icon={<Boxes size={18} color={theme.colors.good} />} />
            <StatCard label="الحد الأدنى" value={product.minStock} tone="warning" icon={<CalendarClock size={18} color={theme.colors.warning} />} />
            <StatCard label="أيام لأقرب صلاحية" value={product.daysLeft ?? 0} tone="critical" icon={<CalendarClock size={18} color={theme.colors.critical} />} />
          </View>

          <View style={styles.listHeader}>
            <Text style={[typography.h3, { color: theme.colors.text }]}>التشغيلات</Text>
            <Pressable style={[styles.add, { backgroundColor: theme.colors.primarySoft }]} onPress={() => navigation.navigate('BatchForm', { productId: id })}>
              <Plus size={18} color={theme.colors.primary} />
            </Pressable>
          </View>

          <View style={styles.batchList}>
            {batches.length === 0 ? (
              <EmptyState title="لا توجد تشغيلات" message="أضف تشغيلة لهذا المنتج." actionLabel="إضافة تشغيلة" onAction={() => navigation.navigate('BatchForm', { productId: id })} />
            ) : (
              batches.map((item) => (
                <BatchRow
                  key={item.id}
                  item={item}
                  onPress={() => navigation.navigate('BatchForm', { id: item.id, productId: id })}
                />
              ))
            )}
          </View>
        </>
      ) : (
        <EmptyState title="المنتج غير موجود" />
      )}

      <ConfirmDialog
        visible={confirm}
        title="حذف المنتج"
        message="سيتم حذف المنتج وكل تشغيلاته. لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        danger
        onConfirm={remove}
        onCancel={() => setConfirm(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  batchList: { gap: spacing.sm, paddingBottom: spacing.xxl },
  add: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
