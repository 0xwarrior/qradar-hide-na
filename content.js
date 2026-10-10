// QRadar Declutter
//
// 1. Event details: finds the table.details sibling that follows the
//    #EventHeader div, and toggles visibility of tr.disabledRow rows in it.
// 2. Offenses list: hides the Magnitude column (header + the cells in the
//    same column position) and the #infoGraphicsSection panel.

const HIDE_CLASS = 'qr-hide-na';
const HIDE_COL_CLASS = 'qr-hide-col';
const HIDE_CHART_CLASS = 'qr-hide-chart';

const options = {
  hideEnabled: true,   // N/A rows in event details
  hideMagnitude: true, // Magnitude column in the offense list
  hideChart: true      // #infoGraphicsSection in the offense list
};

// --- N/A rows ---------------------------------------------------------

function findEventTable() {
  const header = document.getElementById('EventHeader');
  if (!header) return null;

  let el = header.nextElementSibling;
  while (el && !(el.tagName === 'TABLE' && el.classList.contains('details'))) {
    el = el.nextElementSibling;
  }
  return el;
}

function applyNaRows() {
  const table = findEventTable();
  if (!table) return;

  table.querySelectorAll('tr.disabledRow').forEach(row => {
    row.classList.toggle(HIDE_CLASS, options.hideEnabled);
  });
}

// --- Magnitude column -------------------------------------------------

// Column position of a header cell, accounting for colspan on its siblings.
function columnIndexOf(cell) {
  let idx = 0;
  for (let c = cell.previousElementSibling; c; c = c.previousElementSibling) {
    idx += c.colSpan || 1;
  }
  return idx;
}

// The single-column cell of `row` at column position `col`, or null if the
// row has none there (e.g. a full-width group row spanning several columns).
function cellAtColumn(row, col) {
  let pos = 0;
  for (const cell of row.cells) {
    const span = cell.colSpan || 1;
    if (col >= pos && col < pos + span) return span === 1 ? cell : null;
    pos += span;
  }
  return null;
}

function applyMagnitudeColumn() {
  document.querySelectorAll('.' + HIDE_COL_CLASS).forEach(el => {
    el.classList.remove(HIDE_COL_CLASS);
  });
  if (!options.hideMagnitude) return;

  // The header's sort link is the stable hook: its href sorts on o.magnitude_org.
  document.querySelectorAll('a[href*="o.magnitude_org"]').forEach(link => {
    const th = link.closest('th, td');
    const table = th && th.closest('table');
    if (!table) return;

    const col = columnIndexOf(th);
    for (const row of table.rows) {
      const cell = cellAtColumn(row, col);
      if (cell) cell.classList.add(HIDE_COL_CLASS);
    }
  });
}

// --- Offense chart section --------------------------------------------

function applyChartSection() {
  const section = document.getElementById('infoGraphicsSection');
  if (section) section.classList.toggle(HIDE_CHART_CLASS, options.hideChart);
}

function applyState() {
  applyNaRows();
  applyMagnitudeColumn();
  applyChartSection();
}

// --- Watch for QRadar re-rendering the panels --------------------------
// QRadar loads event/offense content dynamically (AJAX), so tables are
// removed/recreated on sort, refresh and when the analyst clicks around.
// Only class attributes change here, so this observer doesn't re-trigger.

const observer = new MutationObserver(() => {
  applyState();
});

function startObserving() {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  applyState(); // apply immediately in case the content is already present
}

// --- Load saved preferences, then start --------------------------------

chrome.storage.sync.get(options, (data) => {
  Object.assign(options, data);
  startObserving();
});

// Keep every open QRadar tab/frame in sync when a setting changes.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  let changed = false;
  for (const key of Object.keys(options)) {
    if (changes[key]) {
      options[key] = changes[key].newValue;
      changed = true;
    }
  }
  if (changed) applyState();
});

// --- Respond to popup / shortcut messages --------------------------------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_HIDE_ENABLED') {
    options.hideEnabled = message.value;
    applyState();
    sendResponse({ ok: true });
  } else if (message.type === 'SET_OPTION' && message.key in options) {
    options[message.key] = message.value;
    applyState();
    sendResponse({ ok: true });
  } else if (message.type === 'GET_HIDE_ENABLED') {
    sendResponse({ value: options.hideEnabled });
  }
});
