'use strict';

function fmtMins(totalMins) {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function fmtMinsFull(totalMins) {
  const h = Math.floor(Math.abs(totalMins) / 60);
  const m = Math.abs(totalMins) % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h 0m`;
  return `${h}h ${m}m`;
}

function minsToPercent(mins, total = 1440) {
  return Math.min(100, (mins / total) * 100);
}

function parseTimeToMins(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minsToTimeStr(totalMins) {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function hexToRGBA(hex, alpha = 0.15) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function getCatEmoji(name) {
  const map = {
    sleep:'💤', rest:'💤', nap:'💤',
    college:'🎓', study:'📚', lecture:'🎓', class:'🎓', school:'🎓', learn:'📚',
    work:'💼', coding:'💻', code:'💻', dev:'💻', programming:'💻',
    gym:'🏋️', exercise:'🏃', run:'🏃', workout:'💪', yoga:'🧘', walk:'🚶',
    gaming:'🎮', game:'🎮', netflix:'🎬', watch:'🎬', movie:'🎬',
    lunch:'🍱', dinner:'🍽️', eat:'🍽️', breakfast:'🥐', food:'🍽️',
    travel:'🚆', commute:'🚌', drive:'🚗', bus:'🚌',
    social:'👥', meet:'👋', friend:'👥', chat:'💬',
    read:'📖', book:'📖',
    meditat:'🧘',
  };
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(map)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

let toastTimer = null;
function showToast(msg, duration = 2400) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}
