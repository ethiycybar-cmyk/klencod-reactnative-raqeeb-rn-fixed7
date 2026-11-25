import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, typography } from '../../theme/tokens';
import { useUIStore } from '../../store/uiStore';

export function ToastHost() {
  const { theme } = useTheme();
  const toasts = useUIStore((s) => s.toasts);
  const dismiss = useUIStore((s) => s.dismiss);
  if (toasts.length === 0) return null;

  return (
    <View style={styles.host} pointerEvents="box-none">
      {toasts.map((toast) => {
        const color = toast.kind === 'success' ? theme.colors.good : toast.kind === 'error' ? theme.colors.critical : theme.colors.primary;
        const Icon = toast.kind === 'success' ? CheckCircle2 : toast.kind === 'error' ? AlertCircle : Info;
        return (
          <View key={toast.id} style={[styles.toast, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Icon size={18} color={color} />
            <Text style={[styles.text, typography.body, { color: theme.colors.text }]}>{toast.message}</Text>
            {toast.actionLabel ? (
              <Pressable onPress={() => { toast.onAction?.(); dismiss(toast.id); }}>
                <Text style={[styles.action, { color }]}>{toast.actionLabel}</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={() => dismiss(toast.id)} hitSlop={8}>
              <X size={16} color={theme.colors.textMuted} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', bottom: 24, start: 16, end: 16, gap: 8, zIndex: 50 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, elevation: 6 },
  text: { flex: 1 },
  action: { fontWeight: '700' },
});
