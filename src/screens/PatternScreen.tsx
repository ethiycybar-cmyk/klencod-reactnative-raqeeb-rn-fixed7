import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LockKeyhole } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/tokens';
import { PatternLock } from '../components/PatternLock';
import { Button } from '../components/ui/Button';
import { createPattern, lockRemainingSeconds, verifyPattern } from '../services/authService';
import { accessAllowed } from '../services/licenseService';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { toArabicError } from '../utils/errors';
import type { AuthStackParamList } from '../app/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Pattern'>;

export function PatternScreen({ route, navigation }: Props) {
  const mode = route.params?.mode ?? 'login';
  const isSetup = mode === 'setup';
  const { theme } = useTheme();
  const setPhase = useAuthStore((s) => s.setPhase);
  const show = useUIStore((s) => s.show);
  const [stage, setStage] = useState<'draw' | 'confirm'>(isSetup ? 'draw' : 'draw');
  const [first, setFirst] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [, setTick] = useState(0);
  const [locked, setLocked] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = lockRemainingSeconds();
      setLocked(remaining);
      setTick((v) => v + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const goNext = () => {
    if (accessAllowed()) {
      setPhase('ready');
    } else {
      // الترخيص منتهٍ: اذهب صراحةً إلى شاشة التفعيل داخل مكدس المصادقة.
      navigation.replace('License');
    }
  };

  const handleComplete = async (points: number[]) => {
    setError(null);
    if (locked > 0) return;

    if (isSetup) {
      if (stage === 'draw') {
        setFirst(points);
        setStage('confirm');
        return;
      }
      if (points.join('-') !== first.join('-')) {
        setError('النمطان غير متطابقين، أعد الرسم');
        return;
      }
      try {
        await createPattern(points);
        show('تم إعداد نمط القفل بنجاح', 'success');
        goNext();
      } catch (e) {
        setError(toArabicError(e));
      }
      return;
    }

    const result = await verifyPattern(points);
    setAttemptsLeft(result.attemptsLeft);
    setLocked(result.lockedSeconds);
    if (result.ok) {
      show('تم فتح التطبيق', 'success');
      goNext();
    } else {
      setError(result.message ?? 'النمط غير صحيح');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
      <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
        <LockKeyhole size={38} color={theme.colors.primary} />
      </View>
      <Text style={[typography.h2, styles.title, { color: theme.colors.text }]}>
        {isSetup ? (stage === 'draw' ? 'ارسم نمط القفل' : 'أعد رسم النمط للتأكيد') : 'أدخل نمط القفل'}
      </Text>
      <Text style={[typography.body, styles.subtitle, { color: theme.colors.textMuted }]}>
        {isSetup ? 'استخدم 4 نقاط على الأقل. يمكنك تغيير النمط لاحقاً من الإعدادات.' : `المحاولات المتبقية: ${attemptsLeft}`}
      </Text>

      <PatternLock
        key={`${stage}-${locked}`}
        onComplete={handleComplete}
        disabled={locked > 0}
        error={error}
        label={locked > 0 ? `الانتظار ${locked} ثانية` : undefined}
      />

      {isSetup && stage === 'confirm' ? (
        <Button title="إعادة الرسم" variant="outline" onPress={() => { setStage('draw'); setFirst([]); setError(null); }} style={styles.secondary} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 56, gap: 14, backgroundColor: 'transparent' },
  icon: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: 16 },
  secondary: { marginTop: 8, minWidth: 180 },
});
