import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/ui/Screen';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/tokens';
import { listProducts } from '../data/repositories/productsRepo';
import { createBatch, getBatch, updateBatch } from '../data/repositories/batchesRepo';
import type { BatchDraft } from '../types/models';
import { addDaysISO, isISODate, todayISO } from '../utils/dates';
import { errorMessage } from '../utils/errors';
import { useUIStore } from '../store/uiStore';
import type { RootStackParamList } from '../app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BatchForm'>;

const schema = z.object({
  productId: z.number().int().positive('اختر المنتج'),
  batchNumber: z.string().trim().min(1, 'رقم التشغيلة مطلوب'),
  quantity: z.coerce.number().int().min(0, 'الكمية يجب أن تكون رقماً صحيحاً'),
  productionDate: z.string(),
  expiryDate: z.string().refine(isISODate, errorMessage('INVALID_DATE')),
});

export function BatchFormScreen({ route, navigation }: Props) {
  const id = route.params?.id;
  const existing = id ? getBatch(id) : null;
  const products = useMemo(() => listProducts(), []);
  const { theme } = useTheme();
  const show = useUIStore((s) => s.show);
  const [draft, setDraft] = useState<BatchDraft>({
    productId: existing?.productId ?? route.params?.productId ?? 0,
    batchNumber: existing?.batchNumber ?? '',
    quantity: existing ? String(existing.quantity) : '0',
    productionDate: existing?.productionDate ?? todayISO(),
    expiryDate: existing?.expiryDate ?? addDaysISO(365),
    purchasePrice: existing?.purchasePrice ? String(existing.purchasePrice) : '',
    sellingPrice: existing?.sellingPrice ? String(existing.sellingPrice) : '',
    supplier: existing?.supplier ?? '',
    notes: existing?.notes ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [picker, setPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedProduct = products.find((p) => p.id === draft.productId);
  const set = (key: keyof BatchDraft, value: string | number) => setDraft((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    const parsed = schema.safeParse(draft);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => { next[String(issue.path[0])] = issue.message; });
      setErrors(next);
      return;
    }
    if (draft.productionDate && draft.expiryDate < draft.productionDate) {
      setErrors({ expiryDate: errorMessage('DATE_ORDER') });
      return;
    }
    setSaving(true);
    try {
      if (existing) updateBatch(existing.id, draft);
      else createBatch(draft);
      show(existing ? 'تم تحديث التشغيلة' : 'تمت إضافة التشغيلة', 'success');
      navigation.goBack();
    } catch (e) {
      show(e instanceof Error ? e.message : 'حدث خطأ أثناء الحفظ', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title={existing ? 'تعديل التشغيلة' : 'تشغيلة جديدة'}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={[typography.body, { color: theme.colors.text, marginBottom: 6 }]}>المنتج *</Text>
          <Pressable
            onPress={() => setPicker(true)}
            style={({ pressed }) => [styles.select, { borderColor: errors.productId ? theme.colors.critical : theme.colors.border, opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={[typography.body, { color: selectedProduct ? theme.colors.text : theme.colors.textMuted }]}>
              {selectedProduct?.name ?? 'اضغط لاختيار المنتج'}
            </Text>
          </Pressable>
          {errors.productId ? <Text style={[typography.caption, { color: theme.colors.critical }]}>{errors.productId}</Text> : null}

          <Input label="رقم التشغيلة *" value={draft.batchNumber} onChangeText={(v) => set('batchNumber', v)} ltr error={errors.batchNumber} />
          <Input label="الكمية" value={draft.quantity} onChangeText={(v) => set('quantity', v)} keyboard="numeric" error={errors.quantity} />

          <Input label="تاريخ الإنتاج" value={draft.productionDate} onChangeText={(v) => set('productionDate', v.trim())} placeholder="YYYY-MM-DD" ltr hint="اتركه فارغاً إن لم يوجد" />
          <Input label="تاريخ الانتهاء *" value={draft.expiryDate} onChangeText={(v) => set('expiryDate', v.trim())} placeholder="YYYY-MM-DD" ltr error={errors.expiryDate} />
          <View style={styles.quickDates}>
            <Button title="اليوم" size="sm" variant="outline" onPress={() => set('expiryDate', todayISO())} />
            <Button title="بعد 30 يوم" size="sm" variant="outline" onPress={() => set('expiryDate', addDaysISO(30))} />
            <Button title="بعد 90 يوم" size="sm" variant="outline" onPress={() => set('expiryDate', addDaysISO(90))} />
          </View>

          <Input label="سعر الشراء" value={draft.purchasePrice} onChangeText={(v) => set('purchasePrice', v)} keyboard="decimal-pad" ltr />
          <Input label="سعر البيع" value={draft.sellingPrice} onChangeText={(v) => set('sellingPrice', v)} keyboard="decimal-pad" ltr />
          <Input label="المورد" value={draft.supplier} onChangeText={(v) => set('supplier', v)} />
          <Input label="ملاحظات" value={draft.notes} onChangeText={(v) => set('notes', v)} multiline />
        </Card>

        <View style={styles.actions}>
          <Button title={existing ? 'حفظ التعديلات' : 'إضافة التشغيلة'} onPress={save} loading={saving} size="lg" />
          <Button title="إلغاء" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      </ScrollView>

      <Modal visible={picker} transparent animationType="fade" onRequestClose={() => setPicker(false)}>
        <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.picker, { backgroundColor: theme.colors.surface }]}>
            <Text style={[typography.h3, { color: theme.colors.text, marginBottom: spacing.md }]}>اختر المنتج</Text>
            <ScrollView>
              {products.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => { set('productId', p.id); setPicker(false); }}
                  style={({ pressed }) => [styles.productItem, { borderBottomColor: theme.colors.border, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={[typography.body, { color: theme.colors.text }]}>{p.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button title="إغلاق" variant="outline" onPress={() => setPicker(false)} style={styles.close} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  select: { borderWidth: 1, borderRadius: radius.md, minHeight: 50, justifyContent: 'center', paddingHorizontal: spacing.md, marginBottom: spacing.md },
  quickDates: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md, flexWrap: 'wrap' },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  picker: { width: '100%', maxWidth: 420, maxHeight: '75%', borderRadius: radius.xl, padding: spacing.lg },
  productItem: { paddingVertical: spacing.md, borderBottomWidth: 1 },
  close: { marginTop: spacing.md },
});
