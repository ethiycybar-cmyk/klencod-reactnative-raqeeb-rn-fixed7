import { createMMKV } from 'react-native-mmkv';

/** تخزين متزامن سريع للجلسة والإعدادات الصغيرة. الأسرار تُخزَّن كتجزئة في SQLite. */
export const storage = createMMKV({ id: 'raqeeb-store' });

export const SESSION_KEY = 'session_ok';
export const DEVICE_KEY = 'device_fingerprint';
export const LAST_SYNC_KEY = 'last_sync';

export function isSessionOpen(): boolean {
  return storage.getBoolean(SESSION_KEY) === true;
}

export function openSession(): void {
  storage.set(SESSION_KEY, true);
}

export function closeSession(): void {
  storage.set(SESSION_KEY, false);
}
