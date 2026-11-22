// التخزين على الموبايل نفسه (localStorage) — مفيش أي سيرفر.
const KEY = 'taskaty.tasks.v1';

export class LocalStore {
  #listeners = new Set();
  #tasks = [];

  init() {
    this.#tasks = this.#read();
    addEventListener('storage', (e) => { if (e.key === KEY) { this.#tasks = this.#read(); this.#emit(); } });
    // نطلب من المتصفح ما يمسحش البيانات لوحده لما المساحة تقل
    navigator.storage?.persist?.().catch(() => {});
  }

  #read() {
    try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; } catch { return []; }
  }
  #save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.#tasks)); } catch (e) { console.error(e); throw new Error('مش قادر أحفظ على الجهاز'); }
    this.#emit();
  }
  #emit() { const snap = this.all(); this.#listeners.forEach((cb) => cb(snap)); }

  all() { return this.#tasks.map((t) => ({ ...t })); }
  subscribe(cb) { this.#listeners.add(cb); cb(this.all()); return () => this.#listeners.delete(cb); }

  add({ title, notes, dueAt }) {
    this.#tasks.push({ id: crypto.randomUUID(), title, notes: notes || '', dueAt, createdAt: Date.now(), status: 'active', completedAt: null });
    this.#save();
  }
  update(id, patch) {
    const t = this.#tasks.find((x) => x.id === id);
    if (!t) return;
    Object.assign(t, patch);
    if (patch.status === 'done') t.completedAt = Date.now();
    if (patch.status === 'active') t.completedAt = null;
    this.#save();
  }
  remove(id) { this.#tasks = this.#tasks.filter((t) => t.id !== id); this.#save(); }

  /** نسخة احتياطية */
  exportJSON() { return JSON.stringify({ app: 'taskaty', version: 1, exportedAt: Date.now(), tasks: this.#tasks }, null, 2); }
  importJSON(text) {
    const data = JSON.parse(text);
    const list = Array.isArray(data) ? data : data.tasks;
    if (!Array.isArray(list)) throw new Error('الملف ده مش نسخة من تاسكاتي');
    const valid = list.filter((t) => t && typeof t.title === 'string' && Number.isFinite(t.dueAt));
    const byId = new Map(this.#tasks.map((t) => [t.id, t]));
    for (const t of valid) byId.set(t.id || crypto.randomUUID(), { status: 'active', notes: '', createdAt: t.dueAt, ...t });
    this.#tasks = [...byId.values()];
    this.#save();
    return valid.length;
  }
}
