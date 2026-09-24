'use strict';

const PERSONA = Object.freeze({
  builder: {
    zh: '工作能量最明显，这只摸鱼灵带着安静的建造者气质。',
    en: 'Work energy was strongest, shaping this Loafling into a quiet Builder.',
  },
  explorer: {
    zh: '探索能量最明显，这只摸鱼灵更像一位好奇的探索者。',
    en: 'Explore energy was strongest, shaping this Loafling into a curious Explorer.',
  },
  dreamer: {
    zh: '梦境能量最明显，这只摸鱼灵更像一位悠然的梦想家。',
    en: 'Dream energy was strongest, shaping this Loafling into an easygoing Dreamer.',
  },
});

const TRAITS = Object.freeze({
  focused: { zh: '结算也留下了专注特质。', en: 'Its settled traits include focus.' },
  window_hopper: { zh: '结算也留下了探索特质。', en: 'Its settled traits include exploration.' },
  soft_idle: { zh: '休息的节奏也留在了它身上。', en: 'Restful time also shaped its settled traits.' },
});

const MOMENTS = Object.freeze({
  focus_end: {
    zh: '它记得一段已经结束的专注时光。',
    en: 'It remembers a completed stretch of focus.',
  },
  idle_return: {
    zh: '它记得你休息后又回来。',
    en: 'It remembers you returning after a pause.',
  },
  explore: {
    zh: '它沿着鼠标走过一小段路。',
    en: 'It followed a stretch of mouse movement.',
  },
  window_hop: {
    zh: '它在几次窗口切换间探了探头。',
    en: 'It peeked around during several window switches.',
  },
});

function buildMemory(result, adventures = []) {
  const persona = PERSONA[result?.personality];
  if (!persona || !result?.energy) return null;
  const energyKey = { builder: 'work', explorer: 'explore', dreamer: 'dream' }[result.personality];
  const values = ['work', 'explore', 'dream'].map((key) => Number(result.energy[key]) || 0);
  if (values.reduce((total, value) => total + value, 0) <= 0 ||
      values[['work', 'explore', 'dream'].indexOf(energyKey)] < Math.max(...values)) return null;
  const trait = (result.traits || []).find((value) => TRAITS[value]);
  const recorded = adventures.filter((event) => MOMENTS[event.kind] && typeof event.id === 'string');
  const remembered = recorded.slice(0, 2);
  return {
    version: 1,
    zh: [persona.zh, trait ? TRAITS[trait].zh : '', ...remembered.map((event) => MOMENTS[event.kind].zh)]
      .filter(Boolean).join(' '),
    en: [persona.en, trait ? TRAITS[trait].en : '', ...remembered.map((event) => MOMENTS[event.kind].en)]
      .filter(Boolean).join(' '),
    eventIds: recorded.map((event) => event.id),
  };
}

module.exports = { buildMemory };
