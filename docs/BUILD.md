# بناء تطبيق رقيب لأندرويد

هذا المشروع **Bare React Native** قياسي (لا WebView، لا Expo). يحتوي على مشروع Gradle أصلي كامل في `android/`، ويمكن فتحه مباشرة في Android Studio أو بناؤه من سطر الأوامر.

## 1) المتطلبات

| الأداة | الإصدار |
|---|---|
| Node.js | >= 22.11 (المُختبر: 24.15) |
| JDK | 17 |
| Android Studio | أحدث إصدار مع Android SDK 35+ و NDK 27+ |
| Android device/emulator | أندرويد 10 فأعلى |

تأكد من ضبط `ANDROID_HOME` و`JAVA_HOME` قبل البناء.

## 2) التثبيت والتشغيل

```bash
cd raqeeb-rn
npm install
npm run android          # تشغيل على جهاز/محاكي متصل
npm start                # تشغيل Metro فقط
npm run typecheck        # فحص TypeScript
npm test                 # اختبارات الوحدة
```

> على Windows إذا كان `npm.ps1` محجوباً بسياسة التنفيذ استخدم:
> `& "C:\Program Files\nodejs\npm.cmd" install`

## 3) بناء Release APK / AAB

### أ) أنشئ مفتاح توقيع خاص بك مرة واحدة

```bash
keytool -genkeypair -v -keystore raqeeb-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias raqeeb
```

انسخ الملف إلى `android/app/` ثم أضف إلى `android/gradle.properties` (لا ترفعه إلى أي مستودع عام):

```properties
RAQEEB_RELEASE_STORE_FILE=raqeeb-release.jks
RAQEEB_RELEASE_STORE_PASSWORD=••••••
RAQEEB_RELEASE_KEY_ALIAS=raqeeb
RAQEEB_RELEASE_KEY_PASSWORD=••••••
```

ثم استبدل كتلة `signingConfigs` في `android/app/build.gradle` بالتالي:

```groovy
signingConfigs {
    debug { storeFile file('debug.keystore') }
    release {
        storeFile file(RAQEEB_RELEASE_STORE_FILE)
        storePassword RAQEEB_RELEASE_STORE_PASSWORD
        keyAlias RAQEEB_RELEASE_KEY_ALIAS
        keyPassword RAQEEB_RELEASE_KEY_PASSWORD
    }
}
```

وقم `signingConfig signingConfigs.release` داخل `buildTypes.release`.

### ب) البناء

```bash
npm run bundle:android          # توليد حزمة JS (اختياري، Gradle يفعلها تلقائياً)

cd android
./gradlew clean assembleRelease # APK → android/app/build/outputs/apk/release/
./gradlew bundleRelease         # AAB → android/app/build/outputs/bundle/release/
```

على Windows استخدم `gradlew.bat` بدلاً من `./gradlew`.

R8/ProGuard و resource shrinking مفعّلان بالفعل في release، وHermes + New Architecture مفعّلان في `android/gradle.properties`.

## 4) حول «KLENCODE»

لم يتم توضيح المقصود بـ KLENCODE. في كل الأحوال هذا المشروع جاهز بأحد مسارين:

- **إذا كانت منصة تحويل/بناء سحابية:** ارفع مجلد `raqeeb-rn` كاملاً (بعد `npm install`) أو ارفع ملف `raqeeb-rn.zip` كما هو واترك المنصة تنفّذ `npm install` ثم `./gradlew assembleRelease`. المشروع لا يحتاج أي تعديل خاص.
- **إذا كانت أداة تحويل من ويب إلى أندرويد (مثل Capacitor):** فهي غير مطلوبة هنا — التطبيق بالفعل React Native أصلي. قدّم ملف AAB الناتج مباشرة إلى المتجر أو إلى المنصة.
- **إذا كانت منصة تغليف APK:** استخدم ملف `app-release.apk` أو `app-release.aab` الناتج من الخطوة 3.

إن أردت دعماً دقيقاً لتنسيق KLENCODE، أرسل رابط المنصة أو ملفاً نموذجياً تتوقعه وسأضيف إعداداتها (`klencode.config.*`) مباشرة.

## 5) الترخيص (مفتاح Ed25519)

التطبيق يستخدم فترة تجربة 30 يوماً تعمل فوراً. بعدها يلزم مفتاح ترخيص:

```bash
node scripts/generate-keys.mjs
# انسخ PUBLIC_KEY الناتج إلى src/config/licenseKeys.ts
# احتفظ بالـ PRIVATE_KEY في مكان آمن، ثم:
node scripts/generate-license.mjs <PRIVATE_KEY> <DEVICE_FINGERPRINT> 2027-12-31 RQ-001 "اسم العميل"
```

تُعرض بصمة الجهاز داخل التطبيق: الإعدادات ← بصمة الجهاز، أو شاشة التفعيل.

## 6) استكشاف الأخطاء

| المشكلة | الحل |
|---|---|
| `Unable to load script / index.android.bundle` | شغّل `npm start` أو `npm run bundle:android` |
| فشل autolinking | احذف `node_modules` و`android/.gradle` ثم أعد `npm install` && `./gradlew clean` |
| خطأ NDK/Gradle | ثبّت NDK 27+ من Android Studio SDK Manager |
| الشاشة عربية معكوسة بالكامل | هذا متوقع عند أول تشغيل بسبب فرض RTL؛ أعد فتح التطبيق مرة واحدة |
| لا تظهر التنبيهات | أضف تشغيلة بتاريخ انتهاء قريب من اليوم من شاشة التشغيلات |

## 7) بنية المشروع

```
src/app/          التطبيق، التنقل، bootstrap
src/screens/      الشاشات الـ13
src/components/   نظام التصميم والمكوّنات
src/theme/        الرموز والثيم الفاتح/الداكن
src/domain/       قواعد العمل النقية (صلاحية/مخزون/ترخيص)
src/data/         SQLite + repositories + MMKV
src/services/     المصادقة، الترخيص، النسخ الاحتياطي، المزامنة
src/store/        Zustand
src/utils/        التشفير، التواريخ، التنسيق
```
