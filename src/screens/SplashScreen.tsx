import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, typography } from '../theme/tokens';

export function SplashScreen({ status = 'جارٍ تجهيز التطبيق...' }: { status?: string }) {
  const { theme } = useTheme();
  const scale = React.useRef(new Animated.Value(0.85)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.header }]}>
      <Animated.View style={{ alignItems: 'center', opacity, transform: [{ scale }] }}>
        <View style={[styles.badge, { backgroundColor: '#FFFFFF1F' }]}>
          <ShieldCheck size={64} color="#FFFFFF" />
        </View>
        <Text style={[styles.title, typography.display, { color: '#FFFFFF' }]}>رقيب</Text>
        <Text style={[styles.tagline, typography.body, { color: '#FFFFFFCC' }]}>حارس المخزون الدوائي</Text>
      </Animated.View>
      <Text style={[styles.status, typography.caption, { color: '#FFFFFFAA' }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  badge: { width: 118, height: 118, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  title: { fontWeight: '700' },
  tagline: { marginTop: 4 },
  status: { position: 'absolute', bottom: 48 },
});
