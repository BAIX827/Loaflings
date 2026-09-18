/**
 * Companion UI strings — zh / en. No product rules here.
 */
const STRINGS = {
  zh: {
    'hud.hits': '活跃',
    'btn.day': '今日',
    'btn.save': '收藏',
    'btn.pack': '背包',
    'btn.settings': '设置',
    'btn.quit': '退出',
    'settings.title': '设置',
    'settings.opacity': '透明度',
    'settings.size': '大小',
    'settings.lock': '锁定位置',
    'settings.showChrome': '显示按键',
    'settings.showHud': '显示活跃数',
    'settings.lang': '语言',
    'settings.guide': '新手引导',
    'settings.note': '隐藏按键后点右上角 ⚙ 可再打开。',
    'panel.title': '今日孵化',
    'bag.title': '背包 · 日历',
    'bag.cal': '日历',
    'bag.list': '收藏',
    'bag.today': '回到今天',
    'bag.empty': '还没有收藏的摸鱼灵',
    'bag.viewing': '正在看',
    'guide.title': '嗨～我是摸鱼灵蛋',
    'guide.ok': '知道啦 ✿',
  },
  en: {
    'hud.hits': 'hits',
    'btn.day': 'Day',
    'btn.save': 'Save',
    'btn.pack': 'Pack',
    'btn.settings': 'Settings',
    'btn.quit': 'Quit',
    'settings.title': 'Settings',
    'settings.opacity': 'Opacity',
    'settings.size': 'Size',
    'settings.lock': 'Lock position',
    'settings.showChrome': 'Show buttons',
    'settings.showHud': 'Show activity',
    'settings.lang': 'Language',
    'settings.guide': 'Guide',
    'settings.note': 'If buttons are hidden, tap ⚙ top-right to reopen.',
    'panel.title': 'Day hatch',
    'bag.title': 'Pack · Calendar',
    'bag.cal': 'Calendar',
    'bag.list': 'Collection',
    'bag.today': 'Back to today',
    'bag.empty': 'No Loaflings saved yet',
    'bag.viewing': 'Viewing',
    'guide.title': 'Hi — I’m your Loafling egg',
    'guide.ok': 'Got it ✿',
  },
};

function t(locale, key) {
  const pack = STRINGS[locale] || STRINGS.zh;
  return pack[key] || STRINGS.en[key] || key;
}

function applyDomI18n(locale) {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    el.textContent = t(locale, key);
  });
  document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
}

module.exports = { STRINGS, t, applyDomI18n };
