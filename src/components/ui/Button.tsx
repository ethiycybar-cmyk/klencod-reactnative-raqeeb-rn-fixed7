import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, typography } from '../../theme/tokens';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'md' | 'lg' | 'sm';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function Button({ title, onPress, variant = 'primary', size = 'md', loading, disabled, style, textStyle }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const background =
    variant === 'primary' ? c.primary : variant === 'danger' ? c.critical : variant === 'secondary' ? c.surfaceAlt : 'transparent';
  const textColor = variant === 'primary' || variant === 'danger' ? '#FFFFFF' : c.text;
  const borderColor = variant === 'outline' ? c.border : background;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: background,
          borderColor,
          minHeight: size === 'lg' ? 54 : size === 'sm' ? 38 : 48,
          paddingHorizontal: size === 'lg' ? spacing.xl : spacing.lg,
          opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, typography.bodyLg, { color: textColor }, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: { textAlign: 'center' },
});
