document.addEventListener("DOMContentLoaded", () => {
  const checkboxKeys = [
    "cover-g1", "cover-g2", "cover-g3", "cover-g4", "cover-g5",
    "oct-p1", "oct-p2", "oct-p3", "oct-p4", "oct-p5", "oct-p6", "oct-p7",
    "oct-m1", "oct-m2", "oct-m3",
    "oct-c1", "oct-c2",
    "oct-a1", "oct-a2", "oct-a3",
    "mis-1", "mis-2", "mis-3", "mis-4", "mis-5", "mis-6", "mis-7", "mis-8", "mis-9", "mis-10", "mis-11", "mis-12",
    "d-p1", "d-p2", "d-p3", "d-phys", "d-math", "d-chem", "d-ap",
    "nov-1", "nov-2", "nov-3", "nov-4",
    "dec-1", "dec-2", "dec-3", "dec-4"
  ];

  const calendarBtn = document.getElementById("calendar-btn");
  const calendarBtnCover = document.getElementById("calendar-btn-cover");

  const saveState = () => {
    const state = {};
    document.querySelectorAll("input[type='checkbox']").forEach((box) => {
      state[box.dataset.key] = box.checked;
    });
    localStorage.setItem("abby-study-planner-state", JSON.stringify(state));
  };

  const loadState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("abby-study-planner-state") || "{}");
      document.querySelectorAll("input[type='checkbox']").forEach((box) => {
        const key = box.dataset.key;
        if (saved[key] !== undefined) box.checked = saved[key];
      });
    } catch (error) {
      console.warn("Could not restore planner state", error);
    }
  };

  const updateProgress = () => {
    document.querySelectorAll("[data-progress-group]").forEach((bar) => {
      const group = bar.dataset.progressGroup;
      const checkboxes = document.querySelectorAll(`input[data-group="${group}"]`);
      const total = checkboxes.length;
      const done = [...checkboxes].filter((input) => input.checked).length;
      const percent = total ? (done / total) * 100 : 0;

      const fill = bar.querySelector("span");
      if (fill) fill.style.width = `${percent}%`;

      const label = document.querySelector(`[data-progress-label="${group}"]`);
      if (label) {
        label.textContent = `${done}/${total}`;
      }
    });

    const missionBoxes = document.querySelectorAll('input[data-group="mission"]');
    const missionTotal = missionBoxes.length;
    const missionDone = [...missionBoxes].filter((box) => box.checked).length;

    const missionLabel = document.querySelector('[data-progress-label="mission"]');
    if (missionLabel) missionLabel.textContent = `${missionDone}/${missionTotal}`;

    const missionBar = document.querySelector('[data-progress-group="mission"] span');
    if (missionBar) missionBar.style.width = `${(missionDone / missionTotal) * 100}%`;
  };

  const bindCheckboxes = () => {
    document.querySelectorAll("input[type='checkbox']").forEach((box) => {
      box.addEventListener("change", () => {
        saveState();
        updateProgress();
      });
    });
  };

  const makeICal = () => {
    const events = [
      { title: "Physics Test", date: "2026-10-14", time: "09:00" },
      { title: "Math Anchor Session", date: "2026-10-05", time: "19:00" },
      { title: "Chemistry Review", date: "2026-10-06", time: "19:30" },
      { title: "AP Euro Session", date: "2026-10-08", time: "19:00" }
    ];

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Abby Study Planner//EN",
      "BEGIN:VEVENT"
    ];

    events.forEach((event) => {
      const start = `${event.date.replace(/-/g, "")}T${event.time.replace(":", "")}00`;
      lines.push(`SUMMARY:${event.title}`);
      lines.push(`DTSTART:${start}`);
      lines.push(`DTEND:${start}`);
      lines.push("END:VEVENT");
    });

    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  };

  const downloadCalendar = () => {
    const blob = new Blob([makeICal()], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "abby-study-planner.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (calendarBtn) calendarBtn.addEventListener("click", downloadCalendar);
  if (calendarBtnCover) calendarBtnCover.addEventListener("click", downloadCalendar);

  bindCheckboxes();
  loadState();
  updateProgress();

  checkboxKeys.forEach((key) => {
    const el = document.querySelector(`input[data-key="${key}"]`);
    if (el) {
      el.checked = !!localStorage.getItem(`planner-${key}`);
    }
  });
});
