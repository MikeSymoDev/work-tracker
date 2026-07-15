const WORK_MINUTES = 8.4 * 60; // 504 Minuten = 8h 24min
const timeInput = document.getElementById('startTime');
const pauseInput = document.getElementById('pauseInput');
const btn = document.getElementById('calcBtn');
const resultDiv = document.getElementById('result');
const fill = document.getElementById('fill');
const marker = document.getElementById('marker');
const endTimeVal = document.getElementById('endTimeVal');
const remainingVal = document.getElementById('remainingVal');

let startDate = null;
let endDate = null;
let totalSpanMs = null; // Arbeitszeit + Pause, für die Fortschrittsanzeige
let tickHandle = null;

// Startwert: aktuelle Uhrzeit als Komfort-Vorschlag
(function prefillNow(){
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  timeInput.value = `${hh}:${mm}`;
})();

function parseTimeToDate(timeStr){
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatTime(d){
  return d.toLocaleTimeString('de-CH', { hour:'2-digit', minute:'2-digit' });
}

function formatDuration(ms){
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
}

function update(){
  const now = new Date();
  const elapsed = now - startDate;
  const diffToEnd = endDate - now;
  const pct = Math.min(100, Math.max(0, (elapsed / totalSpanMs) * 100));

  fill.style.width = pct + '%';
  marker.style.left = pct + '%';

  if (diffToEnd > 0){
    remainingVal.textContent = 'Noch zu arbeiten: ' + formatDuration(diffToEnd);
    remainingVal.classList.remove('done');
  } else {
    remainingVal.textContent = 'Feierabend! 🎉 (seit ' + formatDuration(-diffToEnd) + ')';
    remainingVal.classList.add('done');
  }
}

function calculate(){
  if (!timeInput.value){
    timeInput.focus();
    return;
  }
  const pauseMinutes = Math.max(0, parseInt(pauseInput.value, 10) || 0);
  const pauseMs = pauseMinutes * 60000;

  startDate = parseTimeToDate(timeInput.value);
  totalSpanMs = (WORK_MINUTES * 60000) + pauseMs;
  endDate = new Date(startDate.getTime() + totalSpanMs);

  endTimeVal.textContent = formatTime(endDate);
  resultDiv.hidden = false;
  update();

  if (tickHandle) clearInterval(tickHandle);
  tickHandle = setInterval(update, 1000);

  btn.classList.add('stamp');
  setTimeout(() => btn.classList.remove('stamp'), 150);
}

btn.addEventListener('click', calculate);
timeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') calculate();
});
pauseInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') calculate();
});
