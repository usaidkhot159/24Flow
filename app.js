'use strict';

/* ── renderAll: single source of truth for re-render ── */
function renderAll() {
  renderActivitiesList();
  updateWhatIfSelect();
  renderTimeline();
  renderStats();
}

/* ── View switching ── */
function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + name);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === name);
  });

  if (name === 'weekly') renderWeekly();
}

/* ── Keyboard shortcut: Enter in name field adds activity ── */
function initKeyboardShortcuts() {
  const nameInput = document.getElementById('inp-name');
  if (nameInput) {
    nameInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') addActivity();
    });
  }
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  initClockTicks();
  buildCategoryGrid();
  buildTemplates();
  selectCategory('other');
  initWhatIf();
  initCompare();
  initKeyboardShortcuts();

  document.getElementById('add-btn')?.addEventListener('click', addActivity);
  document.getElementById('clear-btn')?.addEventListener('click', clearAll);
  document.getElementById('save-btn')?.addEventListener('click', saveDay);

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  renderAll();
  updateClock(0);
});
