// QRadar - Hide N/A Event Properties
// Finds the table.details sibling that follows the #EventHeader div,
// and toggles visibility of tr.disabledRow rows inside it.

const HIDE_CLASS = 'qr-hide-na';
let hideEnabled = true; 

// --- Core logic -------------------------------------------------------

function findEventTable() {
  const header = document.getElementById('EventHeader');
  if (!header) return null;

  let el = header.nextElementSibling;
  while (el && !(el.tagName === 'TABLE' && el.classList.contains('details'))) {
    el = el.nextElementSibling;
  }
  return el;
}

function applyState() {
  const table = findEventTable();
  if (!table) return;

  const rows = table.querySelectorAll('tr.disabledRow');
  rows.forEach(row => {
    row.classList.toggle(HIDE_CLASS, hideEnabled);
  });
}

// --- Watch for QRadar re-rendering the event panel ---------------------
// QRadar loads event details dynamically (AJAX), so the table may be
// removed/recreated whenever the analyst clicks a different event.

const observer = new MutationObserver(() => {
  applyState();
});

function startObserving() {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  applyState(); // apply immediately in case the table is already present
}

// --- Load saved preference, then start ---------------------------------

chrome.storage.sync.get({ hideEnabled: true }, (data) => {
  hideEnabled = data.hideEnabled;
  startObserving();
});

// --- Respond to popup toggle messages -----------------------------------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_HIDE_ENABLED') {
    hideEnabled = message.value;
    applyState();
    sendResponse({ ok: true });
  } else if (message.type === 'GET_HIDE_ENABLED') {
    sendResponse({ value: hideEnabled });
  }
});
