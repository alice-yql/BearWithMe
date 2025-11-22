const words = [
  { text: 'Hello', breakdown: 'Hel - lo' },
  { text: 'Teddy', breakdown: 'Ted - dy' },
  { text: 'Apple', breakdown: 'Ap - ple' },
  { text: 'Ball', breakdown: 'Ball' }
];
// insert aszure API call here


let idx = 0;
let durations = new Array(words.length).fill(0); // milliseconds per word

const wordEl = document.getElementById('word');
const breakdownEl = document.getElementById('breakdown');
const timerEl = document.getElementById('timer');
const totalEl = document.getElementById('totalTime');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');

let timerInterval = null;
let startTs = null;

function formatMs(ms) {
  const s = ms / 1000;
  if (s < 60) return s.toFixed(1) + 's';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function totalMs() {
  const base = durations.reduce((a, b) => a + b, 0);
  if (startTs != null) return base + (Date.now() - startTs);
  return base;
}

function startTimer() {
  startTs = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const elapsed = durations[idx] + (Date.now() - startTs);
    timerEl.textContent = `Time: ${formatMs(elapsed)}`;
    if (totalEl) totalEl.textContent = `Total: ${formatMs(totalMs())}`;
  }, 120);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (startTs != null) {
    const delta = Date.now() - startTs;
    durations[idx] += delta;
    startTs = null;
  }
  timerEl.textContent = `Time: ${formatMs(durations[idx])}`;
  if (totalEl) totalEl.textContent = `Total: ${formatMs(totalMs())}`;
}

function render() {
  const w = words[idx];
  wordEl.textContent = w.text;
  breakdownEl.textContent = w.breakdown || '';
  timerEl.textContent = `Time: ${formatMs(durations[idx])}`;
  if (totalEl) totalEl.textContent = `Total: ${formatMs(totalMs())}`;
  startTimer();
}

prevBtn.addEventListener('click', () => {
  stopTimer();
  idx = (idx - 1 + words.length) % words.length;
  render();
});

nextBtn.addEventListener('click', () => {
  stopTimer();
  idx = (idx + 1) % words.length;
  render();
});

// try to load saved durations
try {
  const saved = JSON.parse(localStorage.getItem('wordDurations') || 'null');
  if (Array.isArray(saved) && saved.length === words.length) {
    durations = saved.map((n) => Number(n) || 0);
  }
} catch (e) {
  // ignore
}

// save durations on unload
window.addEventListener('beforeunload', () => {
  stopTimer();
  try {
    localStorage.setItem('wordDurations', JSON.stringify(durations));
  } catch (e) {}
});

// initial render
render();

// Stop/Resume toggle
if (stopBtn) {
  stopBtn.addEventListener('click', () => {
    // If timer is running, stop it and change to "Resume"
    if (startTs != null) {
      stopTimer();
      stopBtn.textContent = 'Resume';
      stopBtn.classList.add('secondary');
    } else {
      // Resume
      startTimer();
      stopBtn.textContent = 'Pause';
      stopBtn.classList.remove('secondary');
    }
  });
}

// Reset all durations
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    const ok = window.confirm('Clear all recorded times? This cannot be undone.');
    if (!ok) return;
    const wasRunning = startTs != null;
    stopTimer();
    durations = new Array(words.length).fill(0);
    try {
      localStorage.setItem('wordDurations', JSON.stringify(durations));
    } catch (e) {}
    // update UI
    timerEl.textContent = `Time: ${formatMs(durations[idx])}`;
    if (totalEl) totalEl.textContent = `Total: ${formatMs(totalMs())}`;
    // if previously running, restart fresh
    if (wasRunning) startTimer();
  });
}
