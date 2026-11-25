import { bytesToUtf8, hexToBytes, utf8Bytes, bytesToHex } from '../utils/crypto';

export type LicensePayload = {
  d: string; // بصمة الجهاز
  e: string; // تاريخ الانتهاء YYYY-MM-DD
  i: string; // رقم الترخيص
  n: string; // اسم العميل
};

export const LICENSE_PREFIX = 'RAQEB1';

export function encodePayload(payload: LicensePayload): string {
  return bytesToHex(utf8Bytes(JSON.stringify(payload)));
}

export function decodePayload(payloadHex: string): LicensePayload | null {
  try {
    const parsed = JSON.parse(bytesToUtf8(hexToBytes(payloadHex))) as Partial<LicensePayload>;
    if (!parsed.d || !parsed.e || !parsed.i || !parsed.n) return null;
    return parsed as LicensePayload;
  } catch {
    return null;
  }
}

export function formatLicense(payload: LicensePayload, signatureHex: string): string {
  return `${LICENSE_PREFIX}.${encodePayload(payload)}.${signatureHex}`;
}

export function parseLicense(key: string): { payload: LicensePayload; signature: string } | null {
  const parts = key.trim().split('.');
  if (parts.length !== 3 || parts[0] !== LICENSE_PREFIX) return null;
  const payload = decodePayload(parts[1]);
  if (!payload) return null;
  return { payload, signature: parts[2] };
}
