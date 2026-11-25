import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/tokens';

const DOT = 62;
const GAP = 30;
const SIZE = DOT * 3 + GAP * 2;
const HIT_RADIUS = 26;

type Point = { x: number; y: number };

const positions: Point[] = Array.from({ length: 9 }, (_, i) => {
  const row = Math.floor(i / 3);
  const col = i % 3;
  return { x: col * (DOT + GAP) + DOT / 2, y: row * (DOT + GAP) + DOT / 2 };
});

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function PatternLock({
  onComplete,
  label = 'ارسم نمط القفل',
  error,
  disabled = false,
}: {
  onComplete: (points: number[]) => void;
  label?: string;
  error?: string | null;
  disabled?: boolean;
}) {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<number[]>([]);
  const selectedRef = useRef<number[]>([]);

  const reset = () => {
    selectedRef.current = [];
    setSelected([]);
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (event) => {
          reset();
          const x = event.nativeEvent.locationX;
          const y = event.nativeEvent.locationY;
          const idx = positions.findIndex((p) => distance(p, { x, y }) < HIT_RADIUS);
          if (idx >= 0) {
            selectedRef.current = [idx];
            setSelected([idx]);
          }
        },
        onPanResponderMove: (event) => {
          const x = event.nativeEvent.locationX;
          const y = event.nativeEvent.locationY;
          const idx = positions.findIndex((p) => distance(p, { x, y }) < HIT_RADIUS);
          if (idx >= 0 && !selectedRef.current.includes(idx)) {
            selectedRef.current = [...selectedRef.current, idx];
            setSelected(selectedRef.current);
          }
        },
        onPanResponderRelease: () => {
          const result = [...selectedRef.current];
          if (result.length > 0) onComplete(result);
          setTimeout(reset, 220);
        },
        onPanResponderTerminate: () => reset(),
      }),
    [disabled, onComplete],
  );

  const lines = useMemo(() => {
    const result: { x: number; y: number; length: number; angle: number }[] = [];
    for (let i = 1; i < selected.length; i += 1) {
      const a = positions[selected[i - 1]];
      const b = positions[selected[i]];
      result.push({
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        length: distance(a, b),
        angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
      });
    }
    return result;
  }, [selected]);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, typography.bodyLg, { color: theme.colors.text }]}>{label}</Text>
      <View style={[styles.board, { width: SIZE, height: SIZE }]} {...pan.panHandlers}>
        {lines.map((line, index) => (
          <View
            key={`line-${index}`}
            style={{
              position: 'absolute',
              left: line.x - line.length / 2,
              top: line.y - 2,
              width: line.length,
              height: 4,
              backgroundColor: theme.colors.primary,
              transform: [{ rotate: `${line.angle}deg` }],
              borderRadius: 2,
            }}
          />
        ))}
        {positions.map((point, index) => {
          const active = selected.includes(index);
          return (
            <View
              key={index}
              style={{
                position: 'absolute',
                left: point.x - DOT / 2,
                top: point.y - DOT / 2,
                width: DOT,
                height: DOT,
                borderRadius: DOT / 2,
                borderWidth: 3,
                borderColor: active ? theme.colors.primary : theme.colors.border,
                backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ width: active ? 18 : 10, height: active ? 18 : 10, borderRadius: 9, backgroundColor: active ? '#FFFFFF' : theme.colors.textMuted }} />
            </View>
          );
        })}
      </View>
      {error ? <Text style={[styles.error, typography.body, { color: theme.colors.critical }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.lg },
  label: { fontWeight: '600', textAlign: 'center' },
  board: { position: 'relative', borderRadius: radius.lg },
  error: { textAlign: 'center', fontWeight: '600' },
});
