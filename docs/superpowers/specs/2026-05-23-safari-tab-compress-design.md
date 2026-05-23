# Safari Tab Compress Design Spec

- **Date**: 2026-05-23
- **Author**: Antigravity (Google DeepMind Advanced Agentic Coding Team)
- **Project**: Safari Tab Compress (Mac Safari Web Extension)
- **Status**: Approved by User

---

## 1. Goal & Context
Safari Tab Compress is a lightweight, high-performance Safari Web Extension designed to optimize browser memory and tidy up messy tab layouts. Inspired by Tab Wrangler, it monitors tab idle times and automatically closes inactive tabs while preserving them in a "Corral" tab archive for seamless, one-click restoration.

To ensure maximum performance and absolute stability within Safari's restricted execution environment, this project is built from scratch as a **Safari-Optimized Web Extension (Zero-Dependency)** using modern WebExtension MV3 standards, Vanilla CSS, and native JavaScript.

---

## 2. Key Features

### A. Auto-Close Inactive Tabs (Background Engine)
- **Idle Monitor**: Periodically checks all open tabs. Tabs inactive for longer than a user-defined threshold (default: 30 minutes) are automatically closed.
- **Safari Sleep Mitigation**: Uses `chrome.alarms` scheduled every 1 minute to wake up the background script and process tab cleanups reliably.
- **Tracking Logic**: Listens to `chrome.tabs.onActivated` and `chrome.tabs.onUpdated` to accurately record absolute timestamps (`lastActiveTime`) for each tab in local storage.

### B. Closed Tab Archive (Corral)
- **Storage**: Automatically stores details of closed tabs: URL, Title, Favicon URL, and Closed Timestamp (`closedAt`).
- **Data Cap**: Limit stored tabs to a maximum of 100 entries to prevent local storage bloat.
- **UI & Recovery**: Inside the popup's "Corral" tab:
  - Lists archived tabs in descending order of closure time.
  - Search input filters archived tabs by title or URL instantly.
  - Single-click restores the tab in a new tab.
  - "Clear All" permanently purges the archive.

### C. Persistent Tab Lock (Lock Tabs)
- **Manual Lock**: Inside the popup's "Lock Tabs" tab, lists all currently active tabs with toggle locks.
- **Safety Guarantee**: Locked tabs are completely protected from the auto-close engine.
- **Persistence**: Locks are associated with the tab's URL pattern. This ensures that even if a tab is refreshed, or the browser is restarted, the lock remains active.

### D. Whitelist (Exclusion List)
- **Domain Exclusion**: Users can add specific domains (e.g., `github.com`, `youtube.com`) to a whitelist.
- **Protection**: Any tab belonging to a whitelisted domain is permanently protected from automatic closure.
- **Management**: Inside the popup's "Settings" tab, users can view, add, and remove domains from the whitelist.

---

## 3. UI/UX Design System
The popover interface will feel native, premium, and sleek on macOS, aligning with Apple's modern design philosophy:
- **Layout**: 3-Tab Split Layout (Corral, Lock Tabs, Settings) matching the approved mockup.
- **Theme**: Curated dark and light palettes leveraging CSS HSL variables. Glassmorphism blur effects (`backdrop-filter`) for dropdowns and headers.
- **Typography**: Modern sans-serif fonts (e.g., *Inter*, *Outfit*, or system default sans-serif) for ultimate readability.
- **Micro-Animations**: Smooth scale transforms on option hovers and tab switching.

---

## 4. Technical Architecture & File Structure

```
safari-tab-compress/
├── manifest.json         # Manifest V3 configuration (Safari Web Extension spec)
├── background.js         # Alarm-based tab tracking and auto-close engine
├── popup/
│   ├── popup.html        # 3-Tab user interface structure
│   ├── popup.css         # Modern, premium styling with custom variables
│   └── popup.js          # Tab interaction, storage sync, and UI state logic
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-05-23-safari-tab-compress-design.md  # This design spec
```

### A. Storage Architecture (`chrome.storage.local`)
The extension stores and coordinates its state using the following namespace structure:
```json
{
  "settings": {
    "autoCloseMinutes": 30,
    "whitelist": ["github.com", "google.com"]
  },
  "lockedUrls": [
    "https://github.com/tabwrangler/tabwrangler"
  ],
  "closedTabs": [
    {
      "url": "https://example.com",
      "title": "Example Domain",
      "faviconUrl": "https://example.com/favicon.ico",
      "closedAt": 1779538850000
    }
  ],
  "tabActivity": {
    "101": 1779538800000
  }
}
```

### B. Background Script Mechanism (`background.js`)
1. **Initialize Alarms**: On installation, create a 1-minute alarm: `chrome.alarms.create('checkTabsAlarm', { periodInMinutes: 1 });`
2. **Track Interaction**:
   - `chrome.tabs.onActivated.addListener`: Update `tabActivity[activeInfo.tabId] = Date.now()`.
   - `chrome.tabs.onRemoved.addListener`: Delete `tabActivity[tabId]`.
3. **Alarm Trigger**: On alarm fire, fetch settings, whitelists, locks, and tabs.
   - For each tab:
     - Check if it is the current active tab in its window (Never auto-close current active tab).
     - Check if URL is in `lockedUrls` or domain is in `whitelist`.
     - Calculate inactive duration: `Date.now() - tabActivity[tabId]`.
     - If duration > `autoCloseMinutes * 60 * 1000`, save tab metadata to `closedTabs` (prepending to array, keeping max 100 entries), then `chrome.tabs.remove(tabId)`.

---

## 5. Security, SOLID, & TDD Quality Standards

1. **Security-First**: Zero tracking, zero third-party scripts. All tab metadata resides locally inside the user's macOS secure storage container.
2. **SOLID & Clean Code**: Clean, decoupled functions inside `popup.js` and `background.js`. Standardized naming conventions.
3. **TDD / Fail-Safe**:
   - Write comprehensive unit/integration test logic (using a lightweight mockup environment or automated test runner if necessary) to test tab filtration under edge-cases (e.g. pinned tabs, audio-playing tabs, and sudden browser restarts).
   - Robust error handling for storage quota limits and empty/null data handling.

---

## 6. Verification Plan
- **Automated Tests**: Set up a lightweight Jest or node-based testing suite to validate filter logic (`shouldCloseTab(tab, settings, activity)`) with unit tests.
- **Manual Verification**: Run extension on macOS Safari via Developer mode, inspect Service Worker logs, verify that tab closes on short intervals (e.g. set timer to 1 minute for manual test), and confirm restoring tabs from the Corral works perfectly.
