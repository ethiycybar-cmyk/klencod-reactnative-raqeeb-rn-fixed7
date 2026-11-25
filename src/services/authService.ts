import { deriveHash, randomHex, sha256Hex } from '../utils/crypto';
import { errorMessage } from '../utils/errors';
import { getSettings, patchSettings, resetLocks } from '../data/repositories/settingsRepo';
import { closeSession, openSession } from '../data/storage';

const PBKDF2_ITERATIONS = 210_000;
const MIN_PATTERN_POINTS = 4;
const LOCK_DELAYS_SECONDS = [30, 60, 120, 300];

export function hasInstallPassword(): boolean {
  return Boolean(getSettings().installHash);
}

export function hasPattern(): boolean {
  return Boolean(getSettings().patternHash);
}

/** أول تشغيل: ينشئ كلمة التثبيت ولا يخزّن أي نص صريح. */
export async function createInstallPassword(password: string, confirm: string): Promise<void> {
  if (password.trim().length < 6) throw new Error(errorMessage('WEAK_PASSWORD', 'كلمة التثبيت يجب أن تكون 6 أحرف على الأقل'));
  if (password !== confirm) throw new Error('كلمتا التثبيت غير متطابقتين');
  const salt = randomHex(16);
  const hash = await deriveHash(password.trim(), salt, PBKDF2_ITERATIONS);
  patchSettings({ installSalt: salt, installHash: hash, trialStart: new Date().toISOString() });
  openSession();
}

/** تغيير كلمة التثبيت دون المساس ببداية فترة التجربة. */
export async function changeInstallPassword(current: string, next: string, confirm: string): Promise<void> {
  if (!(await verifyInstallPassword(current))) throw new Error(errorMessage('WRONG_PASSWORD'));
  if (next.trim().length < 6) throw new Error('كلمة التثبيت يجب أن تكون 6 أحرف على الأقل');
  if (next !== confirm) throw new Error('كلمتا التثبيت غير متطابقتين');
  const salt = randomHex(16);
  const hash = await deriveHash(next.trim(), salt, PBKDF2_ITERATIONS);
  patchSettings({ installSalt: salt, installHash: hash });
}

export async function verifyInstallPassword(password: string): Promise<boolean> {
  const settings = getSettings();
  if (!settings.installHash || !settings.installSalt) return false;
  const hash = await deriveHash(password.trim(), settings.installSalt, PBKDF2_ITERATIONS);
  if (hash !== settings.installHash) return false;
  openSession();
  resetLocks();
  return true;
}

export function patternToText(points: number[]): string {
  return points.join('-');
}

export function isValidPattern(points: number[]): boolean {
  return points.length >= MIN_PATTERN_POINTS && new Set(points).size === points.length;
}

export async function createPattern(points: number[]): Promise<void> {
  if (!isValidPattern(points)) throw new Error(errorMessage('PATTERN_TOO_SHORT'));
  const salt = randomHex(16);
  const hash = await deriveHash(patternToText(points), salt, PBKDF2_ITERATIONS);
  patchSettings({ patternSalt: salt, patternHash: hash, failedAttempts: 0, lockedUntil: null });
  openSession();
}

export function lockRemainingSeconds(): number {
  const lockedUntil = getSettings().lockedUntil;
  if (!lockedUntil) return 0;
  const diff = new Date(lockedUntil).getTime() - Date.now();
  if (diff <= 0) {
    patchSettings({ lockedUntil: null, failedAttempts: 0 });
    return 0;
  }
  return Math.ceil(diff / 1000);
}

export type PatternResult = {
  ok: boolean;
  attemptsLeft: number;
  lockedSeconds: number;
  message?: string;
};

export async function verifyPattern(points: number[]): Promise<PatternResult> {
  const locked = lockRemainingSeconds();
  if (locked > 0) {
    return { ok: false, attemptsLeft: 0, lockedSeconds: locked, message: errorMessage('LOCKED') };
  }

  const settings = getSettings();
  if (!settings.patternHash || !settings.patternSalt) {
    return { ok: false, attemptsLeft: 5, lockedSeconds: 0, message: 'لم يتم إعداد نمط القفل' };
  }

  const hash = await deriveHash(patternToText(points), settings.patternSalt, PBKDF2_ITERATIONS);
  if (hash === settings.patternHash) {
    patchSettings({ failedAttempts: 0, lockedUntil: null });
    openSession();
    return { ok: true, attemptsLeft: 5, lockedSeconds: 0 };
  }

  const attempts = settings.failedAttempts + 1;
  let lockedSeconds = 0;
  if (attempts % 5 === 0) {
    const step = Math.min(Math.floor(attempts / 5) - 1, LOCK_DELAYS_SECONDS.length - 1);
    lockedSeconds = LOCK_DELAYS_SECONDS[step];
    patchSettings({
      failedAttempts: attempts,
      lockedUntil: new Date(Date.now() + lockedSeconds * 1000).toISOString(),
    });
  } else {
    patchSettings({ failedAttempts: attempts });
  }
  return {
    ok: false,
    attemptsLeft: Math.max(0, 5 - (attempts % 5)),
    lockedSeconds,
    message: lockedSeconds > 0 ? errorMessage('LOCKED') : errorMessage('INVALID_PATTERN'),
  };
}

/** إعادة تعيين النمط بعد التحقق بكلمة التثبيت. */
export async function resetPatternWithPassword(password: string, points: number[]): Promise<void> {
  if (!(await verifyInstallPassword(password))) throw new Error(errorMessage('WRONG_PASSWORD'));
  await createPattern(points);
}

export function logout(): void {
  closeSession();
}

export function fingerprintOfPattern(points: number[]): string {
  return sha256Hex(patternToText(points));
}
