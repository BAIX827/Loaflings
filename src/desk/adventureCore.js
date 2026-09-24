'use strict';

const { randomUUID } = require('node:crypto');

const KINDS = Object.freeze(['focus_end', 'idle_return', 'explore', 'window_hop']);
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAILY_LIMIT = 2;
const COOLDOWN_MS = 30 * 60 * 1000;
const FOCUS_SECONDS = 25 * 60;
const IDLE_SECONDS = 60;
const EXPLORE_METRES = 0.5;
const WINDOW_SWITCHES = 3;

function count(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function distance(value) {
  return Math.max(0, Number(value) || 0);
}

function snapshot(profile) {
  return {
    clicks: count(profile?.clicks),
    keystrokes: count(profile?.keystrokes),
    mouseTravel: distance(profile?.mouseTravel),
    idleSec: count(profile?.idleSec),
    windowSwitches: count(profile?.windowSwitches),
    focusCount: Array.isArray(profile?.focusSessions) ? profile.focusSessions.length : count(profile?.focusCount),
  };
}

function emptyBook() {
  return { version: 1, events: [], checkpoints: {} };
}

function normalizeBook(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const events = (Array.isArray(source.events) ? source.events : []).flatMap((entry) => {
    if (!entry || typeof entry.id !== 'string' || !DATE.test(entry.date || '') ||
        !KINDS.includes(entry.kind) || typeof entry.eggId !== 'string') return [];
    const evidence = entry.evidence && typeof entry.evidence === 'object' ? entry.evidence : {};
    const value = entry.kind === 'explore' ? distance(evidence.metres)
      : entry.kind === 'window_hop' ? count(evidence.switches)
        : count(evidence.seconds);
    return [{
      id: entry.id,
      date: entry.date,
      occurredAt: typeof entry.occurredAt === 'string' ? entry.occurredAt : '',
      kind: entry.kind,
      eggId: entry.eggId,
      personality: ['builder', 'explorer', 'dreamer'].includes(entry.personality)
        ? entry.personality : 'balanced',
      evidence: entry.kind === 'explore' ? { metres: value }
        : entry.kind === 'window_hop' ? { switches: value } : { seconds: value },
    }];
  });
  const checkpoints = {};
  for (const [date, value] of Object.entries(source.checkpoints || {})) {
    if (!DATE.test(date) || !value || typeof value.eggId !== 'string') continue;
    checkpoints[date] = {
      eggId: value.eggId,
      sample: snapshot(value.sample),
      idleAccum: count(value.idleAccum),
      mouseSince: distance(value.mouseSince),
      switchSince: count(value.switchSince),
    };
  }
  return { version: 1, events, checkpoints };
}

function localDate(now) {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function eventTime(date, now) {
  if (localDate(now) === date) return new Date(now).toISOString();
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 59).toISOString();
}

function observe(raw, profile, options = {}) {
  const book = normalizeBook(raw);
  const date = profile?.date;
  const eggId = options.eggId;
  if (!DATE.test(date || '') || typeof eggId !== 'string' || !eggId) {
    return { book, newEvents: [], changed: false };
  }
  const current = snapshot(profile);
  let checkpoint = book.checkpoints[date];
  const reset = !checkpoint || checkpoint.eggId !== eggId ||
    Object.keys(current).some((key) => current[key] < checkpoint.sample[key]);
  if (reset || options.baselineOnly) {
    book.checkpoints[date] = {
      eggId, sample: current, idleAccum: 0, mouseSince: 0, switchSince: 0,
    };
    // A newly observed profile is a baseline, not evidence that an event just happened.
    return { book, newEvents: [], changed: true };
  }
  if (Object.keys(current).every((key) => current[key] === checkpoint.sample[key])) {
    return { book, newEvents: [], changed: false };
  }
  const previous = checkpoint.sample;
  const now = options.now || new Date();
  const occurredAt = eventTime(date, now);
  const nowMs = Date.parse(occurredAt);
  const newEvents = [];
  const personality = ['builder', 'explorer', 'dreamer'].includes(options.personality)
    ? options.personality : 'balanced';
  function add(kind, evidence) {
    const same = book.events.filter((event) => event.date === date && event.kind === kind);
    if (same.length >= DAILY_LIMIT ||
        same.some((event) => Math.abs(nowMs - Date.parse(event.occurredAt)) < COOLDOWN_MS)) return;
    const event = { id: randomUUID(), date, occurredAt, kind, eggId, personality, evidence };
    book.events.push(event);
    newEvents.push(event);
  }

  const newSessions = (profile.focusSessions || []).slice(previous.focusCount);
  const finished = newSessions.map((session) => count(session?.durationSec))
    .filter((seconds) => seconds >= FOCUS_SECONDS);
  if (finished.length) add('focus_end', { seconds: Math.max(...finished) });

  const observedIdleBefore = checkpoint.idleAccum;
  const idleDelta = current.idleSec - previous.idleSec;
  const activityReturned = current.clicks > previous.clicks ||
    current.keystrokes > previous.keystrokes || current.mouseTravel > previous.mouseTravel;
  if (activityReturned) {
    if (observedIdleBefore >= IDLE_SECONDS) {
      add('idle_return', { seconds: observedIdleBefore });
    }
    checkpoint.idleAccum = 0;
  } else {
    checkpoint.idleAccum += idleDelta;
  }

  checkpoint.mouseSince += current.mouseTravel - previous.mouseTravel;
  if (checkpoint.mouseSince >= EXPLORE_METRES) {
    add('explore', { metres: Math.round(checkpoint.mouseSince * 100) / 100 });
    checkpoint.mouseSince = 0;
  }
  checkpoint.switchSince += current.windowSwitches - previous.windowSwitches;
  if (checkpoint.switchSince >= WINDOW_SWITCHES) {
    add('window_hop', { switches: checkpoint.switchSince });
    checkpoint.switchSince = 0;
  }
  checkpoint.sample = current;
  return { book, newEvents, changed: true };
}

function eventsForEgg(raw, eggId) {
  return normalizeBook(raw).events.filter((event) => event.eggId === eggId);
}

function eventsForDate(raw, date) {
  return normalizeBook(raw).events.filter((event) => event.date === date);
}

module.exports = { emptyBook, normalizeBook, observe, eventsForEgg, eventsForDate };
