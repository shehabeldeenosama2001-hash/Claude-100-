# صلي وركز — Salli Wa Rakez

An Android app that:

- Has one big button that **locks every browser on the phone for 10 minutes**, right away with no confirmation.
- **Every time a browser is opened**, a gate appears on top of it: type «صلي على النبي» 5 times, then confirm «متأكد إنك عايز تكمل؟ افتكر كل حاجة هتحصل بعدها» by tapping 5 times. The pass lasts until you leave the browser (home, another app, or screen off).
- **Facebook, Instagram and TikTok**: type «صلي على النبي» 5 times (no "are you sure" step, no 10-minute lock). After that the app stays open for 10 minutes, even if you close and reopen it; after 10 minutes it asks again.
- **Can't be uninstalled** until you type «صلي على النبي» **100 times** inside the app.

## Download

Latest APK: **Releases → latest → `SalliWaRakez.apk`**
(direct link: `https://github.com/shehabeldeenosama2001-hash/Claude-100-/releases/latest/download/SalliWaRakez.apk`)

Every push builds a new signed APK through GitHub Actions (`.github/workflows/build-apk.yml`).
All builds use the same key (`app/salli.keystore`), so a new version installs as an update over the old one.

## Setup on the phone (once)

1. Install the APK (allow "install unknown apps" for your browser/files app).
2. Open the app → **فعّل خدمة الحجب** → find «صلي وركز» in Accessibility and turn it on.
   - Android 13+: if it's greyed out / "restricted setting", tap **افتح صفحة التطبيق** → ⋮ → *Allow restricted settings*, then try again.
3. Tap **فعّل الحماية من المسح** → Activate (device admin).

After step 3, any Settings or installer screen showing the app (app info, accessibility toggle, device admin, uninstall dialog) closes immediately.

## How it works

| Part | File |
|---|---|
| Browser blocking + guarding Settings screens (Accessibility Service) | `BlockerService.java` |
| Uninstall prevention (Device Admin) | `AdminReceiver.java` |
| Main screen with the lock button | `MainActivity.java` |
| Gate shown on every browser open (5 phrases + 5 taps) | `GateActivity.java`, `BrowserGate.java` |
| Facebook / Instagram / TikTok gate (5 phrases, 10-minute pass) | `SocialGate.java` |
| Backup engine when the phone switches Accessibility off (usage stats + display over apps) | `MonitorService.java` |
| Keep-alive, watchdog notification, diagnostics | `KeepAlive.java`, `Watchdog.java`, `Diagnostics.java` |
| Type the phrase 100 times, paste blocked | `UnlockActivity.java` |

## Limits

Android always leaves a last-resort way out (Safe Mode, factory reset, or a computer with ADB). This app makes quitting take real effort; it can't make it impossible.
