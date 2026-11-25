import DeviceInfo from 'react-native-device-info';
import { sha256Hex } from './crypto';
import { DEVICE_KEY, storage } from '../data/storage';

/** بصمة جهاز مستقرة: Android ID + بصمة التوقيع + الموديل. */
export async function getDeviceFingerprint(): Promise<string> {
  const cached = storage.getString(DEVICE_KEY);
  if (cached) return cached;

  const androidId = await DeviceInfo.getAndroidId().catch(() => '');
  const bundleId = DeviceInfo.getBundleId();
  const model = DeviceInfo.getModel();
  const brand = DeviceInfo.getBrand();

  const fingerprint = sha256Hex(`${androidId}|${bundleId}|${brand}|${model}`).slice(0, 24);
  storage.set(DEVICE_KEY, fingerprint);
  return fingerprint;
}
