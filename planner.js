/* ============================================================
   Abby's Study Planner — planner.js
   Handles:
   - Checkbox saving
   - Progress bar updates
   - Mission tracker totals
   - Habit tracker totals
   - Calendar (.ics) file generation
   - Smooth scrolling
============================================================ */

/* -----------------------------
   1. Restore checkbox states
----------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const boxes = document.querySelectorAll("input[type='checkbox'][data-key]");

  boxes.forEach(box => {
    const key = box.dataset.key;
    const saved = localStorage.getItem(key);

    if (saved === "true") {
      box.checked = true;
    }

    box.addEventListener("change", () => {
      localStorage.setItem(key, box.checked);
      updateProgress();
    });
  });

  updateProgress();
});

/* -----------------------------
   2. Progress bar updater
----------------------------- */

function updateProgress() {
  const groups = document.querySelectorAll("[data-progress-group]");

  groups.forEach(bar => {
    const groupName = bar.dataset.progressGroup;

    const groupBoxes = document.querySelectorAll(`input[data-group='${groupName}']`);
    const completed = Array.from(groupBoxes).filter(b => b.checked).length;
    const total = groupBoxes.length;

    const percent = total === 0 ? 0 : (completed / total) * 100;

    const barFill = bar.querySelector("span");
    if (barFill) barFill.style.width = `${percent}%`;

    const label = document.querySelector(`[data-progress-label='${groupName}']`);
    if (label) label.textContent = `${completed}/${total}`;
  });
}

/* -----------------------------
   3. Smooth scrolling
----------------------------- */

document.querySelectorAll("nav a[href^='#']").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 20,
        behavior: "smooth"
      });
    }
  });
});

/* -----------------------------
   4. Calendar (.ics) generator
----------------------------- */

function generateICS() {
  const title = "Abby's Study Window";
  const description = "Evening study window: 7:00 PM – 10:30 PM";
  const startTime = "190000"; // 7 PM
  const endTime = "223000";   // 10:30 PM

  // Oct 1 – Dec 31, 2026
  const startDate = "20261001";
  const endDate = "20261231";

  const ics = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Abby Planner//EN
BEGIN:VEVENT
DTSTART:${startDate}T${startTime}
DTEND:${startDate}T${endTime}
RRULE:FREQ=DAILY;UNTIL=${endDate}T235900
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR
  `.trim();

  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "study-window.ics";
  a.click();

  URL.revokeObjectURL(url);
}

/* Buttons */
document.getElementById("calendar-btn")?.addEventListener("click", generateICS);
document.getElementById("calendar-btn-cover")?.addEventListener("click", generateICS);
