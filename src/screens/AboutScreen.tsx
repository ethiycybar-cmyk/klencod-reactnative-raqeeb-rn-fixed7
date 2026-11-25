import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/ui/Screen';
import { Card } from '../components/ui/Card';
import { useTheme } from '../theme/ThemeContext';
import { spacing, typography } from '../theme/tokens';
import type { RootStackParamList } from '../app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

const FEATURES = [
  'إدارة المنتجات والتشغيلات بالكامل دون اتصال بالإنترنت.',
  'تنبيهات الصلاحية حسب الخطورة والقرب من الانتهاء.',
  'حماية بنمط قفل وكلمة تثبيت محفوظتين كتجزئة مشفّرة.',
  'نسخ احتياطي واستيراد كامل للبيانات.',
  'واجهة عربية RTL مع وضع داكن وأداء عالٍ.',
];

export function AboutScreen(_props: Props) {
  const { theme } = useTheme();
  return (
    <Screen title="حول التطبيق">
      <View style={styles.hero}>
        <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
          <ShieldCheck size={46} color={theme.colors.primary} />
        </View>
        <Text style={[typography.h1, { color: theme.colors.text }]}>رقيب</Text>
        <Text style={[typography.body, { color: theme.colors.textMuted }]}>حارس المخزون الدوائي — الإصدار 1.0.0</Text>
      </View>
      <Card>
        <Text style={[typography.h3, { color: theme.colors.text, marginBottom: spacing.sm }]}>ما يقدّمه التطبيق</Text>
        {FEATURES.map((feature) => (
          <Text key={feature} style={[styles.feature, typography.body, { color: theme.colors.text }]}>• {feature}</Text>
        ))}
      </Card>
      <Card>
        <Text style={[typography.body, { color: theme.colors.textMuted, lineHeight: 22 }]}>
          جميع بياناتك محفوظة على جهازك ولا تُرسل لأي خادم إلا إذا فعّلت المزامنة اختيارياً. rights all reserved.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  icon: { width: 92, height: 92, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  feature: { marginBottom: spacing.sm, lineHeight: 21 },
});
