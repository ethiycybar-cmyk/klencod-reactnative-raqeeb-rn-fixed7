import { getDB } from '../db/client';
import { mapSettings } from '../db/mappers';
import type { AppSettings } from '../../types/models';

const COLUMN_MAP: Partial<Record<keyof AppSettings, string>> = {
  installHash: 'install_hash',
  installSalt: 'install_salt',
  patternHash: 'pattern_hash',
  patternSalt: 'pattern_salt',
  licenseKeyHash: 'license_key_hash',
  licenseExpiry: 'license_expiry',
  licenseSignature: 'license_signature',
  trialStart: 'trial_start',
  isLicenseActive: 'is_license_active',
  deviceFingerprint: 'device_fingerprint',
  failedAttempts: 'failed_attempts',
  lockedUntil: 'locked_until',
  lastUpdated: 'last_updated',
};

export function getSettings(): AppSettings {
  const db = getDB();
  const rows = db.executeSync('SELECT * FROM settings WHERE id = 1').rows;
  if (rows.length > 0) return mapSettings(rows[0]);
  db.executeSync('INSERT INTO settings (id) VALUES (1)');
  return getSettings();
}

export function patchSettings(patch: Partial<AppSettings>): AppSettings {
  const pairs: string[] = [];
  const values: (string | number | null)[] = [];
  for (const [key, value] of Object.entries(patch)) {
    const column = COLUMN_MAP[key as keyof AppSettings];
    if (!column) continue;
    pairs.push(`${column} = ?`);
    values.push(value as string | number | null);
  }
  if (pairs.length === 0) return getSettings();
  pairs.push("last_updated = datetime('now')");
  getDB().executeSync(`UPDATE settings SET ${pairs.join(', ')} WHERE id = 1`, values);
  return getSettings();
}

export function resetLocks(): void {
  patchSettings({ failedAttempts: 0, lockedUntil: null });
}
