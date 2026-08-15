'use strict';

const CLOCK_CIRCUMFERENCE = 2 * Math.PI * 104; // r=104 → ~653.45

function initClockTicks() {
  const g = document.getElementById('clock-ticks');
  if (!g) return;
  for (let h = 0; h < 24; h++) {
    const angle = (h / 24) * 2 * Math.PI - Math.PI / 2;
    const isMain = h % 6 === 0;
    const r1 = isMain ? 84 : 88;
    const r2 = 96;
    const x1 = 120 + r1 * Math.cos(angle);
    const y1 = 120 + r1 * Math.sin(angle);
    const x2 = 120 + r2 * Math.cos(angle);
    const y2 = 120 + r2 * Math.sin(angle);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1.toFixed(2));
    line.setAttribute('y1', y1.toFixed(2));
    line.setAttribute('x2', x2.toFixed(2));
    line.setAttribute('y2', y2.toFixed(2));
    line.setAttribute('stroke', isMain ? 'rgba(196,181,253,0.35)' : 'rgba(255,255,255,0.08)');
    line.setAttribute('stroke-width', isMain ? '2' : '1');
    line.setAttribute('stroke-linecap', 'round');
    g.appendChild(line);
  }
}

function updateClock(usedMins) {
  const arc = document.getElementById('clock-arc');
  if (!arc) return;
  const frac = Math.min(usedMins / 1440, 1);
  const offset = CLOCK_CIRCUMFERENCE * (1 - frac);
  arc.style.strokeDashoffset = offset.toFixed(2);

  const remaining = Math.max(0, 1440 - usedMins);
  document.getElementById('hero-used').textContent = fmtMinsFull(usedMins);
  document.getElementById('hero-remaining').textContent = fmtMinsFull(remaining);
}
