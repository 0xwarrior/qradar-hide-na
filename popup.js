const checkbox = document.getElementById('toggle');
const status = document.getElementById('status');

chrome.storage.sync.get({ hideEnabled: true }, (data) => {
  checkbox.checked = data.hideEnabled;
});

document.getElementById('openOptions').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

checkbox.addEventListener('change', () => {
  const value = checkbox.checked;

  chrome.storage.sync.set({ hideEnabled: value });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_HIDE_ENABLED', value }, () => {
      if (chrome.runtime.lastError) {
        status.textContent = 'No QRadar event panel detected on this tab.';
      } else {
        status.textContent = 'Applies to the current QRadar tab.';
      }
    });
  });
});
