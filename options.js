const input = document.getElementById('host');
const saveBtn = document.getElementById('save');
const status = document.getElementById('status');

function normalizePattern(rawValue) {
  let value = rawValue.trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) {
    value = 'https://' + value;
  }
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (!url.host) return null;
  return `${url.protocol}//${url.host}/*`;
}

function patternToDisplayHost(pattern) {
  try {
    return new URL(pattern.replace(/\*$/, '')).host;
  } catch {
    return pattern;
  }
}

chrome.storage.sync.get({ qradarHost: '' }, (data) => {
  if (data.qradarHost) {
    input.value = patternToDisplayHost(data.qradarHost);
  }
});

saveBtn.addEventListener('click', async () => {
  const pattern = normalizePattern(input.value);
  if (!pattern) {
    status.textContent = 'Enter a valid host, e.g. qradar.mycompany.com or 172.16.100.2';
    return;
  }

  status.textContent = 'Requesting permission...';
  let granted = false;
  try {
    granted = await chrome.permissions.request({ origins: [pattern] });
  } catch (e) {
    status.textContent = `Could not request permission: ${e.message}`;
    return;
  }

  if (!granted) {
    status.textContent = 'Permission denied — the extension needs access to this host to work.';
    return;
  }

  await chrome.storage.sync.set({ qradarHost: pattern });
  status.textContent = `Saved. Reload your QRadar tab at ${patternToDisplayHost(pattern)} to activate.`;
});
