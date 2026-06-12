// ===== Daily routine checklist =====
// Progress is stored per-day in localStorage, so it resets each morning.

const todayKey = "looksmaxx-" + new Date().toISOString().slice(0, 10);
const checkboxes = document.querySelectorAll(".check input");
const progressFill = document.getElementById("progress-fill");
const progressCount = document.getElementById("progress-count");
const routineNote = document.getElementById("routine-note");

const messages = [
  { at: 0, text: "Lock in. Day one starts now." },
  { at: 1, text: "Momentum started. Keep going." },
  { at: 5, text: "Solid. You're ahead of most people already." },
  { at: 9, text: "Almost a perfect day. Finish it." },
  { at: 13, text: "💯 Perfect day. Do it again tomorrow." },
];

function loadState() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(todayKey)) || {};
  } catch (_) {}
  checkboxes.forEach((box) => {
    box.checked = Boolean(saved[box.dataset.habit]);
  });
}

function saveState() {
  const state = {};
  checkboxes.forEach((box) => {
    state[box.dataset.habit] = box.checked;
  });
  localStorage.setItem(todayKey, JSON.stringify(state));
}

function updateProgress() {
  const total = checkboxes.length;
  const done = [...checkboxes].filter((box) => box.checked).length;
  progressCount.textContent = `${done} / ${total}`;
  progressFill.style.width = `${(done / total) * 100}%`;

  let note = messages[0].text;
  for (const m of messages) {
    if (done >= m.at) note = m.text;
  }
  routineNote.textContent = note;
}

checkboxes.forEach((box) => {
  box.addEventListener("change", () => {
    saveState();
    updateProgress();
  });
});

loadState();
updateProgress();

// ===== Reveal-on-scroll animation =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
