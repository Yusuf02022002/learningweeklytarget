let originalActivityHTML = "";
const API_BASE = "https://backend-production-4d64.up.railway.app/api";
let userId = window.USER_ID || 1;

let learningSchedule = {
  sen: false,
  sel: false,
  rab: false,
  kam: false,
  jum: false,
  sab: false,
  min: false,
};

let reminderHour = 9;
let reminderMinute = 0;
let lastReminderShownKey = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function findBadgeElementForDay(dayKey) {
  let el =
    document.querySelector(`.badge-wrapper[data-day="${dayKey}"]`) ||
    document.querySelector(`.badge-item[data-day="${dayKey}"]`);
  if (el) return el;

  const mapLabel = {
    sen: "Sen",
    sel: "Sel",
    rab: "Rab",
    kam: "Kam",
    jum: "Jum",
    sab: "Sab",
    min: "Min",
  };
  const target = mapLabel[dayKey];
  if (!target) return null;

  for (const c of $$(".badge-item")) {
    if (c.textContent.trim().startsWith(target)) return c;
  }
  return null;
}

function updateBadgeVisualForDay(day, enabled) {
  const badge = findBadgeElementForDay(day);
  if (!badge) return;

  if (enabled) {
    badge.classList.add("active");
  } else {
    badge.classList.remove("active");
  }
}

//
async function showActivity() {
  try {
    const statsRes = await fetch(
      "https://backend-production-4d64.up.railway.app/api/activity"
    );
    if (!statsRes.ok) throw new Error(`HTTP ${statsRes.status}`);
    const statsData = await statsRes.json();
    if (!statsData || statsData.length === 0) return;

    const userId = window.USER_ID || statsData[0].user_id;
    const userData =
      statsData.find((u) => u.user_id === userId) || statsData[0];

    document.getElementById("bestStreak").textContent =
      userData.best_streak || 0;

    const totalMinutes = Number(userData.total_minutes) || 0;
    const diffMinutes = Number(userData.diff_minutes) || 0;

    document.getElementById("totalMinutes").innerHTML = `${totalMinutes} Menit
       <span class="minutes-inc" id="diffMinutes">
         <i class="bi bi-arrow-up-circle-fill"></i> ${diffMinutes} Menit
       </span>`;

    document.getElementById(
      "courseCount"
    ).innerHTML = `<i class="bi bi-person-workspace"></i> ${
      userData.courses || 0
    }`;
    document.getElementById(
      "assessmentCount"
    ).innerHTML = `<i class="bi bi-card-checklist"></i> ${
      userData.assessments || 0
    }`;
  } catch (err) {
    console.error("Gagal memuat data aktivitas:", err);
  }
}

document.addEventListener("DOMContentLoaded", showActivity);

function bindScheduleButton() {
  const scheduleBtn =
    $("#openSchedule") || document.querySelector('.link[href="#"]');
  const scheduleOverlay = $("#scheduleOverlay");
  if (!scheduleBtn || !scheduleOverlay) return;

  scheduleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    scheduleOverlay.classList.remove("hidden");
    scheduleOverlay.style.display = "flex";
  });
}

function setupScheduleOverlayHandlers() {
  const scheduleOverlay = $("#scheduleOverlay");
  const closeSchedule = $("#closeSchedule");
  if (closeSchedule)
    closeSchedule.onclick = () => {
      scheduleOverlay.classList.add("hidden");
      scheduleOverlay.style.display = "none";
    };
  if (scheduleOverlay)
    scheduleOverlay.onclick = (e) => {
      if (e.target === scheduleOverlay) {
        scheduleOverlay.classList.add("hidden");
        scheduleOverlay.style.display = "none";
      }
    };
}

function setupToggleListeners() {
  $$(".day-toggle").forEach((toggle) => {
    toggle.addEventListener("change", async function () {
      const day = this.dataset.day;
      learningSchedule[day] = this.checked;
      localStorage.setItem(
        "learningSchedule",
        JSON.stringify(learningSchedule)
      );
      updateBadgeVisualForDay(day, this.checked);

      if (!userId) return;
      const payload = Object.fromEntries(
        Object.entries(learningSchedule).map(([k, v]) => [k, v ? 1 : 0])
      );
      try {
        await fetch(`${API_BASE}/schedule/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (e) {}
    });
  });
}

let reminderOverlay, closeReminder, btnSnooze, btnStartLearning, reminderTime;

function initializeReminderElements() {
  reminderOverlay = $("#reminderOverlay");
  closeReminder = $("#closeReminder");
  btnSnooze = $("#btnSnooze");
  btnStartLearning = $("#btnStartLearning");
  reminderTime = $("#reminderTime");
  return !!reminderOverlay;
}

function checkTodaySchedule() {
  const today = new Date();
  const dayNames = ["min", "sen", "sel", "rab", "kam", "jum", "sab"];
  return learningSchedule[dayNames[today.getDay()]];
}

function getReminderKey() {
  return `reminder_${reminderHour}_${reminderMinute}_${new Date().toDateString()}`;
}
function hasReminderBeenShownForCurrentTime() {
  return lastReminderShownKey === getReminderKey();
}

function showReminder() {
  if (!initializeReminderElements()) return;
  if (checkTodaySchedule() && !hasReminderBeenShownForCurrentTime()) {
    reminderTime.textContent = `${String(reminderHour).padStart(
      2,
      "0"
    )}:${String(reminderMinute).padStart(2, "0")} WIB`;
    reminderOverlay.classList.remove("hidden");
    reminderOverlay.style.display = "flex";
    lastReminderShownKey = getReminderKey();
    localStorage.setItem("lastReminderShownKey", lastReminderShownKey);
  }
}

function setupReminderEventListeners() {
  if (!initializeReminderElements()) return;
  closeReminder?.addEventListener("click", () => {
    reminderOverlay.classList.add("hidden");
    reminderOverlay.style.display = "none";
  });
  btnSnooze?.addEventListener("click", () => {
    reminderOverlay.classList.add("hidden");
    reminderOverlay.style.display = "none";
    setTimeout(showReminder, 5 * 60 * 1000);
  });
  btnStartLearning?.addEventListener("click", () => {
    reminderOverlay.classList.add("hidden");
    reminderOverlay.style.display = "none";
  });
  reminderOverlay?.addEventListener("click", (e) => {
    if (e.target === reminderOverlay) {
      reminderOverlay.classList.add("hidden");
      reminderOverlay.style.display = "none";
    }
  });
}

function loadDataFromStorage() {
  const savedSchedule = localStorage.getItem("learningSchedule");
  if (savedSchedule) {
    learningSchedule = JSON.parse(savedSchedule);
    $$(".day-toggle").forEach((toggle) => {
      const day = toggle.dataset.day;
      toggle.checked = !!learningSchedule[day];
      updateBadgeVisualForDay(day, !!learningSchedule[day]);
    });
  }
  const savedKey = localStorage.getItem("lastReminderShownKey");
  if (savedKey) {
    lastReminderShownKey = savedKey;
  }
}

function startReminderChecker() {
  setInterval(() => {
    const now = new Date();
    if (
      now.getHours() === reminderHour &&
      now.getMinutes() === reminderMinute &&
      !hasReminderBeenShownForCurrentTime()
    ) {
      showReminder();
    }
  }, 10000);
}

function initializeReminderSystem() {
  loadDataFromStorage();
  setupToggleListeners();
  setupReminderEventListeners();
  startReminderChecker();
}

const dailyOverlay = document.getElementById("dailyOverlay");
const dailyModal = document.getElementById("dailyModal");
const dailyDate = document.getElementById("dailyDate");
const dailyCheckinBtn = document.getElementById("btn-open-add");
const closeDaily = document.getElementById("closeDaily");
const dailyCancel = document.getElementById("dailyCancel");
const dailySubmit = document.getElementById("dailySubmit");
let selectedMood = null,
  currentOpenDate = null,
  currentOpenSubmittedBtn = null;

function parseLocalISO(iso) {
  const [y, m, d] = iso.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function getFormattedDateFromISO(isoDate) {
  const date = parseLocalISO(isoDate);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function openDailyModal(dateStr, checkinData = null) {
  currentOpenDate = dateStr;

  dailyOverlay.style.display = "flex";
  dailyModal.style.display = "flex";

  dailyDate.textContent = getFormattedDateFromISO(dateStr);

  $$(".mood-btn").forEach((b) => b.classList.remove("active"));
  $("#dailyText").value = "";

  if (checkinData) {
    selectedMood = checkinData.mood;

    $$(".mood-btn").forEach((b) => {
      if (b.dataset.mood === checkinData.mood) b.classList.add("active");
    });

    $("#dailyText").value = checkinData.text || "";
  }
}

dailyCheckinBtn?.addEventListener("click", () => {
  openDailyModal(toLocalDateString(new Date()), null);
});
closeDaily?.addEventListener("click", closeModal);
dailyCancel?.addEventListener("click", closeModal);

$$(".mood-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".mood-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedMood = btn.dataset.mood;
  });
});

dailySubmit?.addEventListener("click", async () => {
  const textEl = $("#dailyText");
  const text = textEl ? textEl.value.trim() : "";
  if (!selectedMood || !text) {
    alert("Mohon lengkapi mood dan progress belajarmu.");
    return;
  }
  try {
    const payload = { userId, date: currentOpenDate, mood: selectedMood, text };
    const res = await fetch(`${API_BASE}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save checkin");
    if (currentOpenSubmittedBtn) {
      currentOpenSubmittedBtn.textContent = "Submitted";
      currentOpenSubmittedBtn.className = "info-btn submitted";
    }
    closeModal();
    setTimeout(() => alert("Daily Check-in berhasil disubmit!"), 50);
    await reloadCheckins();
  } catch (err) {
    alert("Gagal menyimpan check-in: " + err.message);
  }
});

function closeModal() {
  dailyOverlay?.classList.add("hidden");
  dailyOverlay.style.display = "none";
  dailyModal?.classList.add("hidden");
  dailyModal.style.display = "none";
  selectedMood = null;
  $$(".mood-btn").forEach((b) => b.classList.remove("active"));
  $("#dailyText") && ($("#dailyText").value = "");
  currentOpenDate = null;
  currentOpenSubmittedBtn = null;
}

function showNotSubmittedModal(dateStr) {
  const overlay = $("#notSubmittedOverlay");
  const modal = $("#notSubmittedModal");
  const title = $("#notSubmittedTitle");
  overlay?.classList.remove("hidden");
  overlay.style.display = "flex";
  modal?.classList.remove("hidden");
  modal.style.display = "flex";
  if (title)
    title.textContent = `Kamu Tidak Mengisi Daily Check-in (${dateStr})`;
}
$("#notSubmittedOk")?.addEventListener("click", () => {
  $("#notSubmittedOverlay")?.classList.add("hidden");
  $("#notSubmittedOverlay").style.display = "none";
  $("#notSubmittedModal")?.classList.add("hidden");
  $("#notSubmittedModal").style.display = "none";
});

async function showStreakScreen(e) {
  e?.preventDefault();
  const container = $("#activityContainer");
  if (!container) return;
  if (!originalActivityHTML) originalActivityHTML = container.innerHTML;

  let html = `
    <div style="background:#e5e8ee; padding:12px; border-radius:12px; margin-bottom:4px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:8px;">
          <h2 style="margin:0; font-size:20px; display:flex; align-items:center; gap:6px;">
            <i class="bi bi-fire" style="color:#ff5722; font-size:22px;"></i>
            Streak Belajar
          </h2>
        </div>
        <button id="btn-activity" style="
          padding:10px 20px;
          border-radius:12px;
          border:none;
          background:white;
          cursor:pointer;
          display:flex;
          align-items:center;
          gap:6px;
        ">
          <i class="bi bi-arrow-right-circle"></i>
          Aktivitas Belajar
        </button>
      </div>
      <div style="color:#6b7280; font-size:14px; margin-top:4px;">
        Status peringkat streak terbaik dan progres belajar mingguan
      </div>
    </div>
  `;

  try {
    const response = await fetch(
      "https://backend-production-4d64.up.railway.app/api/streak"
    );
    const data = await response.json();

    data.forEach((item, index) => {
      html += `<div class="streak-card">
    <div class="streak-left">`;

      if (item.award) {
        html += `<img src="src/images/${item.award}" class="streak-medal">`;
      } else {
        html += `<div class="streak-rank-circle">${index + 1}</div>`;
      }
      html += `<img src="src/images/${
        item.user?.avatar || "default-avatar.png"
      }" class="streak-avatar">`;
      html += `<div class="streak-name">${item.user?.name || "Unknown"}</div>
    </div>
    <div class="streak-value">
      <i class="bi bi-lightning-charge-fill" style="color:#ffb21a;"></i> ${
        item.score
      }
    </div>
  </div>`;
    });

    container.innerHTML = html;
    activateBackButton();
  } catch (err) {
    console.error("Gagal memuat data streak:", err);
    container.innerHTML = `<p style="color:red;">Gagal memuat data streak</p>`;
  }
}

function activateBackButton() {
  $("#btn-activity")?.addEventListener("click", () => {
    const container = $("#activityContainer");
    if (!container) return;
    container.innerHTML = originalActivityHTML;
    originalActivityHTML = "";
    bindStreakButton();
    bindScheduleButton();
  });
}

function bindStreakButton() {
  $("#btn-streak")?.addEventListener("click", showStreakScreen);
}

async function initializeFullCalendar() {
  const calendarEl = $("#fc-calendar");
  if (!calendarEl) return console.warn("#fc-calendar not found");

  const checkins = await getCheckinFromAPI();
  window._checkinData = checkins || [];

  const events = [];

  function toLocalDateString(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    headerToolbar: false,
    selectable: true,
    editable: false,
    events: [],
    dayMaxEventRows: 3,

    dayCellDidMount: function (info) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const cellDate = new Date(info.date);
      cellDate.setHours(0, 0, 0, 0);
      if (cellDate > today) return;

      const dateNormalized = toLocalDateString(cellDate);
      const isSubmitted = window._checkinData.some((c) => {
        const apiDateStr = toLocalDateString(c.date);
        return (
          apiDateStr === dateNormalized && Number(c.user_id) === Number(userId)
        );
      });

      const btnContainer = document.createElement("div");
      btnContainer.className = "btn-container";

      const checkinBtn = document.createElement("button");
      checkinBtn.type = "button";
      checkinBtn.textContent = "Daily Check-in";
      checkinBtn.className = "checkin-btn";

      const submittedBtn = document.createElement("button");
      submittedBtn.type = "button";

      if (isSubmitted) {
        submittedBtn.textContent = "Submitted";
        submittedBtn.className = "info-btn submitted";
        const cellCheckinData = window._checkinData.find(
          (c) =>
            toLocalDateString(new Date(c.date)) === dateNormalized &&
            Number(c.user_id) === Number(userId)
        );
        submittedBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          currentOpenSubmittedBtn = submittedBtn;
          openDailyModal(dateNormalized, cellCheckinData);
        });
      } else {
        submittedBtn.textContent = "Not Submitted";
        submittedBtn.className = "info-btn not-submitted";
        submittedBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          currentOpenSubmittedBtn = null;
          showNotSubmittedModal(dateNormalized);
        });
      }
      checkinBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const checkinData = window._checkinData.find(
          (c) =>
            toLocalDateString(new Date(c.date)) === dateNormalized &&
            Number(c.user_id) === Number(userId)
        );

        const todayStr = toLocalDateString(new Date());

        if (!checkinData) {
          if (dateNormalized === todayStr) {
            currentOpenSubmittedBtn = null;
            openDailyModal(dateNormalized, null, null);
          } else {
            currentOpenSubmittedBtn = null;
            showNotSubmittedModal(dateNormalized);
          }
        } else {
          currentOpenSubmittedBtn = submittedBtn;
          openDailyModal(dateNormalized, checkinData);
        }
      });

      btnContainer.appendChild(checkinBtn);
      btnContainer.appendChild(submittedBtn);
      info.el.appendChild(btnContainer);
    },

    datesSet: function () {
      const currentDate = calendar.getDate();
      $("#monthLabel") &&
        ($("#monthLabel").textContent = new Intl.DateTimeFormat("id-ID", {
          month: "long",
          year: "numeric",
        }).format(currentDate));
      $("#currentDayLabel") &&
        ($("#currentDayLabel").textContent = new Intl.DateTimeFormat("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date()));
    },
  });

  calendar.render();
  window._calendar = calendar;

  document.querySelector("#prevBtn")?.addEventListener("click", () => {
    window._calendar.prev();
  });
  document.querySelector("#nextBtn")?.addEventListener("click", () => {
    window._calendar.next();
  });
}

let dailyData = [];
async function loadDailyFromAPI() {
  try {
    const res = await fetch(`${API_BASE}/checkin?userId=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch daily checkins");
    dailyData = await res.json();
  } catch (err) {
    console.error("Gagal ambil daily dari API:", err);
    dailyData = [];
  }
}
async function getCheckinFromAPI() {
  try {
    const res = await fetch(`${API_BASE}/checkin?userId=${userId}`);
    if (!res.ok) throw new Error("checkin fetch failed");
    return await res.json();
  } catch (e) {
    console.warn("getCheckinFromAPI failed:", e);
    return [];
  }
}
async function waitForElement(selector) {
  while (!document.querySelector(selector)) {
    await new Promise((r) => setTimeout(r, 50));
  }
  return document.querySelector(selector);
}

w3.includeHTML(async () => {
  console.log("HTML components loaded");
  window.dailyOverlay = document.querySelector("#dailyOverlay");
  window.dailyModal = document.querySelector("#dailyModal");
  window.dailyDate = document.querySelector("#dailyDate");

  window.dailyCheckinBtn =
    document.querySelector("#btn-open-add") ||
    document.querySelector("#dailyCheckinBtn");

  window.closeDaily = document.querySelector("#closeDaily");
  window.dailyCancel = document.querySelector("#dailyCancel");
  window.dailySubmit = document.querySelector("#dailySubmit");
  setupDailyModalEvents();

  await waitForElement("#openSchedule");
  bindScheduleButton();
  setupScheduleOverlayHandlers();

  await waitForElement("#btn-streak");
  bindStreakButton();

  initializeReminderSystem();

  while (!window.FullCalendar) await new Promise((r) => setTimeout(r, 50));
  await waitForElement("#fc-calendar");
  await initializeFullCalendar();
});

function setupDailyModalEvents() {
  dailyCheckinBtn?.addEventListener("click", () => {
    openDailyModal(new Date().toISOString().slice(0, 10), null);
  });

  closeDaily?.addEventListener("click", closeModal);
  dailyCancel?.addEventListener("click", closeModal);

  document.querySelectorAll(".mood-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".mood-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedMood = btn.dataset.mood;
    });
  });

  dailySubmit.onclick = submitDailyCheckin;
}

async function submitDailyCheckin() {
  const textEl = $("#dailyText");
  const text = textEl ? textEl.value.trim() : "";

  if (!selectedMood || !text) {
    alert("Mohon lengkapi mood dan progress belajarmu.");
    return;
  }

  try {
    const payload = { userId, date: currentOpenDate, mood: selectedMood, text };

    const res = await fetch(`${API_BASE}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to save checkin");

    if (currentOpenSubmittedBtn) {
      currentOpenSubmittedBtn.textContent = "Submitted";
      currentOpenSubmittedBtn.className = "info-btn submitted";
    }

    const newRecord = {
      id: null,
      user_id: userId,
      date: currentOpenDate,
      mood: selectedMood,
      text,
      saved_at: new Date().toISOString(),
    };
    window._checkinData = window._checkinData || [];
    await reloadCheckins();

    closeModal();
  } catch (err) {
    console.warn(err);
    alert("Gagal menyimpan check-in: " + err.message);
  }
}

async function reloadCheckins() {
  window._checkinData = await getCheckinFromAPI();
  if (window._calendar) {
    window._calendar.destroy();
    await initializeFullCalendar();
  }
}

function toLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const scheduleAPI = `${API_BASE}/schedule/${userId}`;

async function loadScheduleFromServer() {
  try {
    const res = await fetch(scheduleAPI);
    if (!res.ok) throw new Error("Failed to fetch schedule");
    const data = await res.json();
    Object.keys(data || {}).forEach((day) => {
      const checked = !!data[day];
      const toggle = document.querySelector(`.day-toggle[data-day="${day}"]`);
      if (toggle) toggle.checked = checked;
      updateBadgeVisualForDay(day, checked);
      learningSchedule[day] = checked;
    });
  } catch (err) {
    console.error("Gagal load schedule:", err);
  }
}

async function saveScheduleToServer(day, value) {
  learningSchedule[day] = value;
  updateBadgeVisualForDay(day, value);

  const payload = {};
  Object.keys(learningSchedule).forEach(
    (k) => (payload[k] = learningSchedule[k] ? 1 : 0)
  );

  try {
    const res = await fetch(scheduleAPI, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save schedule");
    const updated = await res.json();
    console.log("Schedule updated:", updated);
  } catch (err) {
    console.warn("Gagal simpan schedule:", err);
  }
}

function setupScheduleToggles() {
  document.querySelectorAll(".day-toggle").forEach((toggle) => {
    toggle.addEventListener("change", () => {
      const day = toggle.dataset.day;
      saveScheduleToServer(day, toggle.checked);
    });
  });
}

function initScheduleModal() {
  const openBtn = document.getElementById("openSchedule");
  const overlay = document.getElementById("scheduleOverlay");
  const closeBtn = document.getElementById("closeSchedule");

  if (!openBtn || !overlay || !closeBtn) return;

  openBtn.addEventListener("click", () => {
    overlay.classList.remove("hidden");
    overlay.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
    overlay.style.display = "none";
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.add("hidden");
      overlay.style.display = "none";
    }
  });

  loadScheduleFromServer();
  setupScheduleToggles();
}

document.addEventListener("DOMContentLoaded", initScheduleModal);

const hamburgerBtn = document.getElementById("hamburgerBtn");
const sidebar = document.querySelector(".sidebar");

hamburgerBtn?.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});
