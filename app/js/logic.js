// منطق "تاسكاتي" الصافي — من غير أي DOM — بيستخدمه التطبيق والمنبّه (notifier) الاتنين.

export const MIN = 60 * 1000;
export const HOUR = 60 * MIN;
export const DAY = 24 * HOUR;

/** المسافة اللي بنسمح بيها عشان المنبّه بيشتغل كل ~5 دقايق ومواعيده مش مظبوطة بالثانية */
export const REMINDER_TOLERANCE = 5 * MIN;

/** تقسيم الوقت الباقي لأيام وساعات ودقايق وثواني */
export function breakdown(ms) {
  const abs = Math.abs(ms);
  return {
    negative: ms < 0,
    days: Math.floor(abs / DAY),
    hours: Math.floor((abs % DAY) / HOUR),
    minutes: Math.floor((abs % HOUR) / MIN),
    seconds: Math.floor((abs % MIN) / 1000),
  };
}

/** درجة الخطورة اللي بتحدد لون التاسك */
export function urgency(task, now = Date.now()) {
  const left = task.dueAt - now;
  if (left <= 0) return 'overdue';
  if (left <= DAY) return 'urgent';
  if (left <= 3 * DAY) return 'soon';
  return 'ok';
}

/** نسبة الوقت اللي فاضل من إجمالي مدة التاسك (1 = لسه بادئ، 0 = خلص) */
export function remainingFraction(task, now = Date.now()) {
  const total = task.dueAt - (task.createdAt ?? task.dueAt);
  if (total <= 0) return now < task.dueAt ? 1 : 0;
  return Math.min(1, Math.max(0, (task.dueAt - now) / total));
}

// ———— عربي ————

function plural(n, [one, two, few, many]) {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}

const UNITS = {
  day: ['يوم', 'يومين', 'أيام', 'يوم'],
  hour: ['ساعة', 'ساعتين', 'ساعات', 'ساعة'],
  minute: ['دقيقة', 'دقيقتين', 'دقايق', 'دقيقة'],
};

/** "يومين و ٣ ساعات" — أهم وحدتين بس */
export function humanDuration(ms) {
  const b = breakdown(ms);
  const parts = [];
  if (b.days) parts.push(plural(b.days, UNITS.day));
  if (b.hours) parts.push(plural(b.hours, UNITS.hour));
  if (!b.days && b.minutes) parts.push(plural(b.minutes, UNITS.minute));
  if (!parts.length) return 'أقل من دقيقة';
  return parts.slice(0, 2).join(' و ');
}

// ———— التذكيرات ————

/**
 * بيقرر هل لازم نبعت إشعار للتاسك دي دلوقتي.
 * - آخر ٢٤ ساعة: تذكير كل ساعة لحد ما المستخدم يضغط "شفته" (reminderAck).
 * - لما الوقت يخلص: إشعار فوري مرة واحدة.
 * بيرجع null أو { kind, patch } — الـ patch يتحفظ على التاسك بعد الإرسال.
 */
export function reminderAction(task, now = Date.now()) {
  if (!task || task.status !== 'active') return null;
  const left = task.dueAt - now;

  if (left <= 0) {
    return task.overdueSentAt ? null : { kind: 'overdue', patch: { overdueSentAt: now } };
  }

  if (left <= DAY && !task.reminderAck) {
    const last = task.lastReminderAt || 0;
    if (now - last >= HOUR - REMINDER_TOLERANCE) {
      return { kind: 'reminder', patch: { lastReminderAt: now } };
    }
  }
  return null;
}

/**
 * حقول التذكير لما تاسك تتعمل أو ميعادها يتغير.
 * لو التاسك أصلاً في آخر ٢٤ ساعة، أول تذكير بييجي بعد ساعة (مش فوراً وانت لسه كاتبها).
 */
export function freshReminderFields(dueAt, now = Date.now()) {
  return {
    reminderAck: false,
    overdueSentAt: null,
    lastReminderAt: dueAt - now <= DAY ? now : null,
  };
}

/** نص الإشعار */
export function notificationText(kind, task, now = Date.now(), formatDate = (t) => new Date(t).toLocaleString('ar-EG')) {
  if (kind === 'overdue') {
    return {
      title: `🚨 وقت «${task.title}» خلص!`,
      body: `الديدلاين كان ${formatDate(task.dueAt)} — اتصرّف 💪`,
    };
  }
  return {
    title: `⏳ باقي ${humanDuration(task.dueAt - now)} على «${task.title}»`,
    body: 'لسه مخلصتهاش. اضغط "شفته" عشان أوقف التذكير ده.',
  };
}

// ———— الإحصائيات ————

function startOfDay(t) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function computeStats(tasks, now = Date.now()) {
  const active = tasks.filter((t) => t.status === 'active');
  const done = tasks.filter((t) => t.status === 'done' && t.completedAt);
  const onTime = done.filter((t) => t.completedAt <= t.dueAt);
  const monthStart = new Date(now);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const today = startOfDay(now);
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    // نستخدم setDate عشان التوقيت الصيفي ما يبوّظش الحساب
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const from = d.getTime();
    d.setDate(d.getDate() + 1);
    const to = d.getTime();
    last7.push({ day: from, count: done.filter((t) => t.completedAt >= from && t.completedAt < to).length });
  }

  // كام يوم ورا بعض خلّصت فيهم تاسك واحدة على الأقل
  const doneDays = new Set(done.map((t) => startOfDay(t.completedAt)));
  let streak = 0;
  const cursor = new Date(today);
  if (!doneDays.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 1);
  while (doneDays.has(cursor.getTime())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    activeCount: active.length,
    overdueCount: active.filter((t) => t.dueAt <= now).length,
    urgentCount: active.filter((t) => t.dueAt > now && t.dueAt - now <= DAY).length,
    doneCount: done.length,
    onTimeCount: onTime.length,
    lateCount: done.length - onTime.length,
    onTimeRate: done.length ? Math.round((onTime.length / done.length) * 100) : null,
    doneThisMonth: done.filter((t) => t.completedAt >= monthStart.getTime()).length,
    last7,
    streak,
  };
}
