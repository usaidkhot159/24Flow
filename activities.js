'use strict';

function buildCategoryGrid() {
  const grid = document.getElementById('cat-grid');
  if (!grid) return;
  grid.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (cat.id === STATE.selectedCat ? ' selected' : '');
    btn.style.color = cat.color;
    btn.dataset.cat = cat.id;
    btn.innerHTML = `<span class="cat-emoji">${cat.emoji}</span>${cat.label}`;
    btn.addEventListener('click', () => selectCategory(cat.id));
    grid.appendChild(btn);
  });
}

function selectCategory(id) {
  STATE.selectedCat = id;
  document.querySelectorAll('.cat-btn').forEach(btn => {
    const active = btn.dataset.cat === id;
    btn.classList.toggle('selected', active);
    const cat = STATE.getCat(id);
    if (active) {
      btn.style.background = hexToRGBA(cat.color, 0.18);
      btn.style.borderColor = cat.color;
    } else {
      btn.style.background = '';
      btn.style.borderColor = '';
    }
  });
  const emoji = STATE.getCat(id).emoji;
  document.getElementById('form-emoji').textContent = emoji;
}

function buildTemplates() {
  const wrap = document.getElementById('templates-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  TEMPLATES.forEach((tpl, i) => {
    const btn = document.createElement('button');
    btn.className = 'tpl-btn';
    btn.innerHTML = `
      <span class="tpl-emoji">${tpl.emoji}</span>
      <span class="tpl-info">
        <span class="tpl-name">${tpl.name}</span>
        <span class="tpl-desc">${tpl.desc}</span>
      </span>`;
    btn.addEventListener('click', () => loadTemplate(i));
    wrap.appendChild(btn);
  });
}

function loadTemplate(idx) {
  const tpl = TEMPLATES[idx];
  if (!tpl) return;
  STATE.clearActivities();
  tpl.activities.forEach(a => {
    STATE.addActivity({
      name: a.name,
      hours: a.hours,
      mins: a.mins,
      totalMins: a.hours * 60 + a.mins,
      cat: a.cat,
      startTime: a.startTime || null,
      emoji: STATE.getCat(a.cat).emoji,
    });
  });
  renderAll();
  showToast(`📋 "${tpl.name}" loaded!`);
}

function addActivity() {
  const nameEl  = document.getElementById('inp-name');
  const hoursEl = document.getElementById('inp-hours');
  const minsEl  = document.getElementById('inp-mins');
  const timeEl  = document.getElementById('inp-time');

  const name = nameEl.value.trim();
  const h = parseInt(hoursEl.value) || 0;
  const m = parseInt(minsEl.value) || 0;
  const totalMins = h * 60 + m;

  if (!name) { showToast('⚠️ Enter an activity name.'); nameEl.focus(); return; }
  if (totalMins <= 0) { showToast('⚠️ Enter a duration greater than 0.'); return; }

  const cat = STATE.getCat(STATE.selectedCat);
  const userEmoji = getCatEmoji(name);

  STATE.addActivity({
    name,
    hours: h,
    mins: m,
    totalMins,
    cat: STATE.selectedCat,
    startTime: timeEl.value || null,
    emoji: userEmoji || cat.emoji,
  });

  nameEl.value = '';
  hoursEl.value = 1;
  minsEl.value = 0;
  document.getElementById('form-emoji').textContent = cat.emoji;

  renderAll();
  showToast(`✅ "${name}" added!`);
}

function removeActivity(id) {
  STATE.removeActivity(id);
  renderAll();
}

function clearAll() {
  if (STATE.activities.length === 0) return;
  STATE.clearActivities();
  renderAll();
  showToast('🗑️ All activities cleared.');
}

function renderActivitiesList() {
  const list = document.getElementById('activities-list');
  const empty = document.getElementById('empty-state');
  if (!list) return;

  const acts = STATE.activities;

  if (acts.length === 0) {
    list.innerHTML = '';
    if (empty) { empty.style.display = ''; list.appendChild(empty); }
    return;
  }
  if (empty) empty.style.display = 'none';

  const existing = new Set(Array.from(list.querySelectorAll('.activity-item')).map(el => Number(el.dataset.id)));
  const current = new Set(acts.map(a => a.id));

  existing.forEach(id => {
    if (!current.has(id)) {
      const el = list.querySelector(`[data-id="${id}"]`);
      if (el) el.remove();
    }
  });

  acts.forEach((act, idx) => {
    let el = list.querySelector(`[data-id="${act.id}"]`);
    if (!el) {
      el = buildActivityItem(act);
      list.appendChild(el);
    }
    list.appendChild(el);
  });
}

function buildActivityItem(act) {
  const cat = STATE.getCat(act.cat);
  const div = document.createElement('div');
  div.className = 'activity-item';
  div.dataset.id = act.id;
  div.innerHTML = `
    <span class="act-color-dot" style="background:${cat.color}"></span>
    <span class="act-emoji">${act.emoji}</span>
    <div class="act-info">
      <div class="act-name">${escapeHtml(act.name)}</div>
      <div class="act-meta">${cat.emoji} ${cat.label}${act.startTime ? ' · ' + act.startTime : ''}</div>
    </div>
    <span class="act-duration">${fmtMins(act.totalMins)}</span>
    <button class="act-del" aria-label="Remove">
      <svg viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
    </button>`;
  div.querySelector('.act-del').addEventListener('click', () => removeActivity(act.id));
  return div;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function updateWhatIfSelect() {
  const sel = document.getElementById('wi-select');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '<option value="">Select activity…</option>';
  STATE.activities.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = `${a.emoji} ${a.name} (${fmtMins(a.totalMins)})`;
    if (String(a.id) === prev) opt.selected = true;
    sel.appendChild(opt);
  });
}
