# Linkblog Browser Extension

Save links to your linkblog from any browser tab — via toolbar button, right-click context menu, or keyboard shortcut.

Part of the [linkblog](https://github.com/vidluther/linkblog) monorepo.

## Features

- **Toolbar button**: Click the extension icon, see the current URL, and save with one click
- **Context menu**: Right-click any page or link → "Save to Linkblog"
- **Keyboard shortcut**: `Alt+Shift+L` saves the current page instantly
- **Notifications**: Get confirmation or error feedback via browser notifications
- **Configurable**: Set your API key and endpoint in the popup settings
- **Cross-browser**: Works in Chrome and Firefox

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

1. Run `pnpm --filter linkblog-extension build:chrome`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist/chrome` folder
5. Click the extension icon to configure your API key

## Loading in Firefox (web-ext, recommended)

The fastest inner loop — launches a temporary Firefox profile with the extension installed and auto-reloads on changes.

```bash
pnpm --filter linkblog-extension dev:firefox
```

This builds the Firefox bundle into `dist/firefox/` and runs `web-ext run` against it. Edit a `.ts` file, run `pnpm --filter linkblog-extension build:firefox` again, and the extension reloads.

To validate the manifest against AMO submission rules without launching Firefox:

```bash
pnpm --filter linkblog-extension lint:webext
```

## Loading in Firefox (manual, unpacked)

If you'd rather not use `web-ext`:

1. Build: `pnpm --filter linkblog-extension build:firefox`
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on…** and pick `dist/firefox/manifest.json`
4. Click the extension icon to configure your API key

Temporary add-ons are removed when Firefox restarts.

## Packaging for distribution

Build distributable archives for one or both browsers:

```bash
pnpm --filter linkblog-extension package           # both browsers
pnpm --filter linkblog-extension package:firefox   # Firefox XPI only
pnpm --filter linkblog-extension package:chrome    # Chrome ZIP only
```

Outputs land in `browser-extension/dist/`:

- `linklog-firefox-<version>.xpi` — Firefox-loadable, also accepted by AMO
- `linklog-chrome-<version>.zip` — uploadable to the Chrome Web Store

### Bumping the version

Both stores reject re-uploads where the version didn't increase. Use the `bump` script to update `package.json` and both manifests in lockstep:

```bash
pnpm --filter linkblog-extension bump patch    # 1.0.2 → 1.0.3
pnpm --filter linkblog-extension bump minor    # 1.0.2 → 1.1.0
pnpm --filter linkblog-extension bump major    # 1.0.2 → 2.0.0
pnpm --filter linkblog-extension bump 1.2.3    # explicit version
```

Then re-run `pnpm --filter linkblog-extension package` to produce archives at the new version.

### Loading the Firefox XPI locally

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…** and pick the `.xpi` file (Firefox accepts both unpacked manifests and packed XPIs here)
3. Configure your API key in the popup

Note: Release Firefox refuses to _permanently_ install an unsigned XPI. The temporary install above works fine for local testing; permanent install requires signing — see "Publishing to AMO" below.

## Publishing to AMO (future)

Permanent install in release Firefox requires a signed extension. Steps (not yet executed):

1. Reserve the listing on [addons.mozilla.org](https://addons.mozilla.org/) under the gecko id `linklog@luther.io`.
2. Generate AMO API credentials at [addons.mozilla.org/developers/addon/api/key/](https://addons.mozilla.org/developers/addon/api/key/).
3. Build and sign:
   ```bash
   pnpm --filter linkblog-extension build:firefox
   pnpm --filter linkblog-extension exec web-ext sign \
     --source-dir dist/firefox \
     --artifacts-dir dist \
     --api-key <jwt-issuer> \
     --api-secret <jwt-secret>
   ```
4. The signed `.xpi` lands in `browser-extension/dist/`.

## Project Structure

```
browser-extension/
├── manifest.chrome.json           # Chrome MV3 manifest (service_worker)
├── manifest.firefox.json          # Firefox MV3 manifest (scripts + gecko id)
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
├── scripts/
│   └── bump-version.mjs           # Sync version across package.json + both manifests
├── dist/
│   ├── chrome/                    # Built Chrome extension (load-unpacked target)
│   ├── firefox/                   # Built Firefox extension (web-ext target)
│   ├── linklog-chrome-*.zip       # Packaged Chrome ZIP (from package:chrome)
│   └── linklog-firefox-*.xpi      # Packaged Firefox XPI (from package:firefox)
├── package.json
└── tsconfig.json
```

## API

The extension POSTs to your linkblog API endpoint (default: `https://api.linklog.app/links`).

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
