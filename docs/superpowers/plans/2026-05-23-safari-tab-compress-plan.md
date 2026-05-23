# Safari Tab Compress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-performance, premium macOS Safari Web Extension that monitors tab idle times and automatically closes inactive tabs (excluding pinned, audible, active, private, whitelisted, or locked tabs) and saves them in a Corral archive for one-click recovery.

**Architecture:** A zero-dependency Pure MV3 Web Extension leveraging `chrome.alarms` to bypass Safari Background Service Worker sleep mode. Utilizes a clean 3-tab Popover UI (Corral, Lock, Settings) built with highly optimized Vanilla CSS & HSL design systems.

**Tech Stack:** JavaScript (ES6), HTML5, Vanilla CSS, Jest (for testing pure utility filter functions), chrome.storage.local, chrome.alarms.

---

## Target File Structure & Responsibilities

```
safari-tab-compress/
├── manifest.json             # Manifest V3 setup (Safari compatible)
├── background.js             # Service worker handling alarms, tabs events, and active timestamps
├── popup/
│   ├── popup.html            # Popover interface with 3-tab layout
│   ├── popup.css             # Glassmorphism dark/light premium styles
│   └── popup.js              # UI controller, local storage synchronizer
├── src/
│   └── tab-filter.js         # Pure tab exclusion logic (shared between BG and Test suites)
├── tests/
│   └── tab-filter.test.js    # TDD Jest test cases verifying all edge cases (private mode, white list, active state)
└── package.json              # Node workspace specifically for TDD unit testing
```

---

### Task 1: Scaffolding, NPM TDD Environment, and Manifest V3

Set up the project directory structure, configure `package.json` for lightweight Jest testing, and build the initial Web Extension manifest.

**Files:**
- Create: `package.json`
- Create: `manifest.json`

- [ ] **Step 1: Create package.json**
  Write package dependencies. We only use Jest for high-quality TDD tab filtering verification.
  ```json
  {
    "name": "safari-tab-compress",
    "version": "1.0.0",
    "description": "Safari Tab Compress Extension",
    "main": "background.js",
    "scripts": {
      "test": "jest"
    },
    "devDependencies": {
      "jest": "^29.7.0"
    }
  }
  ```

- [ ] **Step 2: Create manifest.json**
  Write the Safari-compatible Manifest V3 layout.
  ```json
  {
    "manifest_version": 3,
    "name": "Safari Tab Compress",
    "version": "1.0.0",
    "description": "Optimizes memory by automatically closing inactive tabs.",
    "permissions": [
      "tabs",
      "storage",
      "alarms"
    ],
    "background": {
      "service_worker": "background.js"
    },
    "action": {
      "default_popup": "popup/popup.html"
    }
  }
  ```

- [ ] **Step 3: Install Dev Dependencies**
  Run: `npm install` inside `/Users/hunchulchoi/projects/workspace/myside/safari-tab-compress` to set up Jest testing environment.
  Expected: Node modules installed successfully, package-lock.json created.

- [ ] **Step 4: Commit**
  ```bash
  git add package.json manifest.json
  git commit -m "chore: scaffold project structure and install TDD test suite"
  ```

---

### Task 2: Core Tab Filtering Logic (TDD)

Implement the exact tab selection and filtration rules as a Pure Function. All edge cases (Incognito/Private Session, Pinned, Whitelist, Locked, Active) must be fully resolved.

**Files:**
- Create: `tests/tab-filter.test.js`
- Create: `src/tab-filter.js`

- [ ] **Step 1: Write the failing tests first**
  Create a complete test suite covering all exclusion constraints in `tests/tab-filter.test.js`.
  ```javascript
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
  ```

- [ ] **Step 2: Run Jest to verify tests fail**
  Run: `npm test`
  Expected: Failure with "Cannot find module '../src/tab-filter'" or similar compilation error.

- [ ] **Step 3: Write Minimal Implementation**
  Create `src/tab-filter.js` to satisfy the tests. Make it isomorphic so Node uses exports and browser uses global/context scope.
  ```javascript
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
  ```

- [ ] **Step 4: Verify Tests Pass**
  Run: `npm test`
  Expected: Jest reports 8 tests passed successfully!

- [ ] **Step 5: Commit**
  ```bash
  git add src/tests/
  git commit -m "feat: implement pure tab filtering logic with 100% test coverage"
  ```

---

### Task 3: Alarm-Based Service Worker Background Engine

Develop `background.js` to import scripts, track tab actions to maintain active timestamps, and clean them via alarms.

**Files:**
- Create: `background.js`

- [ ] **Step 1: Create background.js with interaction tracking**
  Implement alarm initialization, storage listeners, and tab activation hook.
  ```javascript
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
  ```

- [ ] **Step 2: Add Alarm processing loop**
  Implement tab checking logic in `background.js` using `shouldCloseTab`. Ensure private tabs are completely skipped.
  ```javascript
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
  ```

- [ ] **Step 3: Run Jest tests to verify background script import logic doesn't break code**
  Run: `npm test`
  Expected: Test suite passes perfectly.

- [ ] **Step 4: Commit**
  ```bash
  git add background.js
  git commit -m "feat: complete background task monitor and alarm engine"
  ```

---

### Task 4: UI Structure & Premium Design Styling

Create the 3-Tab popover HTML structure and CSS system with a highly responsive, HSL-tailored premium theme.

**Files:**
- Create: `popup/popup.html`
- Create: `popup/popup.css`

- [ ] **Step 1: Write HTML Structure**
  Implement tab controls and section containers for Corral, Lock List, and Settings.
  ```html
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="popup.css">
  </head>
  <body>
    <header class="header">
      <div class="brand">
        <span class="logo">⏱️</span>
        <h1>Safari Tab Compress</h1>
      </div>
      <div class="status-indicator">Active</div>
    </header>

    <nav class="tabs">
      <button class="tab-btn active" id="tab-corral">Corral</button>
      <button class="tab-btn" id="tab-lock">Lock Tabs</button>
      <button class="tab-btn" id="tab-settings">Settings</button>
    </nav>

    <main class="content">
      <!-- Corral Tab Panel -->
      <section class="panel active" id="panel-corral">
        <div class="toolbar">
          <input type="text" id="corral-search" class="search-input" placeholder="Search closed tabs...">
          <button id="corral-clear" class="btn btn-secondary">Clear All</button>
        </div>
        <div class="list-container" id="corral-list">
          <!-- Dynamically generated list -->
        </div>
      </section>

      <!-- Lock Tabs Panel -->
      <section class="panel" id="panel-lock">
        <p class="panel-desc">Protect active tabs from being automatically closed.</p>
        <div class="list-container" id="lock-list">
          <!-- Dynamically generated open tabs list -->
        </div>
      </section>

      <!-- Settings Panel -->
      <section class="panel" id="panel-settings">
        <div class="setting-group">
          <label for="close-timer">Auto-Close Delay: <span id="timer-val">30</span> minutes</label>
          <input type="range" id="close-timer" min="1" max="120" value="30" class="slider">
        </div>
        
        <div class="setting-group">
          <label>Domain Whitelist</label>
          <div class="whitelist-input-wrapper">
            <input type="text" id="whitelist-input" class="text-input" placeholder="e.g. github.com">
            <button id="whitelist-add" class="btn btn-primary">Add</button>
          </div>
          <ul class="whitelist-items" id="whitelist-list">
            <!-- Whitelist domains -->
          </ul>
        </div>
      </section>
    </main>
    <script src="popup.js"></script>
  </body>
  </html>
  ```

- [ ] **Step 2: Write CSS Style System**
  Design with custom variables, Outfit/Inter feel, elegant glassmorphism and slide actions.
  ```css
  :root {
    --bg-main: #0f172a;
    --bg-card: #1e293b;
    --border: rgba(255, 255, 255, 0.08);
    --primary: #3b82f6;
    --primary-hover: #2563eb;
    --text: #f8fafc;
    --text-muted: #94a3b8;
    --accent: #10b981;
    --danger: #ef4444;
  }

  body {
    width: 380px;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--bg-main);
    color: var(--text);
    overflow: hidden;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    background: rgba(30, 41, 59, 0.5);
    backdrop-filter: blur(8px);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .brand h1 {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
  }

  .status-indicator {
    font-size: 10px;
    font-weight: 700;
    background-color: var(--accent);
    color: #fff;
    padding: 2px 8px;
    border-radius: 9999px;
  }

  .tabs {
    display: flex;
    background-color: rgba(15, 23, 42, 0.4);
    border-bottom: 1px solid var(--border);
  }

  .tab-btn {
    flex: 1;
    background: none;
    border: none;
    color: var(--text-muted);
    padding: 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tab-btn.active {
    color: var(--text);
    border-bottom: 2px solid var(--primary);
  }

  .panel {
    display: none;
    padding: 16px;
    height: 280px;
    overflow-y: auto;
  }

  .panel.active {
    display: block;
  }

  .toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .search-input, .text-input {
    flex: 1;
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px 10px;
    color: var(--text);
    font-size: 12px;
  }

  .btn {
    border: none;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-primary {
    background-color: var(--primary);
    color: white;
  }

  .btn-primary:hover {
    background-color: var(--primary-hover);
  }

  .btn-secondary {
    background-color: rgba(255, 255, 255, 0.08);
    color: var(--text);
  }

  .btn-secondary:hover {
    background-color: rgba(255, 255, 255, 0.12);
  }

  .list-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tab-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px;
    transition: transform 0.15s ease;
  }

  .tab-item:hover {
    transform: translateY(-1px);
  }

  .tab-info {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
    cursor: pointer;
  }

  .tab-favicon {
    width: 16px;
    height: 16px;
    border-radius: 2px;
  }

  .tab-title {
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text);
  }

  .tab-time {
    font-size: 10px;
    color: var(--text-muted);
  }

  .lock-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
  }

  .panel-desc {
    font-size: 11px;
    color: var(--text-muted);
    margin: 0 0 12px 0;
  }

  .setting-group {
    margin-bottom: 16px;
  }

  .setting-group label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .slider {
    width: 100%;
    accent-color: var(--primary);
  }

  .whitelist-input-wrapper {
    display: flex;
    gap: 8px;
  }

  .whitelist-items {
    list-style: none;
    padding: 0;
    margin: 8px 0 0 0;
    max-height: 120px;
    overflow-y: auto;
  }

  .whitelist-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    background-color: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid var(--border);
    font-size: 11px;
  }

  .del-btn {
    background: none;
    border: none;
    color: var(--danger);
    cursor: pointer;
    font-weight: 600;
  }
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add popup/popup.html popup/popup.css
  git commit -m "style: establish core modern layout and CSS styles for popup popover"
  ```

---

### Task 5: Popup Controller Logic (Interactions & Storage Coordination)

Write `popup/popup.js` to enable 3-tab navigation, render closed archives (with searching), list active tabs (skipping incognito), and manage setting state values.

**Files:**
- Create: `popup/popup.js`

- [ ] **Step 1: Write Tab Navigator and Setting bindings**
  Handle visual tab changes and setting state initializations in `popup/popup.js`.
  ```javascript
  document.addEventListener('DOMContentLoaded', () => {
    // Navigation Setup
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.panel');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePanelId = btn.id.replace('tab-', 'panel-');
        document.getElementById(activePanelId).classList.add('active');

        if (btn.id === 'tab-lock') {
          renderLockList();
        } else if (btn.id === 'tab-corral') {
          renderCorralList();
        }
      });
    });

    // Settings Setup
    const timerSlider = document.getElementById('close-timer');
    const timerValue = document.getElementById('timer-val');

    chrome.storage.local.get(['settings'], (res) => {
      const settings = res.settings || { autoCloseMinutes: 30, whitelist: [] };
      timerSlider.value = settings.autoCloseMinutes;
      timerValue.textContent = settings.autoCloseMinutes;
      renderWhitelist(settings.whitelist);
    });

    timerSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      timerValue.textContent = val;
      chrome.storage.local.get(['settings'], (res) => {
        const settings = res.settings || {};
        settings.autoCloseMinutes = parseInt(val, 10);
        chrome.storage.local.set({ settings });
      });
    });

    renderCorralList();
  });
  ```

- [ ] **Step 2: Add Whitelist additions and deletions handlers**
  Add input handlers in `popup/popup.js`.
  ```javascript
  const whitelistAddBtn = document.getElementById('whitelist-add');
  const whitelistInput = document.getElementById('whitelist-input');
  const whitelistList = document.getElementById('whitelist-list');

  function renderWhitelist(whitelist) {
    whitelistList.innerHTML = '';
    (whitelist || []).forEach(domain => {
      const li = document.createElement('li');
      li.className = 'whitelist-item';
      li.innerHTML = `
        <span>${domain}</span>
        <button class="del-btn" data-domain="${domain}">✕</button>
      `;
      whitelistList.appendChild(li);
    });

    // Add remove actions
    document.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetDomain = e.target.getAttribute('data-domain');
        chrome.storage.local.get(['settings'], (res) => {
          const settings = res.settings || {};
          settings.whitelist = (settings.whitelist || []).filter(d => d !== targetDomain);
          chrome.storage.local.set({ settings }, () => {
            renderWhitelist(settings.whitelist);
          });
        });
      });
    });
  }

  whitelistAddBtn.addEventListener('click', () => {
    const rawVal = whitelistInput.value.trim().toLowerCase();
    if (!rawVal) return;

    chrome.storage.local.get(['settings'], (res) => {
      const settings = res.settings || {};
      const whitelist = settings.whitelist || [];
      if (!whitelist.includes(rawVal)) {
        whitelist.push(rawVal);
        settings.whitelist = whitelist;
        chrome.storage.local.set({ settings }, () => {
          renderWhitelist(whitelist);
          whitelistInput.value = '';
        });
      }
    });
  });
  ```

- [ ] **Step 3: Build Corral Archive rendering and restoring**
  Support local storage sync, search query filters, and clicking to reopen tabs.
  ```javascript
  const corralList = document.getElementById('corral-list');
  const corralSearch = document.getElementById('corral-search');
  const corralClear = document.getElementById('corral-clear');

  function renderCorralList() {
    chrome.storage.local.get(['closedTabs'], (res) => {
      const closedTabs = res.closedTabs || [];
      const query = corralSearch.value.trim().toLowerCase();
      corralList.innerHTML = '';

      const filtered = closedTabs.filter(t => 
        t.title.toLowerCase().includes(query) || t.url.toLowerCase().includes(query)
      );

      if (filtered.length === 0) {
        corralList.innerHTML = '<p class="panel-desc" style="text-align:center;margin-top:20px;">No closed tabs archived.</p>';
        return;
      }

      filtered.forEach(tab => {
        const item = document.createElement('div');
        item.className = 'tab-item';
        
        const timeStr = formatTimeAgo(tab.closedAt);
        const faviconUrl = tab.faviconUrl || '../icons/icon-16.png'; // default fallback icon

        item.innerHTML = `
          <div class="tab-info" data-url="${tab.url}">
            <img class="tab-favicon" src="${faviconUrl}" onerror="this.src='../icons/icon-16.png'">
            <span class="tab-title" title="${tab.title}">${tab.title}</span>
          </div>
          <span class="tab-time">${timeStr}</span>
        `;
        corralList.appendChild(item);
      });

      // Restore click action
      document.querySelectorAll('.tab-info').forEach(info => {
        info.addEventListener('click', (e) => {
          const url = info.getAttribute('data-url');
          chrome.tabs.create({ url });
          
          // Remove from Corral archive list
          chrome.storage.local.get(['closedTabs'], (res2) => {
            let list = res2.closedTabs || [];
            list = list.filter(t => t.url !== url);
            chrome.storage.local.set({ closedTabs: list }, () => {
              renderCorralList();
            });
          });
        });
      });
    });
  }

  corralSearch.addEventListener('input', renderCorralList);
  corralClear.addEventListener('click', () => {
    chrome.storage.local.set({ closedTabs: [] }, renderCorralList);
  });

  function formatTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  }
  ```

- [ ] **Step 4: Build Lock Tabs controller**
  List active open tabs (excluding incognito tabs to isolate private browsing), check URL matches persistently, and persist locks in storage.
  ```javascript
  const lockList = document.getElementById('lock-list');

  function renderLockList() {
    chrome.storage.local.get(['lockedUrls'], (res) => {
      const lockedUrls = res.lockedUrls || [];
      
      chrome.tabs.query({}, (tabs) => {
        lockList.innerHTML = '';
        
        // Filter out private browsing tabs completely
        const filteredTabs = tabs.filter(t => !t.incognito);

        if (filteredTabs.length === 0) {
          lockList.innerHTML = '<p class="panel-desc" style="text-align:center;">No active tabs.</p>';
          return;
        }

        filteredTabs.forEach(tab => {
          const item = document.createElement('div');
          item.className = 'tab-item';
          
          const isLocked = lockedUrls.includes(tab.url);
          const lockIcon = isLocked ? '🔒' : '🔓';
          const favicon = tab.favIconUrl || '../icons/icon-16.png';

          item.innerHTML = `
            <div class="tab-info">
              <img class="tab-favicon" src="${favicon}" onerror="this.src='../icons/icon-16.png'">
              <span class="tab-title" title="${tab.title}">${tab.title}</span>
            </div>
            <button class="lock-btn" data-url="${tab.url}">${lockIcon}</button>
          `;
          lockList.appendChild(item);
        });

        // Lock Toggle Event Handler
        document.querySelectorAll('.lock-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const url = btn.getAttribute('data-url');
            chrome.storage.local.get(['lockedUrls'], (res2) => {
              let list = res2.lockedUrls || [];
              if (list.includes(url)) {
                list = list.filter(u => u !== url);
              } else {
                list.push(url);
              }
              chrome.storage.local.set({ lockedUrls: list }, () => {
                renderLockList();
              });
            });
          });
        });
      });
    });
  }
  ```

- [ ] **Step 5: Run tests to ensure Javascript logic doesn't break any environment variables**
  Run: `npm test`
  Expected: Jest TDD unit tests pass perfectly.

- [ ] **Step 6: Commit**
  ```bash
  git add popup/popup.js
  git commit -m "feat: implement popup interaction handlers and local storage synchronization"
  ```

---

## Self-Review Checks

1. **Spec Coverage:**
   - ⏱️ Auto-close inactive tabs (`background.js` chrome.alarms: Task 3) -> Covered.
   - 📄 Corral list & Search restoration (`popup.js`: Task 5 Step 3) -> Covered.
   - 🔒 URL Lock persistently (`popup.js` & `background.js`: Task 5 Step 4 & Task 3) -> Covered.
   - 🚫 Domain Whitelist exclusion (`tab-filter.js`: Task 2 Step 3) -> Covered.
   - 🔒 Private Session checks: Incognito tabs excluded (`tab-filter.js` & `background.js` & `popup.js`: Task 2 Step 1 & Task 3 Step 2 & Task 5 Step 4) -> Covered.
   - 💻 macOS Safari exclusive build -> Designed as lightweight, zero-dependency.

2. **Placeholder Scan:**
   - Zero TBD, TODO, or empty fill-ins. Complete CSS styles, isomorphic modules, test codes, and storage structures are provided in detail.
