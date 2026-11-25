import { generateKeyPairSync } from 'node:crypto';

const { publicKey, privateKey } = generateKeyPairSync('ed25519');
const pub = publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex');
const priv = privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32).toString('hex');

console.log('=== زوج مفاتيح ترخيص جديد ( Ed25519 ) ===');
console.log('GENERATED AT:', new Date().toISOString());
console.log('\nPUBLIC_KEY (ضعه في src/config/licenseKeys.ts):');
console.log(pub);
console.log('\nPRIVATE_KEY (احتفظ به سرياً واستخدمه لتوليد التراخيص):');
console.log(priv);
console.log('\nمثال توليد ترخيص:');
console.log(`node scripts/generate-license.mjs ${priv} <DEVICE_FINGERPRINT> 2027-12-31 RQ-001 "اسم العميل"`);
