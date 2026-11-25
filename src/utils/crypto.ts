import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex, bytesToUtf8, hexToBytes, utf8ToBytes } from '@noble/hashes/utils';
import { ed25519 } from '@noble/curves/ed25519';

export { bytesToHex, bytesToUtf8, hexToBytes };

export function utf8Bytes(value: string): Uint8Array {
  return utf8ToBytes(value);
}

export function randomHex(byteLength = 16): string {
  const bytes = new Uint8Array(byteLength);
  (globalThis as any).crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export function sha256Hex(value: string): string {
  return bytesToHex(sha256(utf8ToBytes(value)));
}

/** PBKDF2-HMAC-SHA256 — 210 ألف دورة كما هو موصى به للأمان. */
export function deriveHash(secret: string, saltHex: string, iterations = 210_000): Promise<string> {
  return pbkdf2Async(sha256, utf8ToBytes(secret), hexToBytes(saltHex), {
    c: iterations,
    dkLen: 32,
  }).then(bytesToHex);
}

export function verifySignature(messageHex: string, signatureHex: string, publicKeyHex: string): boolean {
  try {
    return ed25519.verify(hexToBytes(signatureHex), hexToBytes(messageHex), hexToBytes(publicKeyHex));
  } catch {
    return false;
  }
}
