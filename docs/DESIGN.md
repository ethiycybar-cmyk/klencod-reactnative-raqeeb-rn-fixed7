# نظام التصميم — رقيب

## الاتجاه البصري
"درع طبي موثوق": أزرق درعي عميق (#1565C0)، بطاقات بيضاء نظيفة، حواف ناعمة (12–16dp)، ظلال خفيفة، ألوان حالة واضحة، كثافة معلومات متوازنة، RTL صحيح، ووضع داكن كامل.

## الرموز (Tokens)
كل القيم في `src/theme/tokens.ts`:

- **الألوان**: `shield 50–900` + `status (good/warning/critical/expired)` + مجموعتان `light` / `dark`.
- **المسافات**: شبكة 4dp — `4,8,12,16,20,24,32,48`.
- **الزوايا**: `4,8,12,16,24,pill`.
- **الخطوط**: `caption 12 · bodySm 13 · body 14 · bodyLg 16 · h3 18 · h2 22 · h1 28 · display 32` مع أوزان 400–700.

> الخط الموصى به للإنتاج: **IBM Plex Sans Arabic**. ضعه في `android/app/src/main/res/font/` واربطه بنمط `AppTheme` إذا أردت مطابقة Figma حرفياً؛ الحالي يستخدم خط النظام العربي لضمان توافق كامل مع جميع الأجهزة.

## المكوّنات
`Button · Card · Input · Badge · SearchBar · StatCard · EmptyState · ConfirmDialog · ToastHost · PatternLock · ProductCard · BatchRow · Screen · FAB`

كل مكوّن يقرأ الثيم من `useTheme()` — لا توجد ألوان ثابتة داخل الشاشات (إلا الأبيض على الأزرار الملونة).

## قواعد RTL
- `I18nManager.forceRTL(true)` في `src/app/App.tsx`.
- الحقول اللاتينية (الباركود/التواريخ/مفتاح الترخيص) تستخدم `textAlign: 'left'` + `writingDirection: 'ltr'`.
- الترتيب المنطقي يُستخدم عبر `start/end` في الخصائص.

## الأداء
- `FlashList` لكل القوائم مع `estimatedItemSize` ثابت و`keyExtractor` مستقر.
- `Hermes + New Architecture` مفعّلان في `android/gradle.properties`.
- `op-sqlite` متزامن مع prepared/fast queries وفهارس على `expiry_date` و`product_id` و`barcode`.
- `MMKV` متزامن لقراءة الجلسة والإعدادات عند الإقلاع.
- Zustand selectors لمنع إعادة الرسم غير الضرورية.
- debounce 250ms للبحث.

## حالات الواجهة
كل شاشة قائمة تدعم: تحميل (FlashList + بيانات محلية فورية)، حالة فارغة (`EmptyState`)، بحث، وتحديث عند العودة للشاشة (`useFocusEffect`).
