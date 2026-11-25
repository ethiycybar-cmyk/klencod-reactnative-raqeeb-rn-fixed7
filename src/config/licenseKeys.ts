/**
 * المفتاح العام للتحقق من الترخيص. ليس سراً — التوقيع وحده يضمن سلامة الرمز.
 * لتوليد زوج مفاتيح خاص بك شغّل: node scripts/generate-keys.mjs
 * ثم انسخ المفتاح العام الناتج هنا واستبدل الثابت أدناه.
 */
export const LICENSE_PUBLIC_KEY = 'REPLACE_WITH_GENERATED_PUBLIC_KEY';

/** مدة التجربة بالأيام من أول تشغيل ناجح. */
export const TRIAL_DAYS = 30;

/** سنوات صلاحية الترخيص المدفوع. */
export const LICENSE_YEARS = 1;
