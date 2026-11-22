import { createStore, isConfigured } from './store.js';
import { breakdown, urgency, remainingFraction, humanDuration, computeStats, reminderAction, notificationText, DAY } from './logic.js';

const $ = (s, el = document) => el.querySelector(s);
const store = createStore();
let tasks = [];
let editingId = null;
let deferredInstall = null;

// ———————————— تنسيق ————————————
const fmtDate = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' });
const fmtShort = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' });
const fmtDay = new Intl.DateTimeFormat('ar-EG', { weekday: 'short' });
const num = new Intl.NumberFormat('ar-EG');
const n2 = (v) => num.format(v);

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2600);
}

const LEVEL_LABEL = { ok: 'براحتك', soon: 'قرّب', urgent: 'آخر ٢٤ ساعة', overdue: 'متأخرة' };

// ———————————— التاسكات ————————————
function countdownHTML(t, now) {
  const left = t.dueAt - now;
  const b = breakdown(left);
  const units = [
    [b.days, 'يوم'],
    [b.hours, 'ساعة'],
    [b.minutes, 'دقيقة'],
  ];
  if (!b.days && !b.hours) units.push([b.seconds, 'ثانية']);
  return `<span class="lead">${b.negative ? 'متأخر بقاله' : 'باقي'}</span>` +
    units.map(([v, l]) => `<div class="unit"><b>${n2(v)}</b><small>${l}</small></div>`).join('');
}

function taskCard(t, now) {
  const level = urgency(t, now);
  const showAck = level === 'urgent' && !t.reminderAck;
  return `
  <article class="task" data-id="${t.id}" data-level="${level}">
    <div class="task-head">
      <div>
        <h3>${esc(t.title)}</h3>
        <div class="due">📅 ${fmtDate.format(t.dueAt)}</div>
      </div>
      <span class="chip">${LEVEL_LABEL[level]}</span>
    </div>
    <div class="countdown">${countdownHTML(t, now)}</div>
    <div class="bar"><span style="width:${(remainingFraction(t, now) * 100).toFixed(1)}%"></span></div>
    ${t.notes ? `<p class="notes">${esc(t.notes)}</p>` : ''}
    <div class="actions">
      <button class="btn done" data-act="done">✓ خلّصتها</button>
      ${showAck ? '<button class="btn sm" data-act="ack" title="يوقف تذكير كل ساعة">🔕 شفته</button>' : ''}
      <span class="spacer"></span>
      <button class="icon-btn" data-act="edit" title="تعديل" aria-label="تعديل">✏️</button>
      <button class="icon-btn" data-act="delete" title="حذف" aria-label="حذف">🗑</button>
    </div>
  </article>`;
}

function renderTasks() {
  const now = Date.now();
  const active = tasks.filter((t) => t.status === 'active').sort((a, b) => a.dueAt - b.dueAt);
  const el = $('#task-list');
  if (!active.length) {
    el.innerHTML = `<div class="empty"><div class="big">🌿</div><h3>مفيش تاسكات عليك</h3><p>دوس على <b>+</b> وضيف أول تاسك.</p></div>`;
  } else {
    el.innerHTML = active.map((t) => taskCard(t, now)).join('');
  }
  renderSummary(active, now);
}

function renderSummary(active, now) {
  const overdue = active.filter((t) => t.dueAt <= now).length;
  const urgent = active.filter((t) => t.dueAt > now && t.dueAt - now <= DAY).length;
  let s = active.length ? `عليك ${n2(active.length)} تاسك` : 'فاضي ✨';
  if (urgent) s += ` — ${n2(urgent)} في آخر ٢٤ ساعة`;
  if (overdue) s += ` — ${n2(overdue)} متأخرة`;
  $('#summary').textContent = s;
  document.title = overdue ? `(${overdue}) تاسكاتي` : 'تاسكاتي';
}

/** تحديث العدّادات كل ثانية من غير ما نعيد رسم الصفحة */
function tick() {
  const now = Date.now();
  let levelChanged = false;
  document.querySelectorAll('.task').forEach((card) => {
    const t = tasks.find((x) => x.id === card.dataset.id);
    if (!t) return;
    if (urgency(t, now) !== card.dataset.level) levelChanged = true;
    card.querySelector('.countdown').innerHTML = countdownHTML(t, now);
    card.querySelector('.bar span').style.width = `${(remainingFraction(t, now) * 100).toFixed(1)}%`;
  });
  if (levelChanged) renderTasks();
}

// ———————————— الأرشيف ————————————
function renderArchive() {
  const done = tasks.filter((t) => t.status === 'done').sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  const el = $('#archive-list');
  if (!done.length) {
    el.innerHTML = `<div class="empty"><div class="big">🗂</div><h3>الأرشيف فاضي</h3><p>أي تاسك تخلّصها هتتنقل هنا.</p></div>`;
    return;
  }
  el.innerHTML = done.map((t) => {
    const diff = t.dueAt - t.completedAt;
    const onTime = diff >= 0;
    return `
    <div class="arch" data-id="${t.id}">
      <div class="check ${onTime ? 'on' : 'late'}">${onTime ? '✓' : '!'}</div>
      <div class="body">
        <h4>${esc(t.title)}</h4>
        <p>${onTime ? `اتسلّمت قبل الميعاد بـ ${humanDuration(diff)}` : `اتأخرت ${humanDuration(-diff)}`} — ${fmtShort.format(t.completedAt)}</p>
      </div>
      <div class="tools">
        <button class="btn sm" data-act="restore" title="رجّعها للتاسكات">↩︎</button>
        <button class="btn sm ghost warn" data-act="delete" title="حذف نهائي">🗑</button>
      </div>
    </div>`;
  }).join('');
}

// ———————————— الإحصائيات ————————————
function renderStats() {
  const s = computeStats(tasks);
  const max = Math.max(1, ...s.last7.map((d) => d.count));
  const rate = s.onTimeRate;
  $('#stats').innerHTML = `
    <div class="stat-grid">
      <div class="tile accent"><b>${n2(s.doneThisMonth)}</b><span>خلّصت الشهر ده</span></div>
      <div class="tile ok"><b>${n2(s.streak)}</b><span>يوم ورا بعض بتخلّص 🔥</span></div>
      <div class="tile soon"><b>${n2(s.urgentCount)}</b><span>في آخر ٢٤ ساعة</span></div>
      <div class="tile urgent"><b>${n2(s.overdueCount)}</b><span>متأخرة دلوقتي</span></div>
    </div>
    <div class="panel">
      <h3>التزامك بالمواعيد</h3>
      <div class="ring-wrap">
        <div class="ring" style="--p:${rate ?? 0}" data-label="${rate == null ? '—' : `${n2(rate)}٪`}"></div>
        <div class="legend">
          <div><i style="background:var(--ok)"></i>في ميعادها: <b>${n2(s.onTimeCount)}</b></div>
          <div><i style="background:var(--soon)"></i>اتأخرت: <b>${n2(s.lateCount)}</b></div>
          <div><i style="background:var(--accent)"></i>إجمالي اللي خلّصته: <b>${n2(s.doneCount)}</b></div>
          <div><i style="background:var(--surface-2)"></i>لسه عليك: <b>${n2(s.activeCount)}</b></div>
        </div>
      </div>
    </div>
    <div class="panel">
      <h3>آخر ٧ أيام</h3>
      <div class="bars">
        ${s.last7.map((d) => `
          <div class="col">
            <span class="n">${d.count ? n2(d.count) : ''}</span>
            <div class="b ${d.count ? '' : 'zero'}" style="height:${(d.count / max) * 100}%"></div>
            <small>${fmtDay.format(d.day)}</small>
          </div>`).join('')}
      </div>
    </div>`;
}

// ———————————— الإعدادات ————————————
const perm = () => ('Notification' in self ? Notification.permission : 'unsupported');

function pushState() {
  if (perm() === 'unsupported') return { label: 'مش مدعوم', cls: 'off' };
  if (perm() === 'granted') return { label: 'شغّالة', cls: 'on' };
  if (perm() === 'denied') return { label: 'مقفولة', cls: 'off' };
  return { label: 'مش متفعّلة', cls: '' };
}

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;

function renderSettings() {
  const p = pushState();
  const u = store.user || {};
  $('#settings').innerHTML = `
    <div class="panel">
      <h3>الحساب</h3>
      <div class="set-row">
        <div><strong>${esc(u.displayName || u.email || '')}</strong>
          <p>${store.mode === 'firebase' ? 'متزامن على كل أجهزتك اللي داخل منها بنفس الحساب ☁️' : 'وضع التجربة: التاسكات محفوظة على الجهاز ده بس. وصّل Firebase عشان المزامنة (شوف README).'}</p></div>
        ${store.mode === 'firebase' ? '<button class="btn sm" id="signout">خروج</button>' : '<span class="pill">محلي</span>'}
      </div>
    </div>
    <div class="panel">
      <h3>الإشعارات</h3>
      <div class="set-row">
        <div><strong>إشعارات برّا التطبيق</strong>
          <p>تذكير كل ساعة في آخر ٢٤ ساعة لحد ما تضغط "شفته"، وإشعار فوري لما الوقت يخلص.</p></div>
        <span class="pill ${p.cls}">${p.label}</span>
      </div>
      <div class="set-row">
        <button class="btn primary" id="enable-push">🔔 ${perm() === 'granted' ? 'سجّل الجهاز ده تاني' : 'فعّل الإشعارات على الجهاز ده'}</button>
        <button class="btn" id="test-push">جرّب إشعار</button>
      </div>
      ${perm() === 'denied' ? '<p class="hint">الإشعارات مقفولة من المتصفح. افتح إعدادات الموقع (القفل 🔒 جنب العنوان) وخلّي الإشعارات "سماح".</p>' : ''}
      ${store.mode === 'local' ? '<p class="hint">⚠️ في وضع التجربة التذكيرات بتشتغل بس والتطبيق مفتوح. بعد توصيل Firebase هتوصلك حتى والتطبيق مقفول.</p>' : ''}
    </div>
    <div class="panel">
      <h3>سطّب التطبيق</h3>
      ${deferredInstall ? '<div class="set-row"><div><strong>سطّبه كبرنامج</strong><p>يفتح لوحده من غير المتصفح ويبقى ليه أيقونة.</p></div><button class="btn primary" id="install">سطّب</button></div>' : ''}
      ${isStandalone ? '<p class="hint">✅ التطبيق متسطّب على الجهاز ده.</p>' : `
        <p class="hint">
          <b>آيفون:</b> افتحه من Safari ← زرار المشاركة ⬆️ ← <b>Add to Home Screen</b>. (لازم تسطّبه عشان الإشعارات تشتغل على الآيفون.)<br/>
          <b>أندرويد:</b> من Chrome ← ⋮ ← <b>Install app / إضافة إلى الشاشة الرئيسية</b>.<br/>
          <b>اللاب:</b> من Chrome أو Edge ← أيقونة التسطيب ⊕ في شريط العنوان.
        </p>`}
    </div>`;

  $('#signout')?.addEventListener('click', () => store.signOut());
  $('#install')?.addEventListener('click', async () => { deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; renderSettings(); });
  $('#enable-push').addEventListener('click', enablePush);
  $('#test-push').addEventListener('click', async () => {
    if (perm() !== 'granted') return toast('فعّل الإشعارات الأول');
    await showLocalNotification({ kind: 'test', title: '👋 أهلاً من تاسكاتي', body: 'الإشعارات شغّالة تمام.' });
  });
}

async function enablePush() {
  if (isIOS && !isStandalone) return toast('على الآيفون لازم تسطّب التطبيق الأول (Add to Home Screen)');
  try {
    const res = await store.enablePush();
    toast(res === 'granted' ? 'تمام! الجهاز ده هيوصله الإشعارات 🔔' : 'لازم توافق على الإشعارات من المتصفح');
  } catch (e) {
    console.error(e);
    toast(e.message || 'حصلت مشكلة في تفعيل الإشعارات');
  }
  renderSettings();
  renderBanner();
}

async function showLocalNotification(payload) {
  const reg = await navigator.serviceWorker?.ready;
  if (reg?.active) reg.active.postMessage({ type: 'notify', payload });
  else new Notification(payload.title, { body: payload.body, dir: 'rtl' });
}

function renderBanner() {
  const b = $('#banner');
  if (perm() === 'default') {
    b.innerHTML = '<span>🔔 فعّل الإشعارات عشان أفكّرك قبل الديدلاين وأقولك لو الوقت خلص.</span><button class="btn sm primary" id="banner-push">فعّل</button>';
    b.hidden = false;
    $('#banner-push').onclick = enablePush;
  } else {
    b.hidden = true;
  }
}

// ———————————— التنقّل ————————————
const renderers = { tasks: renderTasks, archive: renderArchive, stats: renderStats, settings: renderSettings };
let currentView = 'tasks';

function show(view) {
  currentView = view;
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${view}`));
  $('#fab').hidden = view !== 'tasks';
  renderers[view]();
  try { localStorage.setItem('taskaty.view', view); } catch {}
  scrollTo({ top: 0 });
}

function renderAll() {
  renderTasks();
  if (currentView !== 'tasks') renderers[currentView]();
}

// ———————————— المحرّر ————————————
const pad = (n) => String(n).padStart(2, '0');
const toDateInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeInput = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function openEditor(task = null) {
  editingId = task?.id ?? null;
  const f = $('#task-form');
  f.reset();
  $('#form-error').hidden = true;
  $('#editor-title').textContent = task ? 'تعديل التاسك' : 'تاسك جديدة';
  if (task) {
    const d = new Date(task.dueAt);
    f.title.value = task.title;
    f.date.value = toDateInput(d);
    f.time.value = toTimeInput(d);
    f.notes.value = task.notes || '';
  } else {
    const d = new Date(Date.now() + DAY);
    f.date.value = toDateInput(d);
  }
  $('#editor').showModal();
  setTimeout(() => f.title.focus(), 50);
}

$('#task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const err = (m) => { $('#form-error').textContent = m; $('#form-error').hidden = false; };
  const title = f.title.value.trim();
  if (!title) return err('اكتب اسم التاسك');
  if (!f.date.value) return err('اختار تاريخ التسليم');
  // لو الساعة فاضية نعتبر آخر اليوم
  const [y, m, d] = f.date.value.split('-').map(Number);
  const [hh, mm] = (f.time.value || '23:59').split(':').map(Number);
  const dueAt = new Date(y, m - 1, d, hh, mm).getTime();
  const original = tasks.find((t) => t.id === editingId);
  if (dueAt <= Date.now() && (!original || original.dueAt !== dueAt)) return err('الميعاد ده عدّى خلاص، اختار ميعاد جاي');

  const data = { title, dueAt, notes: f.notes.value.trim() };
  $('#editor').close();
  try {
    if (editingId) { await store.update(editingId, data); toast('اتعدّلت ✏️'); }
    else { await store.add(data); toast('اتضافت ✅'); }
  } catch (e2) { console.error(e2); toast('حصلت مشكلة في الحفظ'); }
});

document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => $('#editor').close()));
$('#editor').addEventListener('click', (e) => { if (e.target.id === 'editor') $('#editor').close(); });
document.querySelectorAll('[data-quick]').forEach((b) => b.addEventListener('click', () => {
  const d = new Date();
  d.setDate(d.getDate() + Number(b.dataset.quick));
  $('#task-form').date.value = toDateInput(d);
}));

// ———————————— الأحداث ————————————
async function act(action, id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  switch (action) {
    case 'done': await store.update(id, { status: 'done' }); toast('عاش! 🎉 اتنقلت للأرشيف'); break;
    case 'ack': await store.update(id, { reminderAck: true }); toast('تمام، مش هفكّرك تاني بيها 🔕'); break;
    case 'edit': openEditor(t); break;
    case 'restore': await store.update(id, { status: 'active' }); toast('رجعت للتاسكات'); break;
    case 'delete':
      if (confirm(`تمسح «${t.title}» نهائي؟`)) { await store.remove(id); toast('اتمسحت'); }
      break;
  }
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const id = btn.closest('[data-id]')?.dataset.id;
  act(btn.dataset.act, id).catch((err) => { console.error(err); toast('حصلت مشكلة'); });
});

document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => show(b.dataset.view)));
$('#fab').addEventListener('click', () => openEditor());

addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; if (currentView === 'settings') renderSettings(); });

/** الضغط على الإشعار (من الـ SW أو من رابط ?ack= / ?done=) */
let pendingAction = null;
function handleNotificationAction(action, taskId) {
  if (!taskId) return;
  if (!tasks.length) { pendingAction = [action, taskId]; return; }
  const t = tasks.find((x) => x.id === taskId);
  if (!t || t.status !== 'active') return;
  if (action === 'done') act('done', taskId);
  else if (!t.reminderAck && t.dueAt > Date.now()) store.update(taskId, { reminderAck: true });
  show('tasks');
  requestAnimationFrame(() => document.querySelector(`.task[data-id="${CSS.escape(taskId)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
}
navigator.serviceWorker?.addEventListener('message', (e) => {
  if (e.data?.type === 'notification-click') handleNotificationAction(e.data.action, e.data.taskId);
});

// ———————————— التذكيرات في وضع التجربة ————————————
// (مع Firebase المنبّه اللي على GitHub هو اللي بيبعت، عشان توصل والتطبيق مقفول)
async function localReminderLoop() {
  if (store.mode !== 'local' || perm() !== 'granted') return;
  const now = Date.now();
  for (const t of tasks) {
    const a = reminderAction(t, now);
    if (!a) continue;
    await store.update(t.id, a.patch);
    await showLocalNotification({ kind: a.kind, taskId: t.id, ...notificationText(a.kind, t, now, (x) => fmtDate.format(x)) });
  }
}

// ———————————— البداية ————————————
async function boot() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW', e));

  let user;
  try { user = await store.init(); } catch (e) {
    console.error(e);
    $('#splash').innerHTML = '<p style="padding:24px;text-align:center">مش قادر أوصل لـ Firebase. اتأكد من النت ومن الإعدادات في firebase-config.js</p>';
    return;
  }
  $('#splash').hidden = true;

  if (isConfigured && !user) {
    $('#login').hidden = false;
    $('#signin').addEventListener('click', () => store.signIn().catch((e) => toast(e.message)));
    return;
  }

  $('#app').hidden = false;

  const params = new URLSearchParams(location.search);
  if (params.has('ack') || params.has('done')) {
    pendingAction = [params.has('done') ? 'done' : 'ack', params.get('done') || params.get('ack')];
    history.replaceState(null, '', location.pathname);
  }

  let first = true;
  store.subscribe((list) => {
    tasks = list;
    if (first) {
      first = false;
      let saved = 'tasks';
      try { saved = localStorage.getItem('taskaty.view') || 'tasks'; } catch {}
      show(renderers[saved] ? saved : 'tasks');
    } else {
      renderAll();
    }
    if (pendingAction && tasks.length) { const [a, id] = pendingAction; pendingAction = null; handleNotificationAction(a, id); }
  });

  renderBanner();
  // نجدّد تسجيل الجهاز بهدوء (التوكن بيتغير كل فترة)
  if (store.mode === 'firebase' && perm() === 'granted') store.enablePush().catch(() => {});

  setInterval(tick, 1000);
  setInterval(localReminderLoop, 30 * 1000);
  localReminderLoop();
}

boot();
