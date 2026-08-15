<p align="center">
  <img src="icons/icon-128.png" width="96" height="96" alt="Group Tabs on Demand icon">
</p>

<h1 align="center">Group Tabs on Demand</h1>

<p align="center">
  One click to organize the current Chrome window by domain—never automatic.
</p>

## Why

Automatic tab groupers continuously rearrange tabs as you browse. Group Tabs on
Demand stays out of the way until you click its toolbar button or use its
keyboard shortcut. Each run also repairs mixed or stale groups, making domain
grouping the single source of truth.

## Features

- Groups unpinned HTTP and HTTPS tabs by registrable domain.
- Combines subdomains such as `mail.google.com` and `docs.google.com` under
  `GOOGLE`.
- Understands compound suffixes such as `.co.uk` and private suffixes such as
  `github.io`.
- Rebuilds existing groups so a group can never contain mixed domains.
- Removes stale singleton groups and groups only domains with at least two tabs.
- Uses short uppercase labels such as `GOOGLE`, `GITHUB`, and `BBC`.
- Runs only on click or keyboard shortcut; there are no tab-change listeners.
- Requires no host access, account, analytics, telemetry, or remote service.

## Install from source

Requirements: Node.js 20 or newer and a Chromium-based browser with tab groups.

```sh
git clone https://github.com/beejmaxx/group-tabs-on-demand.git
cd group-tabs-on-demand
npm ci
npm run build
```

Then open `chrome://extensions`, enable **Developer mode**, choose **Load
unpacked**, and select the repository directory. Pin **Group Tabs on Demand**
to the toolbar and click it whenever you want to regroup the current window.

The keyboard shortcut is `Command+Shift+K` on macOS or `Ctrl+Shift+K` on other
platforms. It can be changed at `chrome://extensions/shortcuts`.

## Behavior

On each run, the extension:

1. Reads the tabs in the current window.
2. Ungroups existing non-pinned tabs.
3. Computes the registrable domain of each web tab.
4. Creates an expanded group for every domain with two or more tabs.

Pinned tabs, browser-internal pages, invalid URLs, and domains with only one tab
remain ungrouped. Group colors are deterministic, so a domain receives the same
color on later runs.

## Permissions and privacy

The extension requests only `tabs` and `tabGroups`:

- `tabs` reads URLs and reorganizes tabs in the current window.
- `tabGroups` names and colors the groups it creates.

All processing happens locally in Chrome. No information is collected, stored,
or transmitted. See the full [privacy policy](PRIVACY.md).

## Development

```sh
npm test       # build and run unit tests
npm run package # test and create the Chrome Web Store ZIP in release/
```

Source files live in `src/`. The checked-in `service-worker.js` is the bundled
extension entry point produced by esbuild. Domain parsing is provided by
[`tldts`](https://github.com/remusao/tldts).

Contributions are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2026 Bijan
