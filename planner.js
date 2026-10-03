(() => {
  const STORAGE_KEY = "study-planner-2026";

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function updateProgress(group) {
    const boxes = document.querySelectorAll(`input[data-group="${group}"]`);
    if (!boxes.length) return;
    const checked = [...boxes].filter((b) => b.checked).length;
    const total = boxes.length;
    const pct = Math.round((checked / total) * 100);

    document.querySelectorAll(`[data-progress-group="${group}"] span`).forEach((bar) => {
      bar.style.width = `${pct}%`;
    });
    document.querySelectorAll(`[data-progress-label="${group}"]`).forEach((label) => {
      label.textContent = `${checked}/${total}`;
    });
  }

  /* ——— Calendar (.ics) export ——— */

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  /** Local floating time: YYYYMMDDTHHMMSS (no Z = device local timezone) */
  function localStamp(year, month, day, hour = 0, minute = 0, second = 0) {
    return `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}${pad(second)}`;
  }

  function utcNowStamp() {
    const d = new Date();
    return (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      "T" +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      "Z"
    );
  }

  function foldLine(line) {
    if (line.length <= 75) return line;
    let out = line.slice(0, 75);
    let rest = line.slice(75);
    while (rest.length) {
      out += "\r\n " + rest.slice(0, 74);
      rest = rest.slice(74);
    }
    return out;
  }

  function icsEscape(text) {
    return String(text)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  }

  function vevent({ uid, summary, description, dtStart, dtEnd, rrule, alarmMinutes }) {
    const lines = [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${utcNowStamp()}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${icsEscape(summary)}`,
    ];
    if (description) lines.push(`DESCRIPTION:${icsEscape(description)}`);
    if (rrule) lines.push(`RRULE:${rrule}`);
    lines.push("STATUS:CONFIRMED");
    if (alarmMinutes != null) {
      lines.push(
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${icsEscape(summary)}`,
        `TRIGGER:-PT${alarmMinutes}M`,
        "END:VALARM"
      );
    }
    lines.push("END:VEVENT");
    return lines.map(foldLine).join("\r\n");
  }

  /** First weekday on/after startDate: 0=Sun … 6=Sat */
  function firstWeekdayOnOrAfter(year, month, day, weekday) {
    const d = new Date(year, month - 1, day);
    const diff = (weekday - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff);
    return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
  }

  function buildIcs() {
    const until = "20261231T235959"; // end of Dec 2026
    const events = [];

    // Recurring fixed classes (start week of Oct 5–11, 2026)
    const mon = firstWeekdayOnOrAfter(2026, 10, 5, 1); // Mon Oct 5
    const tue = firstWeekdayOnOrAfter(2026, 10, 6, 2); // Tue Oct 6
    const wed = firstWeekdayOnOrAfter(2026, 10, 7, 3); // Wed Oct 7
    const sat = firstWeekdayOnOrAfter(2026, 10, 3, 6); // Sat Oct 3
    const sun = firstWeekdayOnOrAfter(2026, 10, 4, 0); // Sun Oct 4

    events.push(
      vevent({
        uid: "physics-class-mon@study-planner-2026",
        summary: "Physics Class",
        description: "Fixed class · Mon 7:30–8:30 PM",
        dtStart: localStamp(mon.y, mon.m, mon.d, 19, 30),
        dtEnd: localStamp(mon.y, mon.m, mon.d, 20, 30),
        rrule: `FREQ=WEEKLY;BYDAY=MO;UNTIL=${until}`,
        alarmMinutes: 15,
      }),
      vevent({
        uid: "physics-class-wed@study-planner-2026",
        summary: "Physics Class",
        description: "Fixed class · Wed 7:30–8:30 PM",
        dtStart: localStamp(wed.y, wed.m, wed.d, 19, 30),
        dtEnd: localStamp(wed.y, wed.m, wed.d, 20, 30),
        rrule: `FREQ=WEEKLY;BYDAY=WE;UNTIL=${until}`,
        alarmMinutes: 15,
      }),
      vevent({
        uid: "math-class-tue@study-planner-2026",
        summary: "Math Class",
        description: "Fixed class · Tue 8:30–9:30 PM",
        dtStart: localStamp(tue.y, tue.m, tue.d, 20, 30),
        dtEnd: localStamp(tue.y, tue.m, tue.d, 21, 30),
        rrule: `FREQ=WEEKLY;BYDAY=TU;UNTIL=${until}`,
        alarmMinutes: 15,
      }),
      vevent({
        uid: "physics-class-sat@study-planner-2026",
        summary: "Physics Class",
        description: "Fixed class · Sat 8:00–10:00 AM",
        dtStart: localStamp(sat.y, sat.m, sat.d, 8, 0),
        dtEnd: localStamp(sat.y, sat.m, sat.d, 10, 0),
        rrule: `FREQ=WEEKLY;BYDAY=SA;UNTIL=${until}`,
        alarmMinutes: 30,
      }),
      vevent({
        uid: "rsm-class-sun@study-planner-2026",
        summary: "RSM Class",
        description: "Fixed class · Sun 9:00–11:30 AM",
        dtStart: localStamp(sun.y, sun.m, sun.d, 9, 0),
        dtEnd: localStamp(sun.y, sun.m, sun.d, 11, 30),
        rrule: `FREQ=WEEKLY;BYDAY=SU;UNTIL=${until}`,
        alarmMinutes: 30,
      }),
      vevent({
        uid: "evening-study-window@study-planner-2026",
        summary: "Evening Study Window",
        description:
          "7:00–10:30 PM study block. Anchors: Math 40 min · Chemistry 30 min · AP rotation (Mon/Thu/Sun Euro · Tue/Fri CSP · Wed/Sat Seminar).",
        dtStart: localStamp(2026, 10, 3, 19, 0),
        dtEnd: localStamp(2026, 10, 3, 22, 30),
        rrule: `FREQ=DAILY;UNTIL=${until}`,
        alarmMinutes: 10,
      })
    );

    // Physics Mission Tracker Oct 3–14 (evening focus blocks)
    const missions = [
      { day: 3, title: "Physics Mission: Q55–58", startH: 19, startM: 0, endH: 20, endM: 0 },
      { day: 4, title: "Physics Mission: Repeat Q55–58", startH: 19, startM: 0, endH: 20, endM: 0 },
      { day: 5, title: "Physics Mission: Q59–62", startH: 19, startM: 0, endH: 20, endM: 0 },
      { day: 6, title: "Physics Mission: Repeat Q59–62", startH: 19, startM: 0, endH: 20, endM: 0 },
      { day: 7, title: "Physics Mission: Q63–66", startH: 19, startM: 0, endH: 20, endM: 0 },
      { day: 8, title: "Physics Mission: Repeat Q63–66", startH: 19, startM: 0, endH: 20, endM: 0 },
      { day: 9, title: "Physics Mission: Q67–70", startH: 19, startM: 0, endH: 20, endM: 0 },
      { day: 10, title: "Physics Mission: Repeat Q67–70", startH: 19, startM: 0, endH: 20, endM: 0 },
      { day: 11, title: "Physics Mission: Q71 + Review", startH: 19, startM: 0, endH: 20, endM: 30 },
      { day: 12, title: "Physics Mission: Rework weak questions", startH: 19, startM: 0, endH: 20, endM: 30 },
      { day: 13, title: "Physics Mission: Final Review", startH: 19, startM: 0, endH: 21, endM: 0 },
    ];

    missions.forEach((m) => {
      // Mon/Wed missions: start after Physics class (8:30 PM)
      const isClassNight = m.day === 5 || m.day === 7; // Oct 5 Mon, Oct 7 Wed
      const startH = isClassNight ? 20 : m.startH;
      const startM = isClassNight ? 30 : m.startM;
      const endH = isClassNight ? 21 : m.endH;
      const endM = isClassNight ? 30 : m.endM;

      events.push(
        vevent({
          uid: `physics-mission-oct-${m.day}@study-planner-2026`,
          summary: m.title,
          description: "From Physics Mission Tracker · progress over perfection",
          dtStart: localStamp(2026, 10, m.day, startH, startM),
          dtEnd: localStamp(2026, 10, m.day, endH, endM),
          alarmMinutes: 10,
        })
      );
    });

    events.push(
      vevent({
        uid: "physics-test-oct-14@study-planner-2026",
        summary: "Physics Test",
        description: "Test day · Oct 14. You've got this.",
        dtStart: localStamp(2026, 10, 14, 8, 0),
        dtEnd: localStamp(2026, 10, 14, 9, 30),
        alarmMinutes: 60,
      })
    );

    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Abby's Study Planner//Oct-Dec 2026//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Abby's Study Planner Oct-Dec 2026",
      "X-WR-TIMEZONE:local",
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");

    return body + "\r\n";
  }

  function downloadCalendar() {
    const ics = buildIcs();
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "abbys-study-planner-oct-dec-2026.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function initCalendarButtons() {
    ["calendar-btn", "calendar-btn-cover"].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener("click", downloadCalendar);
    });
  }

  function init() {
    const state = loadState();
    const boxes = document.querySelectorAll('input[type="checkbox"][data-key]');
    const groups = new Set();

    boxes.forEach((box) => {
      const key = box.dataset.key;
      if (state[key]) box.checked = true;
      if (box.dataset.group) groups.add(box.dataset.group);

      box.addEventListener("change", () => {
        const next = loadState();
        next[key] = box.checked;
        saveState(next);
        if (box.dataset.group) updateProgress(box.dataset.group);
      });
    });

    groups.forEach(updateProgress);
    initCalendarButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
