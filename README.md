# Safari Tab Compress

**Safari Tab Compress** is a premium, lightweight, zero-dependency macOS Safari Web Extension designed to optimize browser memory and tidy up messy tab layouts. Inspired by Tab Wrangler, it monitors tab idle times and automatically closes inactive tabs while preserving them in a "Corral" tab archive for seamless, one-click restoration.

To ensure maximum performance and absolute stability within Safari's restricted execution environment, this project is built from scratch using modern WebExtension MV3 standards, Vanilla CSS HSL variables, and isomorphic native JavaScript.

---

## 🔒 Security & Privacy First

- **Private Session Isolation (Incognito)**: Tabs opened in Private Browsing mode are completely excluded from the auto-close engine. Under no circumstances will a private tab's metadata be stored in local storage, and private tabs are hidden from the extension's active lists to prevent leakage of private history.
- **Zero Tracking / Zero Dependencies**: All metadata stays locally on your machine within secure containerized local storage. No external libraries are used, minimizing supply-chain vulnerabilities and guaranteeing native browser performance.

---

## 🌟 Key Features

1. **Auto-Close Inactive Tabs**: Monitors tab idle times and closes them once they exceed a user-defined threshold.
2. **Safari Idle Mitigation**: Employs `chrome.alarms` at 1-minute intervals to prevent background service worker sleep mode, ensuring stable cleanups.
3. **Archived Closed Tabs (Corral)**: Automatically saves closed tab URLs, titles, and timestamps (capped at 100 entries to prevent storage bloat). Supports real-time text query filtering.
4. **Persistent Tab Lock**: Allows locking specific active tabs from the popup menu using URL pattern matching to preserve locks across browser restarts.
5. **Domain Whitelist**: Allows whitelisting specific domains (e.g. `github.com`) to protect all subpages permanently from auto-closure.
6. **Premium Popover Interface**: A curated, highly polished glassmorphic slate dark palette built using pure HSL CSS variables, custom scrollbars, and Outfit/Inter-styled native typography.

---

## 📁 File Structure

```
safari-tab-compress/
├── manifest.json             # Manifest V3 Extension configuration
├── background.js             # Service worker alarm tracking & auto-close loop
├── popup/
│   ├── popup.html            # Popover 3-tab layout interface
│   ├── popup.css             # Glassmorphism dark/light premium styles
│   └── popup.js              # Popup controller syncing settings & lists
├── src/
│   └── tab-filter.js         # Isomorphic utility containing tab filter logic
├── tests/
│   └── tab-filter.test.js    # Jest TDD test cases verifying 8 constraints
└── package.json              # Developer TDD dependencies
```

---

## 🛠️ Developer TDD & Verification

The project is strictly designed following Test-Driven Development (TDD). You can run Jest unit tests locally to verify all exclusion rules.

### Running Tests
1. Install testing dependencies:
   ```bash
   npm install
   ```
2. Execute Jest test suite:
   ```bash
   npm test
   ```

All core filtering constraints (Incognito isolation, whitelists, locks, active/pinned states) must report **PASS**.

---

## 🚀 How to Load in macOS Safari

1. Open **Safari** on macOS.
2. Go to **Safari** > **Settings** (or **Preferences**) > **Advanced**.
3. Enable **"Show Develop menu in menu bar"**.
4. Click **Develop** in the menu bar and check **"Allow Unsigned Extensions"**.
5. Package/compile the directory using Xcode's Safari Web Extension template and enable the extension in Safari Extensions Preferences.
