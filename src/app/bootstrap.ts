import { initDatabase } from '../data/db/client';
import { patchSettings } from '../data/repositories/settingsRepo';
import { getDeviceFingerprint } from '../utils/device';
import { hasInstallPassword, hasPattern } from '../services/authService';

export type Phase = 'install' | 'pattern-setup' | 'pattern-login' | 'license' | 'ready';

/** يحدد الشاشة التي تظهر بعد Splash دون أي منطق عمل داخل الواجهة. */
export async function bootstrap(): Promise<Phase> {
  await initDatabase();
  const settings = patchSettings({});
  const fingerprint = await getDeviceFingerprint();
  if (settings.deviceFingerprint !== fingerprint) patchSettings({ deviceFingerprint: fingerprint });

  if (!hasInstallPassword()) return 'install';
  // نمط القفل مطلوب عند كل فتح للتطبيق (لا جلسة دائمة تتجاوزه).
  if (!hasPattern()) return 'pattern-setup';
  return 'pattern-login';
}
