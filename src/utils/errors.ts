const MESSAGES: Record<string, string> = {
  REQUIRED: 'هذا الحقل مطلوب',
  INVALID_DATE: 'التاريخ غير صالح',
  DATE_ORDER: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ الإنتاج',
  DUPLICATE_BARCODE: 'الباركود مستخدم لمنتج آخر',
  INVALID_PATTERN: 'النمط غير صحيح',
  PATTERN_TOO_SHORT: 'ارسم نمطاً من 4 نقاط على الأقل',
  PATTERN_MISMATCH: 'النمطان غير متطابقين',
  WRONG_PASSWORD: 'كلمة التثبيت غير صحيحة',
  LOCKED: 'تم قفل التطبيق مؤقتاً بسبب محاولات فاشلة',
  LICENSE_INVALID: 'مفتاح الترخيص غير صالح أو لا يطابق هذا الجهاز',
  LICENSE_EXPIRED: 'انتهت صلاحية الترخيص',
  DB_ERROR: 'حدث خطأ في قاعدة البيانات',
};

export function errorMessage(code: string, fallback = 'حدث خطأ، يرجى المحاولة مرة أخرى'): string {
  return MESSAGES[code] ?? fallback;
}

export function toArabicError(error: unknown): string {
  if (error instanceof Error) return errorMessage(error.message, error.message);
  return errorMessage(String(error));
}
