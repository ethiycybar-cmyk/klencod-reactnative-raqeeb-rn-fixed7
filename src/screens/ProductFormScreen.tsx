import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/ui/Screen';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { spacing } from '../theme/tokens';
import { CATEGORIES, type ProductDraft } from '../types/models';
import { barcodeExists, createProduct, getProduct, updateProduct } from '../data/repositories/productsRepo';
import { useUIStore } from '../store/uiStore';
import { toArabicError } from '../utils/errors';
import type { RootStackParamList } from '../app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductForm'>;

const schema = z.object({
  name: z.string().trim().min(2, 'اسم المنتج مطلوب (حرفان على الأقل)'),
  barcode: z.string().trim(),
  category: z.string().trim(),
  minStock: z.coerce.number().int().min(0, 'الحد الأدنى يجب أن يكون رقماً صحيحاً موجباً'),
});

export function ProductFormScreen({ route, navigation }: Props) {
  const id = route.params?.id;
  const existing = id ? getProduct(id) : null;
  const show = useUIStore((s) => s.show);
  const [draft, setDraft] = useState<ProductDraft>({
    name: existing?.name ?? '',
    barcode: existing?.barcode ?? '',
    category: existing?.category ?? '',
    minStock: existing ? String(existing.minStock) : '10',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof ProductDraft, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    const parsed = schema.safeParse(draft);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => { next[String(issue.path[0])] = issue.message; });
      setErrors(next);
      return;
    }
    if (barcodeExists(parsed.data.barcode, id)) {
      setErrors({ barcode: 'الباركود مستخدم لمنتج آخر' });
      return;
    }
    setSaving(true);
    try {
      if (existing) updateProduct(existing.id, draft);
      else createProduct(draft);
      show(existing ? 'تم تحديث المنتج' : 'تمت إضافة المنتج', 'success');
      navigation.goBack();
    } catch (e) {
      show(toArabicError(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title={existing ? 'تعديل المنتج' : 'منتج جديد'} subtitle="أدخل بيانات المنتج ثم احفظ">
      <ScrollView keyboardShouldPersistTaps="handled">
        <Card>
          <Input label="اسم المنتج *" value={draft.name} onChangeText={(v) => set('name', v)} error={errors.name} placeholder="مثال: أموكسيسيلين 500mg" />
          <Input label="الباركود" value={draft.barcode} onChangeText={(v) => set('barcode', v)} error={errors.barcode} placeholder="رقم الباركود (اختياري)" ltr />
          <Input label="الفئة" value={draft.category} onChangeText={(v) => set('category', v)} placeholder={CATEGORIES.slice(0, 3).join(' / ')} />
          <View style={styles.list}>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                title={cat}
                size="sm"
                variant={draft.category === cat ? 'primary' : 'outline'}
                onPress={() => set('category', cat)}
                style={styles.chip}
              />
            ))}
          </View>
          <Input label="الحد الأدنى للمخزون" value={draft.minStock} onChangeText={(v) => set('minStock', v)} keyboard="numeric" error={errors.minStock} hint="عند انخفاض المخزون عن هذا الرقم يظهر تنبيه" />
        </Card>
        <View style={styles.actions}>
          <Button title={existing ? 'حفظ التعديلات' : 'إضافة المنتج'} onPress={save} loading={saving} size="lg" />
          <Button title="إلغاء" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  chip: { paddingHorizontal: 10 },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
});
