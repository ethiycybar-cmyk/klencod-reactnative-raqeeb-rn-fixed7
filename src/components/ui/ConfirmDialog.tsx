import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, typography } from '../../theme/tokens';
import { Button } from './Button';

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  danger,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View style={[styles.box, { backgroundColor: theme.colors.surface }]}>
          <Text style={[typography.h3, styles.title, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[typography.body, { color: theme.colors.textMuted, textAlign: 'center' }]}>{message}</Text>
          <View style={styles.actions}>
            <Button title={confirmLabel} onPress={onConfirm} variant={danger ? 'danger' : 'primary'} style={styles.button} />
            <Button title={cancelLabel} onPress={onCancel} variant="outline" style={styles.button} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  box: { width: '100%', maxWidth: 380, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md },
  title: { textAlign: 'center' },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
  button: { width: '100%' },
});
