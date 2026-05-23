importScripts('src/tab-filter.js');

const DEFAULT_SETTINGS = {
  autoCloseMinutes: 30,
  whitelist: []
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('checkTabsAlarm', { periodInMinutes: 1 });
  
  // Set default storage settings if not defined
  chrome.storage.local.get(['settings', 'lockedUrls', 'closedTabs', 'tabActivity'], (result) => {
    chrome.storage.local.set({
      settings: result.settings || DEFAULT_SETTINGS,
      lockedUrls: result.lockedUrls || [],
      closedTabs: result.closedTabs || [],
      tabActivity: result.tabActivity || {}
    });
  });
});

// Track Inactivity via Listeners
chrome.tabs.onActivated.addListener((activeInfo) => {
  // Record current active tab timestamp
  chrome.storage.local.get(['tabActivity'], (res) => {
    const tabActivity = res.tabActivity || {};
    tabActivity[activeInfo.tabId] = Date.now();
    chrome.storage.local.set({ tabActivity });
  });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get(['tabActivity'], (res) => {
    const tabActivity = res.tabActivity || {};
    delete tabActivity[tabId];
    chrome.storage.local.set({ tabActivity });
  });
});

// Alarm processing loop
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkTabsAlarm') {
    chrome.storage.local.get(['settings', 'lockedUrls', 'closedTabs', 'tabActivity'], (res) => {
      const settings = res.settings || DEFAULT_SETTINGS;
      const lockedUrls = res.lockedUrls || [];
      const closedTabs = res.closedTabs || [];
      const tabActivity = res.tabActivity || {};

      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          // Guarantee private browsing session isolation
          if (tab.incognito) return;

          // Seed active tab activity if missing
          if (!tabActivity[tab.id]) {
            tabActivity[tab.id] = Date.now();
            return;
          }

          if (shouldCloseTab(tab, settings, lockedUrls, tabActivity)) {
            // Archive closed tab details
            const tabMeta = {
              id: Date.now() + Math.random().toString(36).substr(2, 5), // Unique metadata ID
              url: tab.url,
              title: tab.title,
              faviconUrl: tab.favIconUrl || '',
              closedAt: Date.now()
            };

            closedTabs.unshift(tabMeta);
            if (closedTabs.length > 100) {
              closedTabs.pop(); // Cap size at 100 entries
            }

            chrome.storage.local.set({ closedTabs }, () => {
              chrome.tabs.remove(tab.id);
            });
          }
        });
        
        chrome.storage.local.set({ tabActivity });
      });
    });
  }
});
