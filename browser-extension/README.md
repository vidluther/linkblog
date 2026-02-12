# Linkblog Browser Extension

Save links to your linkblog from any browser tab — via toolbar button, right-click context menu, or keyboard shortcut.

Part of the [linkblog](https://github.com/vidluther/linkblog) monorepo.

## Features

- **Toolbar button**: Click the extension icon, see the current URL, and save with one click
- **Context menu**: Right-click any page or link → "Save to Linkblog"
- **Keyboard shortcut**: `Alt+Shift+L` saves the current page instantly
- **Notifications**: Get confirmation or error feedback via browser notifications
- **Configurable**: Set your API key and endpoint in the popup settings
- **Cross-browser**: Works in Chrome and Safari (via Xcode Web Extension Converter)

## Prerequisites

- Node.js 18+
- pnpm

## Setup

```bash
pnpm install
pnpm --filter linkblog-extension build
```

## Development

```bash
# Watch for changes
pnpm --filter linkblog-extension watch

# Lint with OXC
pnpm --filter linkblog-extension lint

# Type check only
pnpm --filter linkblog-extension typecheck
```

## Loading in Chrome

1. Run `pnpm --filter linkblog-extension build`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder
5. Click the extension icon to configure your API key

## Loading in Safari

1. Run `pnpm --filter linkblog-extension build`
2. Open Xcode
3. File → New → Project → Safari Extension App
4. Use the Web Extension Converter to import from the `dist` folder
5. Build and run

## Project Structure

```
browser-extension/
├── manifest.json                  # Chrome extension manifest (MV3)
├── src/
│   ├── background/
│   │   └── service-worker.ts      # API calls, context menu, keyboard shortcut
│   ├── popup/
│   │   ├── popup.html             # Popup UI
│   │   ├── popup.css              # Popup styles
│   │   └── popup.ts               # Popup logic
│   └── types/
│       └── index.ts               # Shared TypeScript interfaces
├── icons/                         # Extension icons (16, 48, 128px)
├── package.json
└── tsconfig.json
```

## API

The extension POSTs to your linkblog API endpoint (default: `https://api.linkblog.in/links`).

**Success response:**
```json
{
  "id": 17,
  "url": "https://example.com",
  "title": "Example Page",
  "summary": "Page summary",
  "created_at": "2026-02-11T13:07:48.746074+00:00",
  "updated_at": "2026-02-11T13:07:48.746074+00:00"
}
```

**Error response:**
```json
{
  "message": ["url must be a URL address"],
  "error": "Bad Request",
  "statusCode": 400
}
```

## Keyboard Shortcut

Default: `Alt+Shift+L`

To customize in Chrome: go to `chrome://extensions/shortcuts`
