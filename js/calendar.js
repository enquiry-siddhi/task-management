// ============================================
// CALENDAR.JS — Monthly calendar with tasks
// ============================================

let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth(); // 0-indexed

function renderCalendar() {
  updateCalLabel();
  buildCalGrid();
}

function updateCalLabel() {
  const months = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];
  document.getElementById('cal-month-label').textContent = months[calMonth] + ' ' + calYear;
}

function changeMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  updateCalLabel();
  buildCalGrid();
}

function buildCalGrid() {
  const grid = document.getElementById('cal-grid');
  const tasks = getVisibleTasks ? getVisibleTasks() : getTasks();
  const today = new Date().toISOString().split('T')[0];

  const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  let html = '';

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="cal-day empty"></div>';
  }

  // Days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = padDate(calYear) + '-' + padDate(calMonth + 1) + '-' + padDate(d);
    const isToday = dateStr === today;
    const dayTasks = tasks.filter(t => t.dueDate === dateStr);

    const eventsHtml = dayTasks.slice(0, 3).map(t => {
      const cls = t.status === 'completed' ? 'completed' : t.priority;
      return `<div class="cal-event ${cls}" title="${t.title}">${t.title}</div>`;
    }).join('');

    const hasTasks = dayTasks.length > 0;

    html += `
      <div class="cal-day ${isToday ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}"
           onclick="onCalDayClick('${dateStr}', event)"
           title="${dayTasks.length > 0 ? dayTasks.length + ' task(s)' : ''}">
        <div class="day-num">${d}${dayTasks.length > 3 ? '<sub style="font-size:9px;color:var(--accent-3)">+' + (dayTasks.length - 3) + '</sub>' : ''}</div>
        <div class="cal-events">${eventsHtml}</div>
      </div>
    `;
  }

  grid.innerHTML = html;
}

function onCalDayClick(dateStr, e) {
  const tasks = (getVisibleTasks ? getVisibleTasks() : getTasks()).filter(t => t.dueDate === dateStr);
  if (tasks.length === 0) return;
  if (tasks.length === 1) {
    openTaskModal(tasks[0].id);
    return;
  }
  // Show mini list (simple alert for now, could be a modal)
  const names = tasks.map(t => '• ' + t.title + ' [' + (t.priority) + ']').join('\n');
  alert('Tasks on ' + dateStr + ':\n\n' + names);
}

function padDate(n) {
  return String(n).padStart(2, '0');
}
