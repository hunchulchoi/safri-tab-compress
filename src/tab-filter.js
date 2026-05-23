function shouldCloseTab(tab, settings, lockedUrls, activityMap) {
  if (tab.incognito) return false;
  if (tab.active) return false;
  if (tab.pinned) return false;
  if (tab.audible) return false;

  // Check Whitelist (Domain Match)
  const tabUrl = tab.url || '';
  try {
    const tabDomain = new URL(tabUrl).hostname.replace('www.', '');
    const isWhitelisted = (settings.whitelist || []).some(domain => {
      const cleanDomain = domain.replace('www.', '');
      return tabDomain === cleanDomain || tabDomain.endsWith('.' + cleanDomain);
    });
    if (isWhitelisted) return false;
  } catch (e) {
    // Fallback if URL is invalid (e.g. extension URLs)
  }

  // Check Locked URLs
  if ((lockedUrls || []).includes(tabUrl)) return false;

  // Inactivity threshold check
  const lastActive = activityMap[tab.id];
  if (!lastActive) return false; // Not registered yet, skip to be safe

  const elapsed = Date.now() - lastActive;
  const thresholdMs = (settings.autoCloseMinutes || 30) * 60 * 1000;
  
  return elapsed > thresholdMs;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { shouldCloseTab };
} else {
  self.shouldCloseTab = shouldCloseTab;
}
