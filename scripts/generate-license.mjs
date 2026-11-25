import { createPrivateKey, sign } from 'node:crypto';

const [privateKeyHex, fingerprint, expiry, licenseId, customerName] = process.argv.slice(2);

if (!privateKeyHex || !fingerprint || !expiry || !licenseId || !customerName) {
  console.error('الاستخدام: node scripts/generate-license.mjs <PRIVATE_KEY_HEX> <DEVICE_FINGERPRINT> <YYYY-MM-DD> <LICENSE_ID> <CUSTOMER_NAME>');
  process.exit(1);
}

if (!/^\d{4}-\d{2}-\d{2}$/.test(expiry)) {
  console.error('تاريخ الانتهاء يجب أن يكون بصيغة YYYY-MM-DD');
  process.exit(1);
}

const payload = { d: fingerprint, e: expiry, i: licenseId, n: customerName };
const payloadHex = Buffer.from(JSON.stringify(payload), 'utf8').toString('hex');
const keyObject = createPrivateKey({
  key: Buffer.concat([
    Buffer.from('302e020100300506032b657004220420', 'hex'),
    Buffer.from(privateKeyHex, 'hex'),
  ]),
  format: 'der',
  type: 'pkcs8',
});
const signature = sign(null, Buffer.from(payloadHex, 'utf8'), keyObject).toString('hex');

console.log(`RAQEB1.${payloadHex}.${signature}`);
