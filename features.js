'use strict';

/* ══════════════════════════
   WHAT IF
═══════════════════════════ */
function initWhatIf() {
  const btn = document.getElementById('wi-btn');
  if (btn) btn.addEventListener('click', runWhatIf);
}

function runWhatIf() {
  const sel    = document.getElementById('wi-select');
  const extra  = parseFloat(document.getElementById('wi-hours').value) || 0;
  const result = document.getElementById('wi-result');
  if (!result) return;

  if (!sel.value) { showToast('Select an activity first.'); return; }
  if (extra <= 0) { showToast('Enter extra hours greater than 0.'); return; }

  const act = STATE.activities.find(a => String(a.id) === sel.value);
  if (!act) return;

  const extraMins   = Math.round(extra * 60);
  const currentFree = Math.max(0, 1440 - STATE.totalMinutes());
  const newFree     = currentFree - extraMins;
  const newTotal    = STATE.totalMinutes() + extraMins;

  result.style.display = '';
  result.innerHTML = '';

  const lines = [
    { cls: '', html: `Current free time: <strong>${fmtMins(currentFree)}</strong>` },
    { cls: '', html: `Adding <strong>${fmtMins(extraMins)}</strong> to <strong>${act.emoji} ${escapeHtml(act.name)}</strong>` },
  ];

  if (newTotal > 1440) {
    const over = newTotal - 1440;
    lines.push({ cls: 'warn', html: `⚠️ You'd be <strong>${fmtMins(over)} over budget</strong>!` });
  } else {
    lines.push({ cls: newFree < 60 ? 'warn' : 'good',
      html: `New free time: <strong>${fmtMins(Math.max(0, newFree))}</strong>` });
    lines.push({ cls: '', html: `Total planned: <strong>${fmtMins(newTotal)}</strong> / 24h` });
  }

  lines.forEach(({ cls, html }) => {
    const p = document.createElement('p');
    p.className = 'wi-line' + (cls ? ' ' + cls : '');
    p.innerHTML = html;
    result.appendChild(p);
  });
}


/* ══════════════════════════
   COMPARE VIEW
═══════════════════════════ */
const compareData = { ideal: [], actual: [] };

function initCompare() {
  const btn = document.getElementById('compare-btn');
  if (btn) btn.addEventListener('click', runCompare);

  document.querySelectorAll('.add-compare-btn').forEach(btn => {
    btn.addEventListener('click', () => addCompareItem(btn.dataset.side));
  });

  (['ideal','actual']).forEach(side => addCompareItem(side));
}

function addCompareItem(side) {
  const list = document.getElementById(side + '-list');
  if (!list) return;

  const id = Date.now() + Math.random();
  const row = document.createElement('div');
  row.className = 'compare-item';
  row.dataset.id = id;
  row.innerHTML = `
    <input type="text" placeholder="Activity name" class="act-name-inp" />
    <input type="number" class="hrs-inp" placeholder="h" min="0.5" max="24" step="0.5" value="1" />
    <button class="del-compare" aria-label="Remove">
      <svg viewBox="0 0 12 12" fill="none" width="12" height="12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
    </button>`;
  row.querySelector('.del-compare').addEventListener('click', () => row.remove());
  list.appendChild(row);
}

function runCompare() {
  const result = document.getElementById('compare-result');
  if (!result) return;

  const getItems = side => {
    const rows = document.querySelectorAll(`#${side}-list .compare-item`);
    return Array.from(rows).map(row => ({
      name: row.querySelector('.act-name-inp').value.trim(),
      hours: parseFloat(row.querySelector('.hrs-inp').value) || 0,
    })).filter(i => i.name && i.hours > 0);
  };

  const ideal  = getItems('ideal');
  const actual = getItems('actual');

  if (!ideal.length || !actual.length) {
    showToast('Add activities to both sides first.');
    return;
  }

  result.innerHTML = '';

  const idealMap  = Object.fromEntries(ideal.map(i => [i.name.toLowerCase(), i.hours]));
  const actualMap = Object.fromEntries(actual.map(i => [i.name.toLowerCase(), i.hours]));

  const allNames = new Set([...Object.keys(idealMap), ...Object.keys(actualMap)]);

  let html = '';
  allNames.forEach(name => {
    const ih = idealMap[name] || 0;
    const ah = actualMap[name] || 0;
    const diff = ah - ih;
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    if (diff > 0.25) {
      const row = document.createElement('div');
      row.className = 'cr-row over';
      row.innerHTML = `<span class="cr-icon">⬆️</span> <span>You spent <strong>${diff.toFixed(1)}h more</strong> on <strong>${displayName}</strong> than planned (${ih}h planned → ${ah}h actual).</span>`;
      result.appendChild(row);
    } else if (diff < -0.25) {
      const row = document.createElement('div');
      row.className = 'cr-row under';
      row.innerHTML = `<span class="cr-icon">⬇️</span> <span>You spent <strong>${Math.abs(diff).toFixed(1)}h less</strong> on <strong>${displayName}</strong> than planned (${ih}h planned → ${ah}h actual).</span>`;
      result.appendChild(row);
    } else if (ih && ah) {
      const row = document.createElement('div');
      row.className = 'cr-row match';
      row.innerHTML = `<span class="cr-icon">✅</span> <span><strong>${displayName}</strong> matched your plan (${ih}h).</span>`;
      result.appendChild(row);
    } else if (!ih) {
      const row = document.createElement('div');
      row.className = 'cr-row';
      row.innerHTML = `<span class="cr-icon">➕</span> <span><strong>${displayName}</strong> was unplanned but took ${ah}h.</span>`;
      result.appendChild(row);
    } else {
      const row = document.createElement('div');
      row.className = 'cr-row';
      row.innerHTML = `<span class="cr-icon">❌</span> <span>You skipped <strong>${displayName}</strong> (had planned ${ih}h).</span>`;
      result.appendChild(row);
    }
  });

  if (!result.children.length) {
    result.innerHTML = '<p style="color:var(--text-muted);font-size:.88rem">No differences detected — your day matched the plan!</p>';
  }
}


/* ══════════════════════════
   WEEKLY VIEW
═══════════════════════════ */
function saveDay() {
  if (!STATE.activities.length) { showToast('Nothing to save — add some activities first.'); return; }

  const stored = getWeeklyData();
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
  const key = new Date().toISOString().split('T')[0];

  stored[key] = {
    label: today,
    activities: STATE.activities.map(a => ({ name: a.name, totalMins: a.totalMins, cat: a.cat, emoji: a.emoji })),
  };

  localStorage.setItem('24flow-weekly', JSON.stringify(stored));
  showToast('💾 Day saved to weekly record!');
  renderWeekly();
}

function getWeeklyData() {
  try { return JSON.parse(localStorage.getItem('24flow-weekly') || '{}'); } catch { return {}; }
}

function renderWeekly() {
  const content = document.getElementById('weekly-content');
  if (!content) return;

  const data = getWeeklyData();
  const keys = Object.keys(data).sort().reverse();

  if (!keys.length) {
    content.innerHTML = '<div class="weekly-empty">No days saved yet.<br>Save a day from the Planner to start tracking your week.</div>';
    return;
  }

  let totalMap = {};
  content.innerHTML = '';

  keys.forEach(key => {
    const day = data[key];
    const totalMins = day.activities.reduce((s, a) => s + a.totalMins, 0);

    const dayEl = document.createElement('div');
    dayEl.className = 'weekly-day';

    const catMap = {};
    day.activities.forEach(a => {
      catMap[a.cat] = (catMap[a.cat] || 0) + a.totalMins;
      totalMap[a.cat] = (totalMap[a.cat] || 0) + a.totalMins;
    });

    let barsHtml = '';
    Object.entries(catMap).sort((a,b) => b[1]-a[1]).forEach(([catId, mins]) => {
      const cat = STATE.getCat(catId);
      const pct = Math.round((mins / Math.max(totalMins, 1)) * 100);
      barsHtml += `
        <div class="weekly-bar-row">
          <span class="weekly-bar-label">${cat.emoji} ${cat.label}</span>
          <div class="weekly-bar-track"><div class="weekly-bar-fill" style="width:${pct}%;background:${cat.color}"></div></div>
          <span class="weekly-bar-dur">${fmtMins(mins)}</span>
        </div>`;
    });

    dayEl.innerHTML = `
      <div class="weekly-day-header">
        <span class="weekly-day-title">${day.label}</span>
        <span class="weekly-day-meta">${fmtMins(totalMins)} planned · ${day.activities.length} activities</span>
      </div>
      <div class="weekly-bars">${barsHtml}</div>`;

    content.appendChild(dayEl);
  });

  if (Object.keys(totalMap).length) {
    const totEl = document.createElement('div');
    totEl.className = 'weekly-totals';
    let totalHtml = '<h3>Week Totals</h3>';
    Object.entries(totalMap).sort((a,b)=>b[1]-a[1]).forEach(([catId, mins]) => {
      const cat = STATE.getCat(catId);
      totalHtml += `
        <div class="weekly-bar-row">
          <span class="weekly-bar-label">${cat.emoji} ${cat.label}</span>
          <div class="weekly-bar-track"><div class="weekly-bar-fill" style="width:${Math.min(100,Math.round(mins/60)*4)}%;background:${cat.color}"></div></div>
          <span class="weekly-bar-dur">${fmtMins(mins)}</span>
        </div>`;
    });
    totEl.innerHTML = totalHtml;
    content.appendChild(totEl);
  }
}
