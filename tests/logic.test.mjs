import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOUR, DAY, MIN, urgency, humanDuration, computeStats, breakdown } from '../docs/js/logic.js';

const now = new Date('2026-11-22T12:00:00').getTime();
const task = (over = {}) => ({ id: 'x', title: 'تقرير', status: 'active', createdAt: now - DAY, dueAt: now + 2 * DAY, ...over });

test('urgency levels', () => {
  assert.equal(urgency(task({ dueAt: now + 5 * DAY }), now), 'ok');
  assert.equal(urgency(task({ dueAt: now + 2 * DAY }), now), 'soon');
  assert.equal(urgency(task({ dueAt: now + 2 * HOUR }), now), 'urgent');
  assert.equal(urgency(task({ dueAt: now - 1 }), now), 'overdue');
});

test('arabic durations', () => {
  assert.equal(humanDuration(2 * DAY + 3 * HOUR), 'يومين و 3 ساعات');
  assert.equal(humanDuration(DAY + HOUR), 'يوم و ساعة');
  assert.equal(humanDuration(15 * MIN), '15 دقيقة');
  assert.equal(humanDuration(20 * HOUR), '20 ساعة');
  assert.deepEqual(breakdown(-90 * MIN), { negative: true, days: 0, hours: 1, minutes: 30, seconds: 0 });
});

test('stats', () => {
  const s = computeStats([
    task({ status: 'done', dueAt: now, completedAt: now - HOUR }),
    task({ status: 'done', dueAt: now - 2 * DAY, completedAt: now - DAY }),
    task({ dueAt: now - HOUR }),
    task(),
  ], now);
  assert.equal(s.doneCount, 2);
  assert.equal(s.onTimeRate, 50);
  assert.equal(s.overdueCount, 1);
  assert.equal(s.activeCount, 2);
  assert.equal(s.streak, 2);
  assert.equal(s.last7.at(-1).count, 1);
});
