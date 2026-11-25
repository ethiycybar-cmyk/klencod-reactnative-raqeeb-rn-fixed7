import { LICENSE_PUBLIC_KEY, TRIAL_DAYS } from '../config/licenseKeys';
import { parseLicense } from '../domain/license';
import { getSettings, patchSettings } from '../data/repositories/settingsRepo';
import { sha256Hex, verifySignature } from '../utils/crypto';
import { addDaysISO, daysBetween, todayISO } from '../utils/dates';
import { errorMessage } from '../utils/errors';
import type { AppSettings } from '../types/models';

export type LicenseState = 'trial' | 'active' | 'expired';

export function trialDaysLeft(settings: AppSettings = getSettings()): number {
  const start = settings.trialStart?.slice(0, 10) ?? todayISO();
  return Math.max(0, TRIAL_DAYS - daysBetween(start, todayISO()));
}

export function licenseValidity(settings: AppSettings = getSettings()): LicenseState {
  if (settings.isLicenseActive === 1 && settings.licenseExpiry) {
    return daysBetween(todayISO(), settings.licenseExpiry) >= 0 ? 'active' : 'expired';
  }
  return trialDaysLeft(settings) > 0 ? 'trial' : 'expired';
}

export function accessAllowed(settings: AppSettings = getSettings()): boolean {
  return licenseValidity(settings) !== 'expired';
}

export type ActivationResult = { ok: boolean; message?: string; expiry?: string };

export function activateLicense(key: string, deviceFingerprint: string): ActivationResult {
  const parsed = parseLicense(key);
  if (!parsed) return { ok: false, message: errorMessage('LICENSE_INVALID') };

  if (LICENSE_PUBLIC_KEY.startsWith('REPLACE')) {
    return { ok: false, message: 'لم يتم ضبط مفتاح الترخيص العام بعد — راجع config/licenseKeys.ts' };
  }

  const messageHex = key.split('.')[1];
  if (!verifySignature(messageHex, parsed.signature, LICENSE_PUBLIC_KEY)) {
    return { ok: false, message: errorMessage('LICENSE_INVALID') };
  }
  if (parsed.payload.d !== deviceFingerprint) {
    return { ok: false, message: 'هذا الترخيص مرتبط بجهاز آخر' };
  }
  if (daysBetween(todayISO(), parsed.payload.e) < 0) {
    return { ok: false, message: errorMessage('LICENSE_EXPIRED') };
  }

  patchSettings({
    isLicenseActive: 1,
    licenseExpiry: parsed.payload.e,
    licenseKeyHash: sha256Hex(key),
    licenseSignature: parsed.signature,
    deviceFingerprint,
  });
  return { ok: true, expiry: parsed.payload.e };
}

export function licenseExpiryForNew(days = 365): string {
  return addDaysISO(days);
}
