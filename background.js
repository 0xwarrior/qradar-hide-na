// QRadar - Hide N/A Event Properties (service worker)
//
// Content script access is granted dynamically per the host the user
// configures in the options page (chrome.permissions), rather than a
// fixed host baked into the manifest. This keeps the install-time
// permission prompt minimal and lets the same extension work against
// any QRadar console.

const SCRIPT_ID = 'qradar-hide-na-main';

async function registerForHost(hostPattern) {
  if (!hostPattern) return;
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] }).catch(() => {});
    await chrome.scripting.registerContentScripts([
      {
        id: SCRIPT_ID,
        matches: [hostPattern],
        js: ['content.js'],
        css: ['content.css'],
        runAt: 'document_idle',
        allFrames: true
      }
    ]);
  } catch (e) {
    console.error('QRadar Hide N/A: failed to register content script', e);
  }
}

async function syncRegistration() {
  const { qradarHost } = await chrome.storage.sync.get({ qradarHost: '' });
  if (qradarHost) await registerForHost(qradarHost);
}

chrome.runtime.onInstalled.addListener(async (details) => {
  const { qradarHost } = await chrome.storage.sync.get({ qradarHost: '' });
  if (qradarHost) {
    registerForHost(qradarHost);
  } else if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

chrome.runtime.onStartup.addListener(syncRegistration);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.qradarHost) {
    registerForHost(changes.qradarHost.newValue);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-na-rows') return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || tab.id === undefined) return;

  const { hideEnabled } = await chrome.storage.sync.get({ hideEnabled: true });
  const newValue = !hideEnabled;
  await chrome.storage.sync.set({ hideEnabled: newValue });

  chrome.tabs.sendMessage(tab.id, { type: 'SET_HIDE_ENABLED', value: newValue }, () => {
    void chrome.runtime.lastError; // no content script on this tab; ignore
  });
});
