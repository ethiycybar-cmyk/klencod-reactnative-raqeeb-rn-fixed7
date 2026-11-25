import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/tokens';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { createInstallPassword } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { toArabicError } from '../utils/errors';
import type { AuthStackParamList } from '../app/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Install'>;

export function InstallScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const setPhase = useAuthStore((s) => s.setPhase);
  const show = useUIStore((s) => s.show);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await createInstallPassword(password, confirm);
      show('تم إنشاء كلمة التثبيت. تابع إعداد نمط القفل', 'success');
      setPhase('pattern-setup');
      navigation.replace('Pattern', { mode: 'setup' });
    } catch (e) {
      setError(toArabicError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.root, { backgroundColor: theme.colors.background }]} keyboardShouldPersistTaps="handled">
      <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
        <ShieldCheck size={44} color={theme.colors.primary} />
      </View>
      <Text style={[typography.h1, styles.title, { color: theme.colors.text }]}>مرحباً بك في رقيب</Text>
      <Text style={[typography.body, styles.subtitle, { color: theme.colors.textMuted }]}>
        اختر كلمة تثبيت لهذا الجهاز. تُحفظ كتجزئة مشفّرة ولا يمكن استردادها، وهي مطلوبة لإعادة تعيين نمط القفل.
      </Text>
      <View style={styles.form}>
        <Input label="كلمة التثبيت" value={password} onChangeText={setPassword} secure placeholder="6 أحرف على الأقل" />
        <Input label="تأكيد كلمة التثبيت" value={confirm} onChangeText={setConfirm} secure placeholder="أعد إدخال الكلمة" error={error} />
        <Button title="إنشاء وتابع" onPress={submit} loading={loading} size="lg" style={styles.button} />
      </View>
      <Text style={[typography.caption, styles.note, { color: theme.colors.textMuted }]}>
        تبدأ فترة التجربة المجانية (30 يوماً) من هذه اللحظة.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, padding: 24, paddingTop: 64, alignItems: 'stretch' },
  icon: { width: 84, height: 84, borderRadius: 24, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 24 },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: 8, marginBottom: 32, lineHeight: 22 },
  form: { gap: 4 },
  button: { marginTop: 12 },
  note: { textAlign: 'center', marginTop: 24 },
});
