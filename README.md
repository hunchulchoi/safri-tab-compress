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

## 🚀 macOS Safari Extension Compilation & Build Guide

Due to Apple's sandbox security policies, Safari extensions on macOS cannot be loaded simply as loose web directories. They must be wrapped into a macOS Xcode Host App. You can easily compile and build the extension in a few steps using built-in terminal tools.

### Step 1: Prepare Xcode Command Line Tools
1. Ensure **Xcode** (from Mac App Store) is installed on your Mac.
2. Open terminal and install the Command Line Tools (skip if already installed):
   ```bash
   xcode-select --install
   ```

### Step 2: Generate macOS Xcode Project using Converter Tool
Call Apple's built-in `safari-web-extension-converter` to convert this pure Web Extension directory into a macOS Xcode project:
```bash
xcrun safari-web-extension-converter /Users/hunchulchoi/projects/workspace/myside/safari-tab-compress
```
- When prompted for configuration choices (e.g., choosing Swift/macOS App configuration), accept the default values.
- Once finished, the newly generated `.xcodeproj` project will open in Xcode automatically.

### Step 3: Compile and Build in Xcode
1. In Xcode, ensure the build target/scheme in the top-left area is configured to **`Safari Tab Compress (macOS)`** or **`macOS App`**.
2. Press **`Cmd + R`** or click the **Run / Play** icon on the top-left to compile and build the project.
3. Upon successful compilation, a macOS hosting application window will launch. As long as this host application runs or has been registered, Safari will securely link the extension.

### Step 4: Enable in Safari Browser
1. Launch **Safari**.
2. Navigate to **[Safari] -> [Settings / Preferences] -> [Advanced]** tab.
3. Enable the **"Show Develop menu in menu bar"** option at the bottom.
4. Click **[Develop]** in the Safari top menu bar and check **"Allow Unsigned Extensions"**.
   - *Note: This safety switch automatically resets to off when Safari exits. Remember to toggle it back on when initiating new development tests.*
5. Navigate to **[Safari Settings] -> [Extensions]** tab and check the checkbox next to **`Safari Tab Compress`** to load the popup timer in your toolbar!
