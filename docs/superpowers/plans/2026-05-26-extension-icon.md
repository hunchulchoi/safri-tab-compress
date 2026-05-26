# Safari Tab Compress - Extension Icon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create and integrate a premium high-performance themed icon set for the Safari Tab Compress extension.

**Architecture:** We will generate a master logo image using the image generator tool, place it in `popup/images/`, and utilize macOS's native `sips` tool to crop/resize it to all standard extension icon sizes. We will then update `manifest.json` to register the icon files, ensuring that Xcode's folder reference copies them automatically.

**Tech Stack:** macOS native `sips` utility, JSON config, Git.

---

### Task 1: Generate Master Icon Asset

**Files:**
- Create: `popup/images/icon-master.png`

- [ ] **Step 1: Generate the high-quality master icon image**
  Use the image generation tool to produce a beautiful futuristic 512x512px icon.
  
  **Prompt**: "A highly premium, minimal browser tab silhouette on the left that dynamically transitions and sharpens into a modern neon electric cyan-teal lightning bolt on the right. Squircle rounded square base in sleek dark midnight gray #12151C, electric glowing aura, futuristic vibe, vector illustration, vector logo"

- [ ] **Step 2: Verify master icon output exists**
  Run: `ls -la popup/images/icon-master.png`
  Expected: File size is greater than 0 bytes and exists.

- [ ] **Step 3: Commit the master icon**
  Run:
  ```bash
  git add popup/images/icon-master.png
  git commit -m "feat: generate master extension icon image"
  ```

---

### Task 2: Downscale Master Icon to Extension Dimensions

**Files:**
- Create: `popup/images/icon-16.png`
- Create: `popup/images/icon-32.png`
- Create: `popup/images/icon-48.png`
- Create: `popup/images/icon-128.png`

- [ ] **Step 1: Run native sips commands to scale standard icons**
  Run:
  ```bash
  sips -z 16 16 popup/images/icon-master.png --out popup/images/icon-16.png
  sips -z 32 32 popup/images/icon-master.png --out popup/images/icon-32.png
  sips -z 48 48 popup/images/icon-master.png --out popup/images/icon-48.png
  sips -z 128 128 popup/images/icon-master.png --out popup/images/icon-128.png
  ```

- [ ] **Step 2: Verify all output files exist with their correct properties**
  Run: `file popup/images/icon-16.png popup/images/icon-32.png popup/images/icon-48.png popup/images/icon-128.png`
  Expected: Output displays PNG image data with matching 16x16, 32x32, 48x48, and 128x128 sizes.

- [ ] **Step 3: Commit the scaled icon set**
  Run:
  ```bash
  git add popup/images/icon-16.png popup/images/icon-32.png popup/images/icon-48.png popup/images/icon-128.png
  git commit -m "feat: generate standard multi-size icons using sips"
  ```

---

### Task 3: Register Icons in manifest.json

**Files:**
- Modify: `manifest.json`

- [ ] **Step 1: Add icons and action.default_icon sections to manifest.json**
  Update the configuration in `manifest.json` to include `"icons"` and `"action.default_icon"`.
  
  **Expected changes**:
  ```diff
  +   "icons": {
  +     "16": "popup/images/icon-16.png",
  +     "32": "popup/images/icon-32.png",
  +     "48": "popup/images/icon-48.png",
  +     "128": "popup/images/icon-128.png"
  +   },
      "background": {
        "service_worker": "background.js"
      },
      "action": {
  -     "default_popup": "popup/popup.html"
  +     "default_popup": "popup/popup.html",
  +     "default_icon": {
  +       "16": "popup/images/icon-16.png",
  +       "32": "popup/images/icon-32.png",
  +       "48": "popup/images/icon-48.png",
  +       "128": "popup/images/icon-128.png"
  +     }
      }
  ```

- [ ] **Step 2: Validate manifest.json is proper JSON**
  Run: `node -e "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8'))"`
  Expected: Completes with no syntax errors.

- [ ] **Step 3: Commit the manifest updates**
  Run:
  ```bash
  git add manifest.json
  git commit -m "config: register extension icons in manifest.json"
  ```

---

### Task 4: Xcode Verification

**Files:**
- None (Build verification only)

- [ ] **Step 1: Verify compilation of web extension**
  Use xcodebuild to verify that the project compiles correctly and integrates the new files.
  Run:
  ```bash
  xcodebuild -project "Safari Tab Compress/Safari Tab Compress.xcodeproj" -scheme "Safari Tab Compress" -configuration Debug build
  ```
  Expected: **** BUILD SUCCEEDED ****
