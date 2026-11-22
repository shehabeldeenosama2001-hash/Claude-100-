// المنبّه: بيشتغل على GitHub Actions كل ~٥ دقايق.
// بيلف على تاسكات كل مستخدم، ويقرر بنفس منطق التطبيق (logic.js) هل يبعت إشعار،
// ويبعته على كل الأجهزة المسجلة عن طريق Firebase Cloud Messaging.
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { reminderAction, notificationText } from '../app/js/logic.js';

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
  console.error('FIREBASE_SERVICE_ACCOUNT مش موجود — حطه في GitHub Secrets (شوف README).');
  process.exit(1);
}
const TZ = process.env.TASKATY_TZ || 'Africa/Cairo';
const DRY_RUN = process.env.DRY_RUN === '1';

initializeApp({ credential: cert(JSON.parse(raw)) });
const db = getFirestore();
const messaging = getMessaging();

const fmt = new Intl.DateTimeFormat('ar-EG', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' });
const DEAD_TOKEN = new Set(['messaging/registration-token-not-registered', 'messaging/invalid-registration-token']);

async function processUser(userRef) {
  const now = Date.now();
  const tasksSnap = await userRef.collection('tasks').where('status', '==', 'active').get();
  const due = [];
  for (const doc of tasksSnap.docs) {
    const task = { id: doc.id, ...doc.data() };
    const action = reminderAction(task, now);
    if (action) due.push({ doc, task, action });
  }
  if (!due.length) return 0;

  const devicesSnap = await userRef.collection('devices').get();
  const tokens = devicesSnap.docs.map((d) => d.id);
  let sent = 0;

  for (const { doc, task, action } of due) {
    const text = notificationText(action.kind, task, now, (t) => fmt.format(t));
    console.log(`[${userRef.id}] ${action.kind}: ${task.title} → ${tokens.length} جهاز`);
    if (!DRY_RUN && tokens.length) {
      const res = await messaging.sendEachForMulticast({
        tokens,
        data: { kind: action.kind, taskId: task.id, title: text.title, body: text.body },
        webpush: { headers: { Urgency: 'high', TTL: action.kind === 'overdue' ? '86400' : '3300' } },
      });
      // نشيل الأجهزة اللي التوكن بتاعها مات (اتمسح التطبيق مثلاً)
      await Promise.all(res.responses.map((r, i) => {
        if (r.success || !DEAD_TOKEN.has(r.error?.code)) return null;
        console.log(`  شيلت جهاز قديم: ${r.error.code}`);
        return userRef.collection('devices').doc(devicesSnap.docs[i].id).delete();
      }));
      sent += res.successCount;
    }
    // نسجّل حتى لو مفيش أجهزة، عشان ما نفضلش نحاول كل ٥ دقايق
    if (!DRY_RUN) await doc.ref.update(action.patch);
  }
  return sent;
}

const users = await db.collection('users').listDocuments();
let total = 0;
for (const u of users) {
  try { total += await processUser(u); } catch (e) { console.error(`[${u.id}]`, e); process.exitCode = 1; }
}
console.log(`خلصنا: ${users.length} مستخدم، ${total} إشعار اتبعت.`);
