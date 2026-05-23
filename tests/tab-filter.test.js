const { shouldCloseTab } = require('../src/tab-filter');

describe('shouldCloseTab Filtration Tests', () => {
  const settings = {
    autoCloseMinutes: 30,
    whitelist: ['github.com', 'youtube.com']
  };
  
  const lockedUrls = ['https://example.com/locked-page'];

  test('should NOT close private browsing tabs', () => {
    const tab = { id: 1, incognito: true, active: false, pinned: false, url: 'https://unsafe.com' };
    const activityMap = { '1': Date.now() - 40 * 60 * 1000 };
    expect(shouldCloseTab(tab, settings, lockedUrls, activityMap)).toBe(false);
  });

  test('should NOT close current active tab', () => {
    const tab = { id: 2, incognito: false, active: true, pinned: false, url: 'https://google.com' };
    const activityMap = { '2': Date.now() - 40 * 60 * 1000 };
    expect(shouldCloseTab(tab, settings, lockedUrls, activityMap)).toBe(false);
  });

  test('should NOT close pinned tabs', () => {
    const tab = { id: 3, incognito: false, active: false, pinned: true, url: 'https://google.com' };
    const activityMap = { '3': Date.now() - 40 * 60 * 1000 };
    expect(shouldCloseTab(tab, settings, lockedUrls, activityMap)).toBe(false);
  });

  test('should NOT close audible (playing sound) tabs', () => {
    const tab = { id: 4, incognito: false, active: false, pinned: false, audible: true, url: 'https://spotify.com' };
    const activityMap = { '4': Date.now() - 40 * 60 * 1000 };
    expect(shouldCloseTab(tab, settings, lockedUrls, activityMap)).toBe(false);
  });

  test('should NOT close whitelisted domains', () => {
    const tab = { id: 5, incognito: false, active: false, pinned: false, url: 'https://github.com/tabwrangler' };
    const activityMap = { '5': Date.now() - 40 * 60 * 1000 };
    expect(shouldCloseTab(tab, settings, lockedUrls, activityMap)).toBe(false);
  });

  test('should NOT close explicitly locked URLs', () => {
    const tab = { id: 6, incognito: false, active: false, pinned: false, url: 'https://example.com/locked-page' };
    const activityMap = { '6': Date.now() - 40 * 60 * 1000 };
    expect(shouldCloseTab(tab, settings, lockedUrls, activityMap)).toBe(false);
  });

  test('should close eligible inactive tabs exceeding limit', () => {
    const tab = { id: 7, incognito: false, active: false, pinned: false, url: 'https://news.ycombinator.com' };
    const activityMap = { '7': Date.now() - 35 * 60 * 1000 }; // 35 min idle
    expect(shouldCloseTab(tab, settings, lockedUrls, activityMap)).toBe(true);
  });

  test('should NOT close tabs that are inactive but within threshold', () => {
    const tab = { id: 8, incognito: false, active: false, pinned: false, url: 'https://news.ycombinator.com' };
    const activityMap = { '8': Date.now() - 10 * 60 * 1000 }; // Only 10 min idle
    expect(shouldCloseTab(tab, settings, lockedUrls, activityMap)).toBe(false);
  });
});
