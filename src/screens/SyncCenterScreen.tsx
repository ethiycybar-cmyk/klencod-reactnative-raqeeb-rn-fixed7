import React, { useState } from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/ui/Screen';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/tokens';
import { pendingCount } from '../data/repositories/syncRepo';
import { storage, LAST_SYNC_KEY } from '../data/storage';
import { syncNow } from '../services/syncService';
import { useUIStore } from '../store/uiStore';
import type { RootStackParamList } from '../app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SyncCenter'>;

export function SyncCenterScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const show = useUIStore((s) => s.show);
  const [baseUrl, setBaseUrl] = useState(storage.getString('sync_url') ?? '');
  const [pending, setPending] = useState(pendingCount());
  const last = storage.getString(LAST_SYNC_KEY);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    const result = await syncNow(baseUrl.trim() || undefined);
    setPending(result.pending);
    show(result.message, result.ok ? 'success' : 'info');
    setBusy(false);
  };

  return (
    <Screen title="مركز المزامنة" subtitle="المزامنة اختيارية والتطبيق يعمل دونها">
      <Card>
        <Text style={[typography.bodyLg, { color: theme.colors.text }]}>العناصر في طابور المزامنة: {pending}</Text>
        <Text style={[typography.body, { color: theme.colors.textMuted }]}>آخر مزامنة: {last ?? 'لم تتم مزامنة بعد'}</Text>
      </Card>
      <Card>
        <Input label="عنوان خادم المزامنة (اختياري)" value={baseUrl} onChangeText={(v) => { setBaseUrl(v); storage.set('sync_url', v); }} placeholder="https://sync.example.com" ltr />
        <Button title="مزامنة الآن" onPress={run} loading={busy} />
      </Card>
      <Button title="رجوع" variant="outline" onPress={() => navigation.goBack()} />
    </Screen>
  );
}
