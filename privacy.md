# Privacy Policy

**Extension:** QRadar - Hide N/A Event Properties
**Last updated:** 2026-08-23

## Summary

This extension does not collect, transmit, sell, or share any user data.
It has no analytics, no telemetry, and makes no network requests. Everything
it does happens locally, inside your own browser.

## What the extension accesses

The extension only runs on the single QRadar host you explicitly configure
in its options page. It is granted access to that host via Chrome's runtime
permission prompt (`chrome.permissions.request`) — it does not request
access to any site automatically or by default.

On that host, the extension's content script reads and modifies the DOM of
the QRadar event properties table, solely to hide or show table rows whose
value is N/A. It does not read, copy, or transmit the contents of that table
or any other page data anywhere.

## What the extension stores

Two small values are saved via `chrome.storage.sync` (Chrome's built-in
settings sync, tied to your own Google/Chrome profile — not a service
operated by us):

- **`hideEnabled`** — a boolean, whether N/A rows are currently hidden.
- **`qradarHost`** — the hostname/IP pattern of the QRadar console you
  configured.

This data stays within Chrome's own sync storage for your profile. It is
never sent to the developer, to any analytics or advertising service, or to
any third party.

## What the extension does NOT do

- No collection of browsing history, page content, credentials, or personal
  data.
- No analytics or crash-reporting SDKs.
- No remote or dynamically loaded code — everything shipped in the package
  is everything that runs.
- No advertising, no sale of data, no sharing with third parties.

## Permissions used

| Permission | Why |
|---|---|
| `storage` | Save your toggle preference and configured QRadar host locally. |
| `scripting` | Inject the content script only into the host you configured. |
| `optional_host_permissions` (requested per-host) | Read/modify the DOM of the QRadar console you specify, to hide/show N/A rows. Requested only for that host, only after you grant it. |

## Changes to this policy

If this policy changes, the updated version will be posted in this
repository with a new "Last updated" date.

## Contact

Questions or concerns: please open an issue in this repository's Issues tab.
<!-- TODO: once pushed, replace the line above with a direct link, e.g.
     [open an issue](https://github.com/<your-username>/qradar-hide-na/issues) -->

