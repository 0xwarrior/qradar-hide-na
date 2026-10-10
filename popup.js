const status = document.getElementById('status');

// checkbox id -> chrome.storage.sync key (all default to hidden)
const OPTIONS = {
  toggle: 'hideEnabled',
  toggleMagnitude: 'hideMagnitude',
  toggleChart: 'hideChart'
};

const defaults = {};
Object.values(OPTIONS).forEach((key) => { defaults[key] = true; });

chrome.storage.sync.get(defaults, (data) => {
  for (const [id, key] of Object.entries(OPTIONS)) {
    document.getElementById(id).checked = data[key];
  }
});

document.getElementById('openOptions').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

for (const [id, key] of Object.entries(OPTIONS)) {
  document.getElementById(id).addEventListener('change', (e) => {
    const value = e.target.checked;

    // Content scripts in every open QRadar tab pick this up via storage.onChanged.
    chrome.storage.sync.set({ [key]: value });

    // Message the active tab only to report whether the extension is running there.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_OPTION', key, value }, () => {
        if (chrome.runtime.lastError) {
          status.textContent = 'No QRadar page detected on this tab.';
        } else {
          status.textContent = 'Applies to your QRadar tabs.';
        }
      });
    });
  });
}
