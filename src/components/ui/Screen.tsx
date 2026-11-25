import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, typography } from '../../theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
};

export function Screen({ title, subtitle, actions, children, scroll = true }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.colors;

  return (
    <View style={[styles.root, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: c.header }]}>
        <View style={styles.headerText}>
          <Text style={[styles.title, typography.h3, { color: c.onHeader }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, typography.caption, { color: c.onHeader + 'CC' }]}>{subtitle}</Text> : null}
        </View>
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xxxl }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.fixed, { paddingBottom: insets.bottom + spacing.xl }]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerText: { flex: 1 },
  title: { fontWeight: '700' },
  subtitle: { marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginStart: spacing.md, alignItems: 'center' },
  scroll: { flex: 1 },
  content: { gap: spacing.md },
  fixed: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
});
