import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography } from '../../theme/tokens';
import { Button } from './Button';

type Props = { title: string; message?: string; actionLabel?: string; onAction?: () => void };

export function EmptyState({ title, message, actionLabel, onAction }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
        <Inbox size={30} color={theme.colors.primary} />
      </View>
      <Text style={[styles.title, typography.h3, { color: theme.colors.text }]}>{title}</Text>
      {message ? <Text style={[styles.message, typography.body, { color: theme.colors.textMuted, textAlign: 'center' }]}>{message}</Text> : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} style={styles.button} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxxl * 2, gap: spacing.sm },
  icon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  title: { textAlign: 'center' },
  message: { maxWidth: 280 },
  button: { marginTop: spacing.md, minWidth: 180 },
});
