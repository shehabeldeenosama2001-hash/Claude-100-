// طبقة التخزين: نفس الواجهة لوضع التجربة (localStorage) ولـ Firebase (مزامنة بين الأجهزة).
import { freshReminderFields } from './logic.js';

const FB = 'https://www.gstatic.com/firebasejs/10.14.1';
const cfg = self.TASKATY_CONFIG || {};

export const isConfigured = Boolean(cfg.firebase?.apiKey && cfg.firebase?.projectId);

function newTaskDoc({ title, notes, dueAt }) {
  const now = Date.now();
  return { title, notes: notes || '', dueAt, createdAt: now, status: 'active', completedAt: null, ...freshReminderFields(dueAt, now) };
}

/** لما الميعاد يتغير أو التاسك ترجع من الأرشيف، نصفّر حالة التذكيرات */
function normalizePatch(patch, current) {
  const out = { ...patch };
  const dueChanged = 'dueAt' in patch && patch.dueAt !== current?.dueAt;
  const reopened = patch.status === 'active' && current?.status === 'done';
  if (dueChanged || reopened) Object.assign(out, freshReminderFields(patch.dueAt ?? current.dueAt));
  if (patch.status === 'done') out.completedAt = Date.now();
  if (reopened) out.completedAt = null;
  return out;
}

// ———————————————— وضع التجربة ————————————————
class LocalStore {
  mode = 'local';
  user = { displayName: 'وضع التجربة' };
  #key = 'taskaty.tasks.v1';
  #listeners = new Set();
  #tasks = [];

  async init() {
    try { this.#tasks = JSON.parse(localStorage.getItem(this.#key)) || []; } catch { this.#tasks = []; }
    addEventListener('storage', (e) => { if (e.key === this.#key) { this.#tasks = JSON.parse(e.newValue || '[]'); this.#emit(); } });
    return this.user;
  }
  #save() { try { localStorage.setItem(this.#key, JSON.stringify(this.#tasks)); } catch {} this.#emit(); }
  #emit() { const snap = this.#tasks.map((t) => ({ ...t })); this.#listeners.forEach((cb) => cb(snap)); }
  subscribe(cb) { this.#listeners.add(cb); cb(this.#tasks.map((t) => ({ ...t }))); return () => this.#listeners.delete(cb); }
  async add(data) { this.#tasks.push({ id: crypto.randomUUID(), ...newTaskDoc(data) }); this.#save(); }
  async update(id, patch) {
    const t = this.#tasks.find((x) => x.id === id); if (!t) return;
    Object.assign(t, normalizePatch(patch, t)); this.#save();
  }
  async remove(id) { this.#tasks = this.#tasks.filter((t) => t.id !== id); this.#save(); }
  async enablePush() { return Notification.requestPermission(); }
  async signOut() {}
}

// ———————————————— Firebase ————————————————
class FirebaseStore {
  mode = 'firebase';
  user = null;
  #m = {};
  #db; #auth; #app;
  #tasks = new Map();

  async init() {
    const [appM, authM, fsM] = await Promise.all([
      import(`${FB}/firebase-app.js`), import(`${FB}/firebase-auth.js`), import(`${FB}/firebase-firestore.js`),
    ]);
    this.#m = { ...appM, ...authM, ...fsM };
    const m = this.#m;
    this.#app = m.initializeApp(cfg.firebase);
    this.#auth = m.getAuth(this.#app);
    this.#db = m.initializeFirestore(this.#app, { localCache: m.persistentLocalCache({ tabManager: m.persistentMultipleTabManager() }) });
    await m.getRedirectResult(this.#auth).catch(() => {});
    this.user = await new Promise((res) => { const off = m.onAuthStateChanged(this.#auth, (u) => { off(); res(u); }); });
    if (this.user) {
      m.setDoc(m.doc(this.#db, 'users', this.user.uid), { name: this.user.displayName || '', lastSeen: Date.now() }, { merge: true }).catch(() => {});
    }
    return this.user;
  }

  async signIn() {
    const m = this.#m;
    const provider = new m.GoogleAuthProvider();
    const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (standalone) return m.signInWithRedirect(this.#auth, provider);
    try { await m.signInWithPopup(this.#auth, provider); } catch { return m.signInWithRedirect(this.#auth, provider); }
    location.reload();
  }
  async signOut() { await this.#m.signOut(this.#auth); location.reload(); }

  #col() { return this.#m.collection(this.#db, 'users', this.user.uid, 'tasks'); }

  subscribe(cb) {
    return this.#m.onSnapshot(this.#col(), (snap) => {
      this.#tasks = new Map(snap.docs.map((d) => [d.id, { id: d.id, ...d.data() }]));
      cb([...this.#tasks.values()]);
    });
  }
  async add(data) { await this.#m.addDoc(this.#col(), newTaskDoc(data)); }
  async update(id, patch) { await this.#m.updateDoc(this.#m.doc(this.#col(), id), normalizePatch(patch, this.#tasks.get(id))); }
  async remove(id) { await this.#m.deleteDoc(this.#m.doc(this.#col(), id)); }

  /** يطلب إذن الإشعارات ويسجّل الجهاز ده عشان المنبّه يبعتله */
  async enablePush() {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return perm;
    const msgM = await import(`${FB}/firebase-messaging.js`);
    if (!(await msgM.isSupported())) throw new Error('المتصفح ده مش بيدعم الإشعارات من برا التطبيق');
    const reg = await navigator.serviceWorker.ready;
    const token = await msgM.getToken(msgM.getMessaging(this.#app), { vapidKey: cfg.vapidKey, serviceWorkerRegistration: reg });
    const m = this.#m;
    await m.setDoc(m.doc(this.#db, 'users', this.user.uid, 'devices', token), {
      token, ua: navigator.userAgent.slice(0, 200), updatedAt: Date.now(),
    });
    localStorage.setItem('taskaty.pushToken', token);
    return perm;
  }
}

export function createStore() {
  return isConfigured ? new FirebaseStore() : new LocalStore();
}
