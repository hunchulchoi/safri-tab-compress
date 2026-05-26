# Safari Tab Compress - Extension Icon Design Specification

This document defines the visual specification, generation process, and configuration for the **Safari Tab Compress** browser extension icons.

## Overview
To replace the default Safari/Xcode extension placeholder with a premium, high-performance themed icon that integrates seamlessly with the glassmorphic slate dark UI.

---

## 1. Visual Specification
- **Theme**: Approach A - "Speed Stream" (Lightning & Tab Integration)
- **Background Shape**: Squircle / macOS rounded rectangle (22.3% corner radius) on a dark slate base (`#12151C`).
- **Core Symbol**: A minimalist browser tab silhouette on the left that dynamically sharpens and transitions into a modern lightning bolt shape on the right.
- **Color Scheme**: Neon gradient from Electric Cyan (`#00F2FE`) to Royal Blue (`#4FACFE`), representing cold memory optimization and hyper-fast browser execution.
- **Lighting & Details**: A subtle outer glowing aura around the electric symbol to ensure strong pop and maximum visibility against dark browser toolbars.

---

## 2. Asset Matrix
The extension icons are organized under the `popup/images/` directory. By nesting them under the `popup/` directory, Xcode automatically bundles them into the compiled macOS Extension resources via the existing folder reference.

| File Path | Dimension | Target Context |
| :--- | :--- | :--- |
| `popup/images/icon-16.png` | 16x16 px | Standard DPI Toolbar Icon, Favicon |
| `popup/images/icon-32.png` | 32x32 px | High DPI Retina Toolbar Icon, Extension Details |
| `popup/images/icon-48.png` | 48x48 px | Safari/Chrome Extensions Management Page |
| `popup/images/icon-128.png` | 128x128 px | Branding page, Popover, Apple/Web Stores |

---

## 3. Configuration
The new icons will be registered in `manifest.json` under both the global `icons` dictionary and the `action.default_icon` dictionary for multi-browser MV3 compliance.

```json
{
  "icons": {
    "16": "popup/images/icon-16.png",
    "32": "popup/images/icon-32.png",
    "48": "popup/images/icon-48.png",
    "128": "popup/images/icon-128.png"
  },
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "popup/images/icon-16.png",
      "32": "popup/images/icon-32.png",
      "48": "popup/images/icon-48.png",
      "128": "popup/images/icon-128.png"
    }
  }
}
```

---

## 4. Verification Plan
1. **Visual Fidelity**: Open the generated image in a previewer to verify that colors, boundaries, and contrast meet premium standards.
2. **Metadata Integrity**: Verify that `manifest.json` compiles with standard JSON parser.
3. **Build Success**: Verify that building the extension resources successfully propagates the icon assets into the compiled macOS Safari App bundle.
