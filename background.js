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
        // Guarantee at least 5 tabs are kept open at all times
        if (tabs.length <= 5) return;

        // Seed missing tab activity timestamps
        tabs.forEach((tab) => {
          if (!tabActivity[tab.id]) {
            tabActivity[tab.id] = Date.now();
          }
        });

        // Gather all eligible tabs that exceed the inactive timer
        const candidateTabs = tabs.filter((tab) => {
          if (tab.incognito) return false;
          return shouldCloseTab(tab, settings, lockedUrls, tabActivity);
        });

        if (candidateTabs.length === 0) return;

        // Sort candidates so the oldest inactive tab is closed first
        candidateTabs.sort((a, b) => (tabActivity[a.id] || 0) - (tabActivity[b.id] || 0));

        // Max tabs we are allowed to close to keep at least 5 open
        const maxToClose = tabs.length - 5;
        const targetsToClose = candidateTabs.slice(0, maxToClose);

        targetsToClose.forEach((tab) => {
          const tabMeta = {
            id: Date.now() + Math.random().toString(36).substr(2, 5),
            url: tab.url,
            title: tab.title,
            faviconUrl: tab.favIconUrl || '',
            closedAt: Date.now()
          };

          closedTabs.unshift(tabMeta);
          if (closedTabs.length > 100) {
            closedTabs.pop();
          }

          chrome.tabs.remove(tab.id);
        });

        chrome.storage.local.set({ closedTabs, tabActivity });
      });
    });
  }
});
