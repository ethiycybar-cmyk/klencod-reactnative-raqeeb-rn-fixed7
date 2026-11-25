import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, typography } from '../../theme/tokens';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  keyboard?: 'default' | 'numeric' | 'decimal-pad';
  secure?: boolean;
  multiline?: boolean;
  ltr?: boolean;
  hint?: string;
};

export function Input({ label, value, onChangeText, placeholder, error, keyboard = 'default', secure, multiline, ltr, hint }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, typography.body, { color: c.text }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.textMuted}
        keyboardType={keyboard}
        secureTextEntry={secure}
        multiline={multiline}
        textAlign={ltr ? 'left' : 'right'}
        style={[
          styles.input,
          typography.body,
          {
            color: c.text,
            backgroundColor: c.surface,
            borderColor: error ? c.critical : c.border,
            minHeight: multiline ? 96 : 50,
            textAlignVertical: multiline ? 'top' : 'center',
            writingDirection: ltr ? 'ltr' : 'rtl',
          },
        ]}
      />
      {error ? (
        <Text style={[styles.helper, typography.caption, { color: c.critical }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.helper, typography.caption, { color: c.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { marginBottom: spacing.xs, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  helper: { marginTop: spacing.xs },
});
