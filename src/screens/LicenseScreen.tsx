import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { KeyRound } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/tokens';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { activateLicense } from '../services/licenseService';
import { getSettings } from '../data/repositories/settingsRepo';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export function LicenseScreen() {
  const { theme } = useTheme();
  const setPhase = useAuthStore((s) => s.setPhase);
  const show = useUIStore((s) => s.show);
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fingerprint = getSettings().deviceFingerprint ?? '—';

  const submit = () => {
    const result = activateLicense(key, fingerprint);
    if (!result.ok) {
      setError(result.message ?? 'مفتاح الترخيص غير صالح');
      return;
    }
    show('تم تفعيل الترخيص بنجاح', 'success');
    setPhase('ready');
  };

  return (
    <ScrollView contentContainerStyle={[styles.root, { backgroundColor: theme.colors.background }]} keyboardShouldPersistTaps="handled">
      <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
        <KeyRound size={40} color={theme.colors.primary} />
      </View>
      <Text style={[typography.h1, styles.title, { color: theme.colors.text }]}>تفعيل الترخيص</Text>
      <Text style={[typography.body, styles.subtitle, { color: theme.colors.textMuted }]}>
        انتهت فترة التجربة. أدخل مفتاح الترخيص المرسل إليك لمتابعة استخدام التطبيق.
      </Text>

      <View style={[styles.info, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[typography.caption, { color: theme.colors.textMuted }]}>بصمة هذا الجهاز</Text>
        <Text style={[styles.fingerprint, { color: theme.colors.primary }]}>{fingerprint}</Text>
        <Text style={[typography.caption, { color: theme.colors.textMuted }]}>أرسل هذه البصمة إلى المورد للحصول على ترخيص مرتبط بجهازك.</Text>
      </View>

      <Input label="مفتاح الترخيص" value={key} onChangeText={(v) => { setKey(v.trim()); setError(null); }} placeholder="RAQEB1...." ltr error={error} multiline />
      <Button title="تفعيل" onPress={submit} size="lg" style={styles.button} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, padding: 24, paddingTop: 56 },
  icon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20 },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: 8, marginBottom: 26, lineHeight: 22 },
  info: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: 6, marginBottom: spacing.lg, alignItems: 'center' },
  fingerprint: { fontFamily: 'monospace', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  button: { marginTop: spacing.md },
});
