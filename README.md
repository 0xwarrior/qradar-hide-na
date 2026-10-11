# QRadar Declutter

![Manifest V3](https://img.shields.io/badge/manifest-v3-blue)
![License: MIT](https://img.shields.io/badge/license-MIT-green)
![No data collection](https://img.shields.io/badge/data%20collection-none-brightgreen)

A small Chromium browser extension that declutters IBM QRadar: it hides
disabled / N-A rows in the event "Event Properties" table, plus the Magnitude
column and infographics section on the Offenses tab, each with a one-click
toggle to bring it back.

**Event properties**

| Before | After |
|---|---|
| ![Before: every property shown, including N/A fields](screenshots/before.png) | ![After: N/A rows hidden](screenshots/after.png) |

**Offenses tab**

| Before | After |
|---|---|
| ![Before: Magnitude column and infographics shown](screenshots/offenses-before.png) | ![After: Magnitude column and infographics hidden](screenshots/offenses-after.png) |

## Features

- Hides `tr.disabledRow` rows in the QRadar event details table automatically.
- **Offenses tab:** hides the Magnitude column (header and cells) and the
  infographics section (`#infoGraphicsSection`).
- Popup toggles to show/hide each of the three on demand.
- Keyboard shortcut (`Alt+Shift+H` by default, remappable at
  `chrome://extensions/shortcuts`) to toggle N/A rows without opening the popup.
- Works against any QRadar console — you configure your console's
  hostname/IP once in the extension's options page.
- No remote code, no network requests, no data collection. Everything runs
  locally against the DOM of your QRadar tab.

## Installing

### Chrome Web Store

Straight from the [Chrome Web Store](https://chromewebstore.google.com/detail/qradar-declutter/nmnemlnfcheohfakpckkffgdfeklimpj) (as simple as that!!!).

### Unpacked / developer mode

1. Download or clone this repository.
2. Open `chrome://extensions` (or the equivalent in your Chromium browser).
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `qradar-hide-na` folder.

### Configure your QRadar host (both methods)

1. Click the extension icon, then **Configure QRadar host**, and enter your
   QRadar console's hostname or IP (e.g. `qradar.mycompany.com` or
   `172.16.100.2`). Grant the permission prompt.

   ![Options page: set your QRadar host and grant access](screenshots/setup.png)

2. Reload your QRadar tab. The N/A rows, Magnitude column and infographics
   section will be hidden automatically.

## Usage

- Click the extension icon and use the toggles: **Hide N/A event rows**,
  **Hide Magnitude column (Offenses)** and **Hide offense infographics section**.
- Or press **Alt+Shift+H** while on your QRadar tab to toggle N/A rows.
- Your preferences are saved and applied automatically as you navigate
  between events and offenses.

## How it works

The content script locates the event properties table (the `table.details`
element following `#EventHeader`), and toggles a CSS class on rows with the
`disabledRow` class to hide/show them. On the offense list it finds the
Magnitude header by its sort link (`o.magnitude_org`) and hides the cells at the
same column position, and toggles a class on `#infoGraphicsSection`
(`display: none`). A `MutationObserver` re-applies all of this whenever QRadar
re-renders the panel (it loads content via AJAX).

The extension only gains access to the host you explicitly configure in
its options page (via the Chrome `optional_host_permissions` /
`chrome.permissions` API) — it does not request broad access to all sites
up front. The service worker in `background.js` registers the content
script dynamically for that one host and handles the keyboard shortcut.

## Project structure

```
qradar-hide-na/
├── manifest.json      # MV3 manifest — permissions, commands, options page
├── background.js      # service worker: dynamic content script registration + shortcut
├── content.js         # hides N/A rows, the Magnitude column and the infographics section
├── content.css        # the hidden-element classes
├── options.html/.js   # configure your QRadar host, request permission
├── popup.html/.js     # toggles + link to options
└── icons/
```

## Privacy & permissions

This extension collects nothing and phones home to nowhere. It only reads
and modifies the DOM of the single QRadar host you configure. See the
[security notes](#how-it-works) above for how host access is scoped, and
[PRIVACY.md](PRIVACY.md) for the full policy.

## Contributing

Issues and pull requests are welcome. Please keep changes scoped and avoid
adding new permissions or network calls without discussion.

## License

MIT — see [LICENSE](LICENSE).
