'use strict';

function renderTimeline() {
  const track   = document.getElementById('tl-track');
  const empty   = document.getElementById('tl-empty');
  const sched   = document.getElementById('tl-schedule');
  const legend  = document.getElementById('tl-legend');
  if (!track) return;

  const acts = STATE.activities;

  if (acts.length === 0) {
    track.querySelectorAll('.tl-segment').forEach(e => e.remove());
    if (empty) empty.style.display = '';
    if (sched) sched.innerHTML = '';
    if (legend) legend.innerHTML = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  track.querySelectorAll('.tl-segment').forEach(e => e.remove());

  const timedActs = acts.filter(a => a.startTime).sort((a, b) => {
    return parseTimeToMins(a.startTime) - parseTimeToMins(b.startTime);
  });

  const untimedActs = acts.filter(a => !a.startTime);

  let untimedCursor = 0;
  const allPlaced = [];

  timedActs.forEach(act => {
    const startM = parseTimeToMins(act.startTime);
    allPlaced.push({ act, startM });
  });

  const timedEnds = timedActs.reduce((max, a) => {
    const end = parseTimeToMins(a.startTime) + a.totalMins;
    return Math.max(max, end);
  }, 0);
  untimedCursor = timedEnds;

  untimedActs.forEach(act => {
    allPlaced.push({ act, startM: untimedCursor });
    untimedCursor += act.totalMins;
  });

  allPlaced.sort((a, b) => a.startM - b.startM);

  allPlaced.forEach(({ act, startM }) => {
    const cat = STATE.getCat(act.cat);
    const leftPct  = (startM / 1440) * 100;
    const widthPct = (act.totalMins / 1440) * 100;

    const seg = document.createElement('div');
    seg.className = 'tl-segment';
    seg.style.left = leftPct.toFixed(3) + '%';
    seg.style.width = widthPct.toFixed(3) + '%';
    seg.style.background = `linear-gradient(135deg, ${cat.color}dd, ${cat.color}99)`;
    seg.title = `${act.emoji} ${act.name}: ${fmtMins(act.totalMins)}`;

    const label = document.createElement('span');
    label.className = 'tl-segment-label';
    label.textContent = widthPct > 5 ? `${act.emoji} ${act.name}` : act.emoji;
    seg.appendChild(label);
    track.appendChild(seg);
  });

  if (sched) {
    sched.innerHTML = '';
    allPlaced.forEach(({ act, startM }) => {
      const cat = STATE.getCat(act.cat);
      const endM = startM + act.totalMins;
      const row = document.createElement('div');
      row.className = 'tl-sched-item';
      row.style.borderLeftColor = cat.color;
      row.innerHTML = `
        <span class="tl-sched-time">${minsToTimeStr(startM % 1440)} → ${minsToTimeStr(endM % 1440)}</span>
        <span class="tl-sched-name">${act.emoji} ${escapeHtml(act.name)}</span>
        <span class="tl-sched-dur">${fmtMins(act.totalMins)}</span>`;
      sched.appendChild(row);
    });
  }

  if (legend) {
    const seen = new Set();
    legend.innerHTML = '';
    allPlaced.forEach(({ act }) => {
      if (seen.has(act.cat)) return;
      seen.add(act.cat);
      const cat = STATE.getCat(act.cat);
      const item = document.createElement('div');
      item.className = 'tl-legend-item';
      item.innerHTML = `<span class="tl-legend-dot" style="background:${cat.color}"></span>${cat.emoji} ${cat.label}`;
      legend.appendChild(item);
    });
  }
}
