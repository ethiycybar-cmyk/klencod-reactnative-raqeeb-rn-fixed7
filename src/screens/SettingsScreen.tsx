import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Database, Moon, ShieldCheck } from 'lucide-react-native';
import type { TabScreenProps } from '../app/navigation/types';
import { Screen } from '../components/ui/Screen';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PatternLock } from '../components/PatternLock';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/tokens';
import { getSettings } from '../data/repositories/settingsRepo';
import { licenseValidity, trialDaysLeft } from '../services/licenseService';
import { changeInstallPassword, logout, resetPatternWithPassword } from '../services/authService';
import { buildBackup, importBackup } from '../services/backupService';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { toArabicError } from '../utils/errors';

type ModalKind = 'password' | 'pattern' | 'backup' | 'import' | null;

export function SettingsScreen({ navigation }: TabScreenProps<'Settings'>) {
  const { theme, isDark, setDark } = useTheme();
  const setPhase = useAuthStore((s) => s.setPhase);
  const show = useUIStore((s) => s.show);
  const [modal, setModal] = useState<ModalKind>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [newConfirm, setNewConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [backupText, setBackupText] = useState('');
  const [importText, setImportText] = useState('');
  const [, force] = useState(0);

  useFocusEffect(React.useCallback(() => { force((v) => v + 1); }, []));

  const settings = getSettings();
  const trial = trialDaysLeft(settings);
  const state = licenseValidity(settings);
  const licenseLabel = state === 'active' ? 'مفعّل' : state === 'trial' ? `تجربة · ${trial} يوم متبقٍ` : 'منتهي';

  const changePassword = async () => {
    setError(null);
    try {
      await changeInstallPassword(password, confirm, newConfirm);
      show('تم تغيير كلمة التثبيت', 'success');
      setModal(null);
      setPassword('');
      setConfirm('');
      setNewConfirm('');
    } catch (e) {
      setError(toArabicError(e));
    }
  };

  const changePattern = async (points: number[]) => {
    if (!password) {
      setError('أدخل كلمة التثبيت أولاً');
      return;
    }
    try {
      await resetPatternWithPassword(password, points);
      show('تم إعادة تعيين نمط القفل', 'success');
      setModal(null);
      setPassword('');
      setError(null);
    } catch (e) {
      setError(toArabicError(e));
    }
  };

  const doImport = async () => {
    const result = await importBackup(importText);
    show(result.message, result.ok ? 'success' : 'error');
    if (result.ok) setModal(null);
  };

  return (
    <Screen title="الإعدادات" subtitle="إدارة الترخيص والنسخ الاحتياطي والعرض">
      <Card>
        <View style={styles.row}>
          <ShieldCheck size={22} color={theme.colors.primary} />
          <View style={styles.rowText}>
            <Text style={[typography.bodyLg, { color: theme.colors.text }]}>الترخيص</Text>
            <Text style={[typography.caption, { color: theme.colors.textMuted }]}>{licenseLabel}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Database size={22} color={theme.colors.primary} />
          <View style={styles.rowText}>
            <Text style={[typography.bodyLg, { color: theme.colors.text }]}>بصمة الجهاز</Text>
            <Text style={[styles.mono, { color: theme.colors.textMuted }]}>{settings.deviceFingerprint ?? '—'}</Text>
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.row}>
          <Moon size={22} color={theme.colors.primary} />
          <View style={styles.rowText}>
            <Text style={[typography.bodyLg, { color: theme.colors.text }]}>الوضع الداكن</Text>
          </View>
          <Switch value={isDark} onValueChange={setDark} />
        </View>
        <Button title="تغيير كلمة التثبيت" variant="outline" onPress={() => { setModal('password'); setError(null); }} />
        <Button title="إعادة تعيين نمط القفل" variant="outline" onPress={() => { setModal('pattern'); setError(null); }} />
      </Card>

      <Card>
        <Button title="إنشاء نسخة احتياطية" variant="secondary" onPress={() => { setBackupText(buildBackup()); setModal('backup'); }} />
        <Button title="استيراد نسخة احتياطية" variant="secondary" onPress={() => { setImportText(''); setModal('import'); }} />
        <Button title="مركز المزامنة" variant="outline" onPress={() => navigation.navigate('SyncCenter')} />
      </Card>

      <Card>
        <Button title="حول التطبيق" variant="outline" onPress={() => navigation.navigate('About')} />
        <Button
          title="تسجيل الخروج وقفل التطبيق"
          variant="danger"
          onPress={() => { logout(); setPhase('pattern-login'); }}
        />
      </Card>

      <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.dialog, { backgroundColor: theme.colors.surface }]}>
            {modal === 'password' ? (
              <>
                <Text style={[typography.h3, styles.dialogTitle, { color: theme.colors.text }]}>تغيير كلمة التثبيت</Text>
                <Input label="كلمة التثبيت الحالية" value={password} onChangeText={setPassword} secure />
                <Input label="الكلمة الجديدة" value={confirm} onChangeText={setConfirm} secure />
                <Input label="تأكيد الكلمة الجديدة" value={newConfirm} onChangeText={setNewConfirm} secure error={error} />
                <Button title="حفظ" onPress={changePassword} />
              </>
            ) : null}
            {modal === 'pattern' ? (
              <>
                <Text style={[typography.h3, styles.dialogTitle, { color: theme.colors.text }]}>إعادة تعيين النمط</Text>
                <Input label="كلمة التثبيت" value={password} onChangeText={setPassword} secure error={error} />
                <PatternLock onComplete={changePattern} label="ارسم النمط الجديد" />
              </>
            ) : null}
            {modal === 'backup' ? (
              <>
                <Text style={[typography.h3, styles.dialogTitle, { color: theme.colors.text }]}>النسخة الاحتياطية</Text>
                <Text style={[typography.caption, { color: theme.colors.textMuted, marginBottom: spacing.sm }]}> انسخ النص التالي واحفظه في مكان آمن. </Text>
                <ScrollView style={styles.backupBox}>
                  <Text selectable style={[styles.mono, { color: theme.colors.text }]}>{backupText}</Text>
                </ScrollView>
              </>
            ) : null}
            {modal === 'import' ? (
              <>
                <Text style={[typography.h3, styles.dialogTitle, { color: theme.colors.text }]}>استيراد نسخة</Text>
                <Text style={[typography.caption, { color: theme.colors.textMuted, marginBottom: spacing.sm }]}>الصق محتوى ملف النسخة الاحتياطية. سيتم استبدال البيانات الحالية.</Text>
                <Input label="محتوى النسخة" value={importText} onChangeText={setImportText} multiline />
                <Button title="استيراد" onPress={doImport} />
              </>
            ) : null}
            <Button title="إغلاق" variant="outline" onPress={() => setModal(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  rowText: { flex: 1 },
  mono: { fontFamily: 'monospace', fontSize: 12 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  dialog: { width: '100%', maxHeight: '85%', borderRadius: radius.xl, padding: spacing.lg, gap: spacing.sm },
  dialogTitle: { textAlign: 'center', marginBottom: spacing.sm },
  backupBox: { maxHeight: 320, backgroundColor: 'rgba(127,127,127,0.08)', borderRadius: radius.sm, padding: spacing.sm },
});
