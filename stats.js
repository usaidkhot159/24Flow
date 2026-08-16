'use strict';

function calcProductivityScore(acts) {
  if (!acts.length) return 0;
  const total = acts.reduce((s, a) => s + a.totalMins, 0);
  const prodMins = acts
    .filter(a => STATE.getCat(a.cat).productive)
    .reduce((s, a) => s + a.totalMins, 0);
  return Math.round((prodMins / Math.max(total, 1)) * 100);
}

function getTopCategory(acts) {
  if (!acts.length) return null;
  const map = {};
  acts.forEach(a => { map[a.cat] = (map[a.cat] || 0) + a.totalMins; });
  const topId = Object.entries(map).sort((a, b) => b[1] - a[1])[0][0];
  return STATE.getCat(topId);
}

function detectTimeLeak(acts) {
  if (acts.length < 2) return null;
  const catMap = {};
  acts.forEach(a => { catMap[a.cat] = (catMap[a.cat] || 0) + a.totalMins; });
  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const [topCat, topMins] = sorted[0];
  const total = acts.reduce((s, a) => s + a.totalMins, 0);
  const pct = Math.round((topMins / total) * 100);
  const cat = STATE.getCat(topCat);

  if (!cat.productive && pct >= 20) {
    const recoverable = Math.round(topMins * 0.35 / 60) * 60;
    return {
      msg: `${cat.emoji} <strong>${cat.label}</strong> is taking up <strong>${pct}% of your day</strong> (${fmtMins(topMins)}). Cutting a third could free up ${fmtMins(recoverable)} for productive work.`,
    };
  }

  if (sorted.length > 1) {
    const [, topM] = sorted[0];
    const [, secM] = sorted[1];
    const topCatObj = STATE.getCat(sorted[0][0]);
    const secCatObj = STATE.getCat(sorted[1][0]);
    if (!topCatObj.productive && topMins > acts.filter(a => STATE.getCat(a.cat).productive).reduce((s,a)=>s+a.totalMins,0)) {
      return {
        msg: `You spend more time on <strong>${topCatObj.label}</strong> than on all productive activities combined.`,
      };
    }
    const travelMins = catMap['travel'] || 0;
    const healthMins = catMap['health'] || 0;
    if (travelMins > 0 && healthMins > 0 && travelMins > healthMins) {
      return {
        msg: `You spend more time <strong>traveling (${fmtMins(travelMins)})</strong> than on <strong>health (${fmtMins(healthMins)})</strong>. Could you combine a commute with a walk?`,
      };
    }
  }
  return null;
}

function renderStats() {
  const acts = STATE.activities;
  const used = STATE.totalMinutes();
  const remaining = 1440 - used;
  const count = acts.length;
  const score = count ? calcProductivityScore(acts) : 0;
  const topCat = count ? getTopCategory(acts) : null;
  const pct = count ? Math.round((used / 1440) * 100) : 0;

  updateClock(used);

  const el = id => document.getElementById(id);

  el('stat-count').textContent = count;
  el('stat-score').textContent = count ? score + '%' : '—';
  el('stat-top').textContent   = topCat ? topCat.emoji : '—';
  el('stat-pct').textContent   = count ? pct + '%' : '0%';

  const prodBar = el('prod-bar');
  const prodPct = el('prod-pct');
  const prodMsg = el('prod-msg');
  if (prodBar) prodBar.style.width = score + '%';
  if (prodPct) prodPct.textContent = count ? score + '%' : '—';
  if (prodMsg) {
    if (!count) { prodMsg.textContent = ''; }
    else if (score >= 80) { prodMsg.textContent = 'Outstanding day! 🔥'; }
    else if (score >= 60) { prodMsg.textContent = 'Good progress. Keep it up 💪'; }
    else if (score >= 40) { prodMsg.textContent = 'Decent balance. Room to improve.'; }
    else { prodMsg.textContent = 'Try adding more productive activities.'; }
  }

  const overBanner = el('over-banner');
  const overMsg    = el('over-msg');
  if (overBanner) {
    if (used > 1440) {
      const excess = used - 1440;
      overBanner.style.display = '';
      if (overMsg) overMsg.textContent = `You've planned ${fmtMins(used)} — that's ${fmtMins(excess)} over budget.`;
    } else {
      overBanner.style.display = 'none';
    }
  }

  renderBreakdown(acts, used);
  renderTimeLeak(acts);
}

function renderBreakdown(acts, used) {
  const box  = document.getElementById('breakdown-box');
  const bars = document.getElementById('breakdown-bars');
  if (!box || !bars) return;

  if (!acts.length) { box.style.display = 'none'; return; }
  box.style.display = '';
  bars.innerHTML = '';

  const catMap = {};
  acts.forEach(a => { catMap[a.cat] = (catMap[a.cat] || 0) + a.totalMins; });

  Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .forEach(([catId, mins]) => {
      const cat = STATE.getCat(catId);
      const pct = Math.round((mins / Math.max(used, 1)) * 100);
      const row = document.createElement('div');
      row.className = 'breakdown-row';
      row.innerHTML = `
        <span class="bd-label">${cat.emoji} ${cat.label}</span>
        <div class="bd-track"><div class="bd-fill" style="width:0%;background:${cat.color}"></div></div>
        <span class="bd-pct">${pct}%</span>`;
      bars.appendChild(row);
      requestAnimationFrame(() => {
        row.querySelector('.bd-fill').style.width = pct + '%';
      });
    });
}

function renderTimeLeak(acts) {
  const box = document.getElementById('leak-box');
  const msg = document.getElementById('leak-msg');
  if (!box || !msg) return;

  if (acts.length < 2) { box.style.display = 'none'; return; }

  const leak = detectTimeLeak(acts);
  if (leak) {
    box.style.display = '';
    msg.innerHTML = leak.msg;
  } else {
    box.style.display = 'none';
  }
}
