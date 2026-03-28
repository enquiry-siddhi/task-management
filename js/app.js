// ============================================
// APP.JS — Core Application Logic
// ============================================

let currentUser = null;
let activeSection = 'dashboard';
let currentDashFilter = 'all'; 
let dashboardScope    = 'all'; // all, toMe, byMe, team
let myTaskView   = 'kanban';
let teamTaskView = 'kanban';
let allTaskView  = 'list';
let allTasksSortCol = 'id';
let allTasksSortDir = 1;


// ──────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');

  const emp = getEmployees().find(emp =>
    emp.email.toLowerCase() === email && emp.password === pass
  );

  if (!emp) {
    errEl.classList.remove('hidden');
    document.getElementById('login-btn').classList.add('shake');
    setTimeout(() => document.getElementById('login-btn').classList.remove('shake'), 400);
    return;
  }

  errEl.classList.add('hidden');
  currentUser = emp;
  localStorage.setItem('skc_current_user', JSON.stringify(emp));
  enterApp();
}

function logout() {
  currentUser = null;
  localStorage.removeItem('skc_current_user');
  document.getElementById('login-page').classList.add('active');
  document.getElementById('login-page').classList.remove('hidden');
  document.getElementById('app-page').classList.add('hidden');
  document.getElementById('app-page').classList.remove('active');
  document.getElementById('login-email').value = '';
  document.getElementById('login-pass').value = '';
  closeSidebar();
}

function togglePass() {
  const inp = document.getElementById('login-pass');
  const ico = document.getElementById('eye-icon');
  if (inp.type === 'password') {
    inp.type = 'text';
    ico.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    inp.type = 'password';
    ico.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}

// ──────────────────────────────────────────
// CHANGE PASSWORD
// ──────────────────────────────────────────
let isForcedPassChange = false;

function openChangePassModal(forced = false) {
  isForcedPassChange = forced;
  document.getElementById('change-pass-modal').classList.remove('hidden');
  document.getElementById('change-pass-current').value = '';
  document.getElementById('change-pass-new').value = '';
  document.getElementById('change-pass-confirm').value = '';
  document.getElementById('change-pass-error').style.display = 'none';
  
  if (forced) {
    document.getElementById('change-pass-close').style.display = 'none';
    document.getElementById('change-pass-cancel-btn').style.display = 'none';
    document.getElementById('change-pass-current-group').style.display = 'none';
    document.getElementById('change-pass-msg').innerHTML = '<strong>Security Alert:</strong> Please set a unique new password to secure your account before continuing.';
  } else {
    document.getElementById('change-pass-close').style.display = 'block';
    document.getElementById('change-pass-cancel-btn').style.display = 'block';
    document.getElementById('change-pass-current-group').style.display = 'block';
    document.getElementById('change-pass-msg').textContent = 'Update your account password here.';
  }
}

function closeChangePassModal() {
  if (isForcedPassChange) return;
  document.getElementById('change-pass-modal').classList.add('hidden');
}

function submitChangePassword(e) {
  e.preventDefault();
  const current = document.getElementById('change-pass-current').value;
  const nw = document.getElementById('change-pass-new').value;
  const cf = document.getElementById('change-pass-confirm').value;
  const err = document.getElementById('change-pass-error');
  
  if (!isForcedPassChange && current !== currentUser.password) {
    err.textContent = 'Current password is incorrect.';
    err.style.display = 'block';
    return;
  }
  if (nw !== cf) {
    err.textContent = 'New passwords do not match.';
    err.style.display = 'block';
    return;
  }
  
  const emps = getEmployees();
  const idx = emps.findIndex(em => em.id === currentUser.id);
  if (idx !== -1) {
    emps[idx].password = nw;
    saveEmployees(emps);
  }
  
  currentUser.password = nw;
  localStorage.setItem('skc_current_user', JSON.stringify(currentUser));
  
  showToast('Password changed successfully! 🔒', 'success');
  isForcedPassChange = false;
  document.getElementById('change-pass-modal').classList.add('hidden');
}

function enterApp() {
  // Data already loaded by data.js initData()
  document.getElementById('login-page').classList.remove('active');
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('app-page').classList.remove('hidden');
  document.getElementById('app-page').classList.add('active');

  setupUserUI();
  showSection('dashboard');
  populateAssigneeDropdown();
  setupAdminUI();

  if (currentUser.password === 'siddhi123' || currentUser.password === '123456') {
      openChangePassModal(true);
  }
}

function setupUserUI() {
  const initials = currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('sidebar-avatar').textContent = initials;
  document.getElementById('topbar-avatar').textContent = initials;
  document.getElementById('sidebar-name').textContent = currentUser.name;
  document.getElementById('sidebar-role').textContent = currentUser.designation || currentUser.group;
  document.getElementById('topbar-name').textContent = currentUser.name;

  // Greeting
  const hour = new Date().getHours();
  const greetings = ['Good Night', 'Good Morning', 'Good Afternoon', 'Good Evening'];
  const g = hour < 5 ? 0 : hour < 12 ? 1 : hour < 17 ? 2 : 3;
  document.getElementById('dash-greeting').textContent =
    greetings[g] + ', ' + currentUser.name.split(' ')[0] + '! 👋';

  // Date
  const now = new Date();
  document.getElementById('dash-date').textContent = now.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function setupAdminUI() {
  const isAdmin = currentUser.role === 'admin' || currentUser.auth === 'All Group';
  const adminEls = document.querySelectorAll('.admin-only');
  adminEls.forEach(el => {
    if (isAdmin) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
  const divider = document.getElementById('admin-divider');
  if (isAdmin) divider.classList.remove('hidden');
  else divider.classList.add('hidden');
}

function populateAssigneeDropdown() {
  const sel = document.getElementById('task-assignee');
  sel.innerHTML = '<option value="">Select employee</option>';

  const assignable = getEmployees();

  assignable.forEach(emp => {
    const opt = document.createElement('option');
    opt.value = emp.id;
    opt.textContent = emp.name + ' (' + emp.designation + ')';
    sel.appendChild(opt);
  });
}

// ──────────────────────────────────────────
// NAVIGATION
// ──────────────────────────────────────────
function showSection(name) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });
  // Show target
  const target = document.getElementById('section-' + name);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }
  // Update nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navBtn = document.getElementById('nav-' + name);
  if (navBtn) navBtn.classList.add('active');

  // Update topbar title
  const titles = {
    'dashboard': 'Dashboard',
    'my-tasks': 'My Tasks',
    'assign-task': 'Assign Task',
    'team-tasks': 'Team Tasks',
    'calendar': 'Calendar',
    'all-tasks': 'All Tasks',
    'team-mgmt': 'Team Management'
  };
  document.getElementById('topbar-title').textContent = titles[name] || name;
  activeSection = name;

  // Render content
  if (name === 'dashboard') renderDashboard();
  else if (name === 'my-tasks') renderMyTasks();
  else if (name === 'team-tasks') renderTeamTasks();
  else if (name === 'all-tasks') renderAllTasks();
  else if (name === 'team-mgmt') renderTeamMgmt();
  else if (name === 'calendar') renderCalendar();
  else if (name === 'assign-task') setDefaultDueDate();

  // Close sidebar on mobile
  if (window.innerWidth <= 768) closeSidebar();

  closeNotifications();
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
  overlay.classList.toggle('hidden');
}
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
  overlay.classList.add('hidden');
}

// ──────────────────────────────────────────
// DASHBOARD
// ──────────────────────────────────────────
function setDashboardFilter(f) {
  if (currentDashFilter === f) currentDashFilter = 'all';
  else currentDashFilter = f;
  renderDashboard();
}

function setDashboardScope(s) {
  dashboardScope = s;
  // Update buttons
  document.querySelectorAll('.scope-btn').forEach(btn => {
    if (btn.dataset.scope === s) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  renderDashboard();
}

function renderDashboard() {
  const allVisibleTasks = getVisibleTasks();
  const today = new Date().toISOString().split('T')[0];

  const stats = {
    total: allVisibleTasks.length,
    completed: allVisibleTasks.filter(t => t.status === 'completed' || t.status === 'closed').length,
    inProgress: allVisibleTasks.filter(t => t.status === 'in-progress').length,
    pending: allVisibleTasks.filter(t => t.status === 'pending').length,
    overdue: allVisibleTasks.filter(t => t.status === 'overdue').length,
  };

  const isFiltered = currentDashFilter !== 'all';
  const displayTasks = isFiltered 
    ? (currentDashFilter === 'total' ? allVisibleTasks : allVisibleTasks.filter(t => t.status === currentDashFilter))
    : allVisibleTasks;

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card ${currentDashFilter === 'total' ? 'active-filter' : ''}" onclick="setDashboardFilter('total')" style="cursor:pointer">
      <div class="stat-icon purple">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <div class="stat-info">
        <div class="stat-value">${stats.total}</div>
        <div class="stat-label">Total Tasks</div>
      </div>
    </div>
    <div class="stat-card ${currentDashFilter === 'completed' ? 'active-filter' : ''}" onclick="setDashboardFilter('completed')" style="cursor:pointer">
      <div class="stat-icon green">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="stat-info">
        <div class="stat-value">${stats.completed}</div>
        <div class="stat-label">Completed</div>
        <div class="stat-change up">✓ ${stats.total ? Math.round(stats.completed/stats.total*100) : 0}% done</div>
      </div>
    </div>
    <div class="stat-card ${currentDashFilter === 'in-progress' ? 'active-filter' : ''}" onclick="setDashboardFilter('in-progress')" style="cursor:pointer">
      <div class="stat-icon purple">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div class="stat-info">
        <div class="stat-value">${stats.inProgress}</div>
        <div class="stat-label">In Progress</div>
      </div>
    </div>
    <div class="stat-card ${currentDashFilter === 'pending' ? 'active-filter' : ''}" onclick="setDashboardFilter('pending')" style="cursor:pointer" id="stat-pending">
      <div class="stat-icon yellow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div class="stat-info">
        <div class="stat-value">${stats.pending}</div>
        <div class="stat-label">Pending</div>
      </div>
    </div>
    <div class="stat-card ${currentDashFilter === 'overdue' ? 'active-filter' : ''}" onclick="setDashboardFilter('overdue')" style="cursor:pointer">
      <div class="stat-icon red">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div class="stat-info">
        <div class="stat-value">${stats.overdue}</div>
        <div class="stat-label">Overdue</div>
        ${stats.overdue > 0 ? '<div class="stat-change down">⚠ Needs attention</div>' : ''}
      </div>
    </div>
  `;

  // Recent tasks (based on displayTasks)
  const recent = [...displayTasks].sort((a,b) => b.createdAt > a.createdAt ? 1 : -1).slice(0, 6);
  const recentEl = document.getElementById('recent-task-list');
  const recentTitle = document.querySelector('.recent-tasks h3');
  if (recentTitle) {
    recentTitle.textContent = isFiltered ? `Filtered Tasks (${statusLabel(currentDashFilter)})` : 'Recent Tasks';
  }

  if (recent.length === 0) {
    recentEl.innerHTML = emptyState(isFiltered ? `No ${statusLabel(currentDashFilter)} tasks found.` : 'No tasks yet. Create your first task!');
  } else {
    recentEl.innerHTML = recent.map(t => {
      const assignee = getEmployee(t.assignedTo);
      return `
        <div class="recent-task-item" onclick="openTaskModal('${t.id}')">
          <div class="recent-task-info">
            <div class="recent-task-title">${t.title}</div>
            <div class="recent-task-sub">
              → ${assignee ? assignee.name : 'Unknown'} &nbsp;•&nbsp; Due: ${formatDate(t.dueDate)}
            </div>
          </div>
          <div class="recent-task-badges">
            <span class="badge badge-${t.priority}">${t.priority}</span>
            <span class="badge badge-${t.status}">${statusLabel(t.status)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Draw charts (based on displayTasks)
  setTimeout(() => {
    // If filtered, status chart is less interesting but we'll still draw it with the subset
    // calculating stats for the chart from displayTasks
    const chartStats = {
        completed: displayTasks.filter(t => t.status === 'completed' || t.status === 'closed').length,
        inProgress: displayTasks.filter(t => t.status === 'in-progress').length,
        pending: displayTasks.filter(t => t.status === 'pending').length,
        overdue: displayTasks.filter(t => t.status === 'overdue').length,
    };
    drawStatusChart(chartStats);
    drawPriorityChart(displayTasks);
  }, 100);

  // Notifications (always use all visible tasks)
  buildNotifications(allVisibleTasks);
}

// ──────────────────────────────────────────
// MY TASKS
// ──────────────────────────────────────────
function renderMyTasks() { filterMyTasks(); }

function setMyView(v) {
  myTaskView = v;
  document.querySelectorAll('#my-view-switcher .view-btn').forEach(b => b.classList.remove('active'));
  const map = { list:'my-view-list', kanban:'my-view-kanban', timeline:'my-view-timeline', 'calendar-tasks':'my-view-calendar' };
  const btn = document.getElementById(map[v]);
  if (btn) btn.classList.add('active');
  filterMyTasks();
}

function filterMyTasks() {
  const statusFilter   = document.getElementById('my-task-filter').value;
  const priorityFilter = document.getElementById('my-priority-filter').value;
  const today = new Date().toISOString().split('T')[0];

  let tasks = getTasks().filter(t => (t.assignedTo === currentUser.id || t.assignedTo === 'group:' + currentUser.group));
  tasks = tasks.map(t => {
    if (t.status !== 'completed' && t.status !== 'closed' && t.dueDate < today) return {...t, status: 'overdue'};
    return t;
  });
  if (statusFilter   !== 'all') tasks = tasks.filter(t => t.status   === statusFilter);
  if (priorityFilter !== 'all') tasks = tasks.filter(t => t.priority === priorityFilter);

  renderTasksView(tasks, 'my-task-container', myTaskView);
}

// ──────────────────────────────────────────
// TEAM TASKS
// ──────────────────────────────────────────
function renderTeamTasks() { filterTeamTasks(); }

function setTeamView(v) {
  teamTaskView = v;
  document.querySelectorAll('#team-view-switcher .view-btn').forEach(b => b.classList.remove('active'));
  const map = { list:'team-view-list', kanban:'team-view-kanban', timeline:'team-view-timeline', 'calendar-tasks':'team-view-calendar' };
  const btn = document.getElementById(map[v]);
  if (btn) btn.classList.add('active');
  filterTeamTasks();
}

function filterTeamTasks() {
  const filter = document.getElementById('team-filter').value;
  const today  = new Date().toISOString().split('T')[0];
  const isAdmin = currentUser.role === 'admin' || currentUser.auth === 'All Group';

  let allTasks = getTasks().map(t => {
    if (t.status !== 'completed' && t.status !== 'closed' && t.dueDate < today) return {...t, status: 'overdue'};
    return t;
  });

  let tasksToShow = [];

  if (isAdmin) {
    tasksToShow = allTasks;
  } else {
    const emps = getEmployees();
    const myGroupMembers = emps.filter(e => e.group === currentUser.group).map(e => e.id);
    
    tasksToShow = allTasks.filter(t => {
      // 1. Same group?
      if (myGroupMembers.includes(t.assignedTo)) return true;
      
      // 2. Kumar N team Offermanagement task show in team Task of vandita also?
      if (currentUser.name.includes('Vanditha')) {
          if ((t.category === 'Offer Management' || t.category === 'Sourcing and Offer') && t.assignedTo === 7) return true;
      }

      // 3. Kumar N sees Offer Management tasks (including Vandita's)
      if (currentUser.name.includes('Kumar N')) {
          if (t.category === 'Offer Management' || getEmployee(t.assignedTo)?.group === 'Offer Management') return true;
      }
      
      // 4. In Ranjan Task show the Offer Mangement and SCM. Logistic task
      if (currentUser.name.includes('Ranjan')) {
          const scmOfferCats = ['Offer Management', 'SCM/Logistics', 'SCM', 'Offer', 'Logistics'];
          if (scmOfferCats.includes(t.category)) return true;
      }

      return false;
    });
  }

  // Apply group filter if not "all"
  if (filter !== 'all') {
    const matchingEmps = getEmployees().filter(e => e.group === filter || e.auth.includes(filter)).map(e => e.id);
    tasksToShow = tasksToShow.filter(t => matchingEmps.includes(t.assignedTo) || t.category === filter);
  }

  renderTasksView(tasksToShow, 'team-task-container', teamTaskView);
}

// ──────────────────────────────────────────
// MULTI-VIEW RENDERER
// ──────────────────────────────────────────
function renderTasksView(tasks, containerId, viewMode) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (tasks.length === 0 && viewMode !== 'list') {
    container.innerHTML = emptyState('No tasks found');
    return;
  }

  if (viewMode === 'list')               container.innerHTML = renderListView(tasks, containerId);
  else if (viewMode === 'kanban')        container.innerHTML = renderKanbanView(tasks);
  else if (viewMode === 'timeline')      container.innerHTML = renderTimelineView(tasks);
  else if (viewMode === 'calendar-tasks') container.innerHTML = renderMiniCalendar(tasks);
  else                                   container.innerHTML = renderKanbanView(tasks);
}

// ── LIST VIEW ──
// _allListTasks stores the base task set so inline filters can re-run sorting without re-fetching
let _listTaskCache = {};

function renderListView(tasks, containerId) {
  // Cache full task set keyed by container so inline filters can reuse it
  if (containerId) _listTaskCache[containerId] = tasks;

  // Unique teams from the task set
  const teams = [...new Set(
    tasks.map(t => getEmployee(t.assignedTo)?.group).filter(Boolean)
  )].sort();

  const filterBar = `
    <div class="list-filter-bar" id="lf-${containerId || 'default'}">
      <input
        type="text"
        class="list-search-input"
        placeholder="🔍 Search by name..."
        oninput="applyListFilters('${containerId}')"
        id="lf-name-${containerId}"
      />
      <select class="filter-select" onchange="applyListFilters('${containerId}')" id="lf-team-${containerId}">
        <option value="all">All Teams</option>
        ${teams.map(g => `<option value="${g}">${g}</option>`).join('')}
      </select>
      <select class="filter-select" onchange="applyListFilters('${containerId}')" id="lf-priority-${containerId}">
        <option value="all">All Priorities</option>
        <option value="high">🔴 High</option>
        <option value="medium">🟡 Medium</option>
        <option value="low">🟢 Low</option>
      </select>
      <select class="filter-select" onchange="applyListFilters('${containerId}')" id="lf-status-${containerId}">
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="overdue">Overdue</option>
      </select>
      <span class="list-count" id="lf-count-${containerId}">${tasks.length} tasks</span>
    </div>`;

  const rows = buildSortedListRows(tasks);
  return `${filterBar}<div class="list-view" id="lv-${containerId}">${rows}</div>`;
}

// Sort: pending first → high priority → due date asc
function sortListTasks(tasks) {
  const statusOrder = { overdue: 0, pending: 1, 'in-progress': 2, completed: 3, closed: 4 };
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...tasks].sort((a, b) => {
    const sA = statusOrder[a.status] ?? 4;
    const sB = statusOrder[b.status] ?? 4;
    if (sA !== sB) return sA - sB;
    const pA = priorityOrder[a.priority] ?? 3;
    const pB = priorityOrder[b.priority] ?? 3;
    if (pA !== pB) return pA - pB;
    return (a.dueDate || '').localeCompare(b.dueDate || '');
  });
}

function buildSortedListRows(tasks) {
  const sorted = sortListTasks(tasks);
  const today = new Date().toISOString().split('T')[0];
  const priorityColors = { high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--success)' };

  if (sorted.length === 0) {
    return `<div style="padding:32px;text-align:center;color:var(--text-muted);font-size:12px">No tasks match the current filters</div>`;
  }

  return sorted.map(t => {
    const assignee = getEmployee(t.assignedTo);
    const isOverdue = t.status !== 'completed' && t.status !== 'closed' && t.dueDate < today;
    const isDueToday = t.dueDate === today;
    const attachCount = t.attachments?.length || 0;
    return `<div class="list-item" onclick="openTaskModal('${t.id}')">
      <div class="list-item-priority" style="background:${priorityColors[t.priority]||'#ccc'}"></div>
      <div class="list-item-body">
        <div class="list-item-title">${t.title}
          ${t.priority === 'high' && t.status !== 'completed' && t.status !== 'closed' ? '<span class="list-urgent-tag">URGENT</span>' : ''}
        </div>
        <div class="list-item-sub">${t.category || 'General'}</div>
      </div>
      <div class="list-item-meta">
        <div class="list-item-assignee-wrap">
          <div class="user-avatar small" style="background:${assignee?.color||'#6366f1'}">${assignee ? initials(assignee.name) : '?'}</div>
          <span class="list-item-assignee">${assignee?.name || '?'}</span>
          <span class="list-item-team">${assignee?.group || ''}</span>
        </div>
        <span class="list-item-due ${isOverdue?'due-warning':isDueToday?'due-today':''}">
          📅 ${formatDate(t.dueDate)}${isOverdue?' ⚠':''}${isDueToday?' ⚡':''}
        </span>
        ${attachCount ? `<span class="list-attach-badge">📎 ${attachCount}</span>` : ''}
        <span class="badge badge-${t.status}">${statusLabel(t.status)}</span>
        <span class="badge badge-${t.priority}">${t.priority}</span>
      </div>
    </div>`;
  }).join('');
}

function applyListFilters(containerId) {
  const baseTasks = _listTaskCache[containerId] || [];
  const nameVal     = (document.getElementById(`lf-name-${containerId}`)?.value     || '').toLowerCase();
  const teamVal     = document.getElementById(`lf-team-${containerId}`)?.value     || 'all';
  const priorityVal = document.getElementById(`lf-priority-${containerId}`)?.value || 'all';
  const statusVal   = document.getElementById(`lf-status-${containerId}`)?.value   || 'all';

  let filtered = baseTasks;
  if (nameVal)            filtered = filtered.filter(t => {
    const assignee = getEmployee(t.assignedTo);
    return t.title.toLowerCase().includes(nameVal) ||
           (assignee?.name || '').toLowerCase().includes(nameVal);
  });
  if (teamVal !== 'all')     filtered = filtered.filter(t => (t.assignedTo === 'group:'+teamVal || getEmployee(t.assignedTo)?.group === teamVal));
  if (priorityVal !== 'all') filtered = filtered.filter(t => t.priority === priorityVal);
  if (statusVal !== 'all')   filtered = filtered.filter(t => t.status === statusVal);

  const lv = document.getElementById(`lv-${containerId}`);
  if (lv) lv.innerHTML = buildSortedListRows(filtered);

  const countEl = document.getElementById(`lf-count-${containerId}`);
  if (countEl) countEl.textContent = filtered.length + ' task' + (filtered.length !== 1 ? 's' : '');
}

// ── KANBAN VIEW ──
function renderKanbanView(tasks) {
  const cols = [
    { key: 'pending',     label: 'Pending',     color: 'var(--warning)' },
    { key: 'in-progress', label: 'In Progress',  color: 'var(--accent)' },
    { key: 'completed',   label: 'Completed',    color: 'var(--success)' },
    { key: 'overdue',     label: 'Overdue',      color: 'var(--danger)' }
  ];
  return `<div class="kanban-view">` + cols.map(col => {
    const colTasks = tasks.filter(t => t.status === col.key);
    const cards = colTasks.length === 0
      ? `<div style="padding:12px 8px;text-align:center;font-size:10px;color:var(--text-muted)">No tasks</div>`
      : colTasks.map(t => {
          const assignee = getEmployee(t.assignedTo);
          const today = new Date().toISOString().split('T')[0];
          const isOverdue = t.dueDate < today && t.status !== 'completed' && t.status !== 'closed';
          const isDueToday = t.dueDate === today;
          return `<div class="kanban-card priority-${t.priority}" onclick="openTaskModal('${t.id}')">
            <div class="kanban-card-title">${t.title}</div>
            <div class="kanban-card-meta">
              <div class="kanban-card-due ${isOverdue?'due-warning':isDueToday?'due-today':''}">  
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${formatDate(t.dueDate)}
              </div>
              <div class="kanban-card-avatar" style="background:${assignee?.color||'#6366f1'}">${assignee ? initials(assignee.name) : '?'}</div>
            </div>
          </div>`;
        }).join('');
    return `<div class="kanban-col">
      <div class="kanban-col-header">
        <div class="kanban-col-title">
          <span class="kanban-col-dot" style="background:${col.color}"></span>
          ${col.label}
        </div>
        <span class="kanban-col-count">${colTasks.length}</span>
      </div>
      <div class="kanban-cards">${cards}</div>
    </div>`;
  }).join('') + `</div>`;
}

// ── TIMELINE VIEW ──
function renderTimelineView(tasks) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  // Show 14-day window: 3 days before today to 11 days after
  const windowStart = new Date(today); windowStart.setDate(today.getDate() - 3);
  const windowEnd   = new Date(today); windowEnd.setDate(today.getDate() + 11);
  const totalDays   = 15;

  // Build day labels
  const dayLabels = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(windowStart); d.setDate(windowStart.getDate() + i);
    const dStr = d.toISOString().split('T')[0];
    const isToday = dStr === todayStr;
    dayLabels.push(`<div class="timeline-day-label ${isToday?'today-label':''}">${d.getDate()}<br><span style="font-size:8px">${['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()]}</span></div>`);
  }

  // today line position
  const todayIdx = Math.round((today - windowStart) / 86400000);
  const todayPct = (todayIdx / totalDays) * 100;

  const rows = tasks.map(t => {
    const start  = new Date(t.createdAt + 'T00:00:00');
    const end    = new Date(t.dueDate   + 'T00:00:00');
    const startPct = Math.max(0, ((start - windowStart) / 86400000 / totalDays) * 100);
    const endPct   = Math.min(100, ((end - windowStart + 86400000) / 86400000 / totalDays) * 100);
    const widthPct  = Math.max(2, endPct - startPct);
    const barCls = (t.status === 'completed' || t.status === 'closed') ? 'completed' : t.priority;
    return `<div class="timeline-row">
      <div class="timeline-task-label" title="${t.title}">${t.title}</div>
      <div class="timeline-bar-area">
        <div class="timeline-today-line" style="left:${todayPct}%"></div>
        <div class="timeline-bar ${barCls}" style="left:${startPct}%;width:${widthPct}%" onclick="openTaskModal('${t.id}')" title="${t.title}">
          ${widthPct > 15 ? t.title : ''}
        </div>
      </div>
    </div>`;
  }).join('');

  return `<div class="timeline-view">
    <div class="timeline-header-row">
      <div class="timeline-label-col">Task</div>
      <div class="timeline-days-row">${dayLabels.join('')}</div>
    </div>
    ${rows || '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px">No tasks in this window</div>'}
  </div>`;
}

// ── MINI CALENDAR VIEW (inline) ──
function renderMiniCalendar(tasks) {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.toISOString().split('T')[0];

  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(
    d => `<span style="text-align:center;font-size:10px;font-weight:700;color:var(--text-muted);padding:6px">${d}</span>`
  ).join('');

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += '<div></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dt  = tasks.filter(t => t.dueDate === ds);
    const isToday = ds === today;
    const evts = dt.slice(0,2).map(t => {
      const cls = (t.status === 'completed' || t.status === 'closed') ? 'completed' : t.priority;
      return `<div class="cal-event ${cls}" title="${t.title}">${t.title}</div>`;
    }).join('');
    cells += `<div class="cal-day ${isToday?'today':''} ${dt.length?'has-tasks':''}" onclick="${dt.length===1?`openTaskModal('${dt[0].id}')`:''}">
      <div class="day-num">${d}${dt.length>2?`<sub style="font-size:8px;color:var(--accent)">+${dt.length-2}</sub>`:''}</div>
      <div class="cal-events">${evts}</div>
    </div>`;
  }

  return `<div style="margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3 style="font-size:13px;font-weight:700;color:var(--text-primary)">${months[month]} ${year}</h3>
      <span style="font-size:11px;color:var(--text-muted)">${tasks.length} tasks this month</span>
    </div>
    <div style="overflow-x:auto">
      <div style="min-width:420px">
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:5px">${weekdays}</div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px">${cells}</div>
      </div>
    </div>
    <div class="cal-legend" style="margin-top:10px">
      <span class="legend-dot high"></span> High &nbsp;
      <span class="legend-dot medium"></span> Medium &nbsp;
      <span class="legend-dot low"></span> Low &nbsp;
      <span class="legend-dot completed"></span> Completed
    </div>
  </div>`;
}

function renderAllTasks() {
  filterAllTasks();
}

function setAllView(v) {
  allTaskView = v;
  document.querySelectorAll('#all-view-switcher .view-btn').forEach(b => b.classList.remove('active'));
  const map = { list:'all-view-list', kanban:'all-view-kanban', timeline:'all-view-timeline', 'calendar-tasks':'all-view-calendar' };
  const btn = document.getElementById(map[v]);
  if (btn) btn.classList.add('active');
  renderAllTasks();
}

function toggleAllSort(col) {
  if (allTasksSortCol === col) {
    allTasksSortDir *= -1;
  } else {
    allTasksSortCol = col;
    allTasksSortDir = 1;
  }
  
  const icons = ['id', 'title', 'assignedTo', 'assignedBy', 'category', 'priority', 'dueDate', 'status'];
  icons.forEach(i => {
    const el = document.getElementById('sort-icon-' + i);
    if(el) el.textContent = '';
  });
  const el = document.getElementById('sort-icon-' + col);
  if(el) el.textContent = allTasksSortDir === 1 ? ' ↓' : ' ↑';

  renderAllTasks();
}

function filterAllTasks() {
  const today = new Date().toISOString().split('T')[0];
  let tasks = getTasks().map(t => {
    if (t.status !== 'completed' && t.status !== 'closed' && t.dueDate < today) return {...t, status: 'overdue'};
    return t;
  });

  const fTitle = (document.getElementById('all-col-title')?.value || '').toLowerCase();
  const fAssignedTo = (document.getElementById('all-col-assignedTo')?.value || '').toLowerCase();
  const fAssignedBy = (document.getElementById('all-col-assignedBy')?.value || '').toLowerCase();
  const fCategory = document.getElementById('all-col-category')?.value || '';
  const fPriority = document.getElementById('all-col-priority')?.value || '';
  const fDueDate = document.getElementById('all-col-dueDate')?.value || '';
  const fStatus = document.getElementById('all-col-status')?.value || '';

  tasks = tasks.filter(t => {
    if (fTitle && !t.title.toLowerCase().includes(fTitle)) return false;
    if (fCategory && t.category !== fCategory) return false;
    if (fPriority && t.priority !== fPriority) return false;
    if (fDueDate && t.dueDate !== fDueDate) return false;
    if (fStatus && t.status !== fStatus) return false;

    if (fAssignedTo) {
      if (!getAssigneeName(t.assignedTo).toLowerCase().includes(fAssignedTo)) return false;
    }
    if (fAssignedBy) {
      const b = getEmployee(t.assignedBy);
      if (!b || !b.name.toLowerCase().includes(fAssignedBy)) return false;
    }
    return true;
  });

  tasks.sort((a, b) => {
    let valA, valB;
    if (allTasksSortCol === 'id') {
      valA = a.id; valB = b.id;
    } else if (allTasksSortCol === 'assignedTo') {
      valA = getAssigneeName(a.assignedTo).toLowerCase();
      valB = getAssigneeName(b.assignedTo).toLowerCase();
    } else if (allTasksSortCol === 'assignedBy') {
      valA = (getEmployee(a.assignedBy)?.name || '').toLowerCase();
      valB = (getEmployee(b.assignedBy)?.name || '').toLowerCase();
    } else {
      valA = (a[allTasksSortCol] || '').toLowerCase();
      valB = (b[allTasksSortCol] || '').toLowerCase();
    }
    
    if (valA < valB) return -1 * allTasksSortDir;
    if (valA > valB) return 1 * allTasksSortDir;
    return 0;
  });

  if (allTaskView === 'list') {
    document.getElementById('all-table-wrap').classList.remove('hidden');
    document.getElementById('all-other-views-wrap').classList.add('hidden');
    
    const tbody = document.getElementById('all-tasks-body');
    if (tasks.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted)">No tasks found matching filters</td></tr>`;
      return;
    }
    tbody.innerHTML = tasks.map((t, i) => {
      const assignee  = getEmployee(t.assignedTo);
      const assigner  = getEmployee(t.assignedBy);
      const isDue  = t.dueDate === today;
      const isOver = t.status === 'overdue';
      return `
        <tr onclick="openTaskModal('${t.id}')">
          <td data-label="#">${i+1}</td>
          <td data-label="Title"><strong>${t.title}</strong></td>
          <td data-label="Assigned To">
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:6px">
              <div class="user-avatar small" style="background:${assignee?.color || '#6366f1'};font-size:10px">
                ${assignee ? initials(assignee.name) : '?'}
              </div>
              ${assignee?.name || 'Unknown'}
            </div>
          </td>
          <td data-label="Assigned By">${assigner?.name || 'Unknown'}</td>
          <td data-label="Category"><span style="font-size:12px">${t.category || 'General'}</span></td>
          <td data-label="Priority"><span class="badge badge-${t.priority}">${t.priority}</span></td>
          <td data-label="Due Date" class="${isOver ? 'due-warning' : isDue ? 'due-today' : ''}">${formatDate(t.dueDate)}</td>
          <td data-label="Status"><span class="badge badge-${t.status}">${statusLabel(t.status)}</span></td>
          <td data-label="Actions" onclick="event.stopPropagation()">
            <div class="table-actions" style="display:flex;justify-content:flex-end">
              <button class="btn-primary" style="padding:5px 10px;font-size:11px" onclick="openTaskModal('${t.id}')">View</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } else {
    document.getElementById('all-table-wrap').classList.add('hidden');
    document.getElementById('all-other-views-wrap').classList.remove('hidden');
    renderTasksView(tasks, 'all-other-views-wrap', allTaskView);
  }
}

// ──────────────────────────────────────────
// TEAM MANAGEMENT
// ──────────────────────────────────────────
function renderTeamMgmt() {
  filterTeamMgmt();
}

function filterTeamMgmt() {
  const filter = document.getElementById('team-group-filter').value;
  let emps = getEmployees();
  if (filter !== 'all') {
    emps = getEmployees().filter(e => e.group === filter || e.designation.includes(filter) || e.auth.includes(filter));
  }

  const tasks = getTasks();
  const grid = document.getElementById('team-grid');
  const isAdmin = currentUser.role === 'admin' || currentUser.id === 1;

  grid.innerHTML = emps.map(emp => {
    const empTasks = tasks.filter(t => t.assignedTo === emp.id);
    const done = empTasks.filter(t => t.status === 'completed' || t.status === 'closed').length;
    const pending = empTasks.filter(t => t.status !== 'completed' && t.status !== 'closed').length;

    const editBtn = isAdmin ? `<button class="btn-ghost" style="position:absolute;top:10px;right:10px;font-size:11px;padding:4px 8px" onclick="openEditProfile(${emp.id})">Edit</button>` : '';

    return `
      <div class="team-card" style="position:relative">
        ${editBtn}
        <div class="user-avatar" style="width:48px;height:48px;font-size:18px;background:${emp.color};flex-shrink:0">
          ${initials(emp.name)}
        </div>
        <div class="team-card-info">
          <div class="team-card-name">${emp.name} <span style="font-size:10px;color:var(--text-muted);font-weight:normal;margin-left:4px">(${emp.empId || ''})</span></div>
          <div class="team-card-desig">${emp.designation}</div>
          <div class="team-card-detail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
            <span>${emp.email}</span>
          </div>
          <div class="team-card-detail" style="display:flex;align-items:center;gap:6px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <a href="tel:${emp.mobile}" style="color:inherit;text-decoration:none">${emp.mobile}</a>
            ${emp.mobile ? `<a href="https://wa.me/91${emp.mobile}" target="_blank" style="color:#16a34a;display:inline-flex;padding:2px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></a>` : ''}
          </div>
          <div style="display:flex;gap:6px;margin-top:6px;align-items:center;flex-wrap:wrap">
            <div class="team-card-group">${emp.group}</div>
            <span style="font-size:11px;color:var(--text-muted)">
              ${done}✓ ${pending} open
            </span>
          </div>
          <div class="team-card-auth">Auth: ${emp.auth}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ──────────────────────────────────────────
// EDIT PROFILE (Admin Only)
// ──────────────────────────────────────────
let editingEmpId = null;

function openEditProfile(id) {
  const emp = getEmployee(id);
  if (!emp) return;
  editingEmpId = id;

  document.getElementById('edit-prof-id').value = emp.empId || '';
  document.getElementById('edit-prof-name').value = emp.name || '';
  document.getElementById('edit-prof-desig').value = emp.designation || '';
  document.getElementById('edit-prof-email').value = emp.email || '';
  document.getElementById('edit-prof-mobile').value = emp.mobile || '';
  document.getElementById('edit-prof-group').value = emp.group || '';
  document.getElementById('edit-prof-auth').value = emp.auth || '';

  document.getElementById('edit-profile-modal').classList.remove('hidden');
}

function closeEditProfile() {
  document.getElementById('edit-profile-modal').classList.add('hidden');
  editingEmpId = null;
}

function submitEditProfile(e) {
  e.preventDefault();
  if (!editingEmpId) return;

  const emps = getEmployees();
  const idx = emps.findIndex(e => e.id === editingEmpId);
  if (idx === -1) return;

  emps[idx].empId = document.getElementById('edit-prof-id').value.trim();
  emps[idx].name = document.getElementById('edit-prof-name').value.trim();
  emps[idx].designation = document.getElementById('edit-prof-desig').value.trim();
  emps[idx].email = document.getElementById('edit-prof-email').value.trim();
  emps[idx].mobile = document.getElementById('edit-prof-mobile').value.trim();
  emps[idx].group = document.getElementById('edit-prof-group').value.trim();
  emps[idx].auth = document.getElementById('edit-prof-auth').value.trim();

  saveEmployees(emps);
  showToast('✓ Profile updated successfully', 'success');
  closeEditProfile();
  renderTeamMgmt();
}


// ──────────────────────────────────────────
// ASSIGN TASK
// ──────────────────────────────────────────
function setDefaultDueDate() {
  const inp = document.getElementById('task-due');
  if (!inp.value) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    inp.value = tomorrow.toISOString().split('T')[0];
  }
}

function submitTask(e) {
  e.preventDefault();
  const tasks = getTasks();
  const newTask = {
    id: 't' + Date.now(),
    title: document.getElementById('task-title').value.trim(),
    description: document.getElementById('task-desc').value.trim(),
    assignedTo: document.getElementById('task-assignee').value.startsWith('group:') ? document.getElementById('task-assignee').value : parseInt(document.getElementById('task-assignee').value),
    assignedBy: currentUser.id,
    category: document.getElementById('task-category').value,
    priority: document.getElementById('task-priority').value,
    status: 'pending',
    dueDate: document.getElementById('task-due').value,
    dueTime: document.getElementById('task-time').value,
    createdAt: new Date().toISOString().split('T')[0],
    remarks: document.getElementById('task-remarks').value.trim(),
    updates: [],
    attachments: [...pendingAttachments]
  };

  tasks.push(newTask);
  saveTasks(tasks);

  showToast('✓ Task assigned successfully!', 'success');
  clearForm();
  showSection('team-tasks');
}

let pendingAttachments = []; // { name, size, type, ext, data (base64) }

function clearForm() {
  document.getElementById('assign-form').reset();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('task-due').value = tomorrow.toISOString().split('T')[0];
  document.getElementById('task-time').value = '17:00';
  // Reset attachments
  pendingAttachments = [];
  const preview = document.getElementById('attach-preview');
  if (preview) preview.innerHTML = '';
}

// ──────────────────────────────────────────
// ATTACHMENT HANDLERS
// ──────────────────────────────────────────
function getFileExt(name) {
  const parts = name.toLowerCase().split('.');
  return parts[parts.length - 1] || 'file';
}
function getIconClass(ext) {
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return 'img';
  if (ext === 'pdf')  return 'pdf';
  if (['doc','docx'].includes(ext)) return 'doc';
  if (['xls','xlsx','csv'].includes(ext)) return 'xls';
  if (['zip','rar','7z'].includes(ext)) return 'zip';
  if (ext === 'txt')  return 'txt';
  return 'file';
}
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

function handleFileSelect(e) {
  processFiles(Array.from(e.target.files));
  // Reset input so same file can be re-selected
  e.target.value = '';
}

function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('attach-dropzone').classList.add('dragover');
}
function handleDragLeave(e) {
  document.getElementById('attach-dropzone').classList.remove('dragover');
}
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('attach-dropzone').classList.remove('dragover');
  processFiles(Array.from(e.dataTransfer.files));
}

function processFiles(files) {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  files.forEach(file => {
    if (file.size > MAX_SIZE) {
      showToast(`⚠ ${file.name} exceeds 5MB limit`, 'error');
      return;
    }
    if (pendingAttachments.length >= 8) {
      showToast('⚠ Maximum 8 attachments per task', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const att = {
        id: 'a' + Date.now() + Math.random().toString(36).slice(2,5),
        name: file.name,
        size: file.size,
        type: file.type,
        ext: getFileExt(file.name),
        data: ev.target.result  // base64 data URL
      };
      pendingAttachments.push(att);
      renderAttachmentPreview();
    };
    reader.readAsDataURL(file);
  });
}

function renderAttachmentPreview() {
  const preview = document.getElementById('attach-preview');
  if (!preview) return;
  preview.innerHTML = pendingAttachments.map(att => {
    const iconCls = getIconClass(att.ext);
    return `<div class="attach-chip" id="chip-${att.id}">
      <div class="attach-chip-icon ${iconCls}">${att.ext.toUpperCase().slice(0,3)}</div>
      <span class="attach-chip-name" title="${att.name}">${att.name}</span>
      <span class="attach-chip-size">${formatFileSize(att.size)}</span>
      <button class="attach-chip-remove" onclick="removeAttachment('${att.id}')" title="Remove">✕</button>
    </div>`;
  }).join('');
}

function removeAttachment(id) {
  pendingAttachments = pendingAttachments.filter(a => a.id !== id);
  renderAttachmentPreview();
}

// ──────────────────────────────────────────
// TASK MODAL
// ──────────────────────────────────────────
let currentOpenTaskId = null;

function openTaskModal(taskId) {
  currentOpenTaskId = taskId;
  const tasks = getTasks();
  const today = new Date().toISOString().split('T')[0];
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const assignee = getEmployee(task.assignedTo);
  const assigner = getEmployee(task.assignedBy);
  const isOverdue = task.status !== 'completed' && task.status !== 'closed' && task.dueDate < today;
  const effectiveStatus = isOverdue ? 'overdue' : task.status;

  const isSameGroup = currentUser.group && assignee && currentUser.group === assignee.group && currentUser.group !== '';
  const canUpdate = task.assignedTo === currentUser.id || isSameGroup || currentUser.role === 'admin' || currentUser.auth === 'All Group';
  const canEdit = task.assignedBy === currentUser.id;
  let headerHtml = `<h3 id="modal-task-title" style="flex:1;word-break:break-word">${task.title}</h3>`;
  if (canEdit) {
    headerHtml += `<button onclick="openEditTaskModal('${task.id}')" class="btn-ghost" style="margin-right:10px;padding:4px 8px;font-size:11px">✎ Edit</button>`;
  }
  headerHtml += `<button onclick="closeModal()" class="modal-close">✕</button>`;
  document.querySelector('#task-modal .modal-header').innerHTML = headerHtml;

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-badges-row">
      <span class="badge badge-${effectiveStatus}">${statusLabel(effectiveStatus)}</span>
      <span class="badge badge-${task.priority}">${task.priority} Priority</span>
      <span class="badge" style="background:rgba(59,130,246,0.15);color:#60a5fa;border-color:rgba(59,130,246,0.3)">${task.category || 'General'}</span>
    </div>

    ${task.description ? `
    <div class="modal-section">
      <div class="modal-section-label">Description</div>
      <div class="modal-section-value">${task.description}</div>
    </div>` : ''}

    <div class="modal-detail-row">
      <span class="modal-detail-label">Assigned To</span>
      <span class="modal-detail-value">${getAssigneeLabelHtml(task.assignedTo)}</span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-label">Assigned By</span>
      <span class="modal-detail-value">${assigner?.name || 'Unknown'}</span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-label">Due Date</span>
      <span class="modal-detail-value ${isOverdue ? 'due-warning' : task.dueDate === today ? 'due-today' : ''}">
        ${formatDateLong(task.dueDate)} ${task.dueTime ? 'at ' + task.dueTime : ''}
        ${isOverdue ? ' ⚠ Overdue' : task.dueDate === today ? ' ⚡ Due Today' : ''}
      </span>
    </div>
    <div class="modal-detail-row">
      <span class="modal-detail-label">Created</span>
      <span class="modal-detail-value">${formatDate(task.createdAt)}</span>
    </div>
    ${canUpdate ? `
    <div class="modal-detail-row" style="flex-direction:column;align-items:flex-start;gap:6px">
      <span class="modal-detail-label">Remarks / Response</span>
      <textarea id="modal-task-remarks" style="width:100%;padding:8px;font-size:12px;border:1px solid #dde1ef;border-radius:5px;font-family:inherit" rows="2" placeholder="Add response or remarks...">${task.remarks || ''}</textarea>
      <button class="btn-ghost" style="padding:4px 8px;font-size:11px" onclick="saveTaskRemarks('${task.id}')">Save Remarks</button>
    </div>` : (task.remarks ? `
    <div class="modal-detail-row">
      <span class="modal-detail-label">Remarks</span>
      <span class="modal-detail-value">${task.remarks}</span>
    </div>` : '')}

    ${task.updates && task.updates.length > 0 ? `
    <div class="modal-section">
      <div class="modal-section-label">Updates</div>
      <div class="task-timeline">
        ${task.updates.map(u => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div>
              <div class="timeline-text">${u.text}</div>
              <div class="timeline-time">${u.time}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>` : ''}

    ${task.attachments && task.attachments.length > 0 ? `
    <div class="modal-section">
      <div class="modal-section-label">Attachments (${task.attachments.length})</div>
      <div class="modal-attachments">
        ${task.attachments.map(att => {
          const iconCls = getIconClass(att.ext || getFileExt(att.name));
          return `<a class="modal-attach-item" href="${att.data}" download="${att.name}" onclick="event.stopPropagation()" title="Download ${att.name}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            ${att.name}
            <span style="color:var(--text-muted);font-size:9px">${formatFileSize(att.size)}</span>
          </a>`;
        }).join('')}
      </div>
    </div>` : ''}
  `;

  // Status actions
  const isAssigner = task.assignedBy === currentUser.id;

  const statusArea = document.getElementById('status-update-area');
  let btns = '';
  if (canUpdate && task.status !== 'completed' && task.status !== 'closed') {
    if (task.status === 'pending') {
      btns += `<button class="btn-primary" onclick="updateTaskStatus('${task.id}','in-progress')">▶ Start Task</button>`;
    }
    if (task.status === 'in-progress' || task.status === 'pending') {
      btns += `<button class="btn-primary btn-success" onclick="updateTaskStatus('${task.id}','completed')">✓ Mark Complete</button>`;
    }
  } else if (task.status === 'completed') {
    if (isAssigner || currentUser.role === 'admin') {
      btns += `<span style="color:var(--success);font-size:13px;font-weight:600;margin-right:10px;display:flex;align-items:center">Task Marked Complete</span>`;
      btns += `<button class="btn-primary" style="background:#4b5563;border:none;box-shadow:0 4px 15px rgba(75,85,99,0.3)" onclick="updateTaskStatus('${task.id}','closed')">🔒 Approve & Close Cycle</button>`;
    } else {
      btns += `<span style="color:var(--success);font-size:13px;font-weight:600;margin-right:10px;display:flex;align-items:center">✓ Waiting for Approval</span>`;
    }
  } else if (task.status === 'closed') {
    btns += `<span style="color:#4b5563;font-size:13px;font-weight:600;margin-right:10px;display:flex;align-items:center">🔒 Cycle Closed</span>`;
  }

  if (assignee) {
    const waMsg = `Task: *${task.title}*\nDue: ${formatDate(task.dueDate)}\nStatus: ${task.status}`;
    const emMsg = `Task: ${task.title}\nDue: ${formatDate(task.dueDate)}\nStatus: ${task.status}`;
    if (assignee.mobile) {
      btns += `<a href="https://wa.me/91${assignee.mobile}?text=${encodeURIComponent(waMsg)}" target="_blank" class="btn-ghost" style="padding:6px 10px;font-size:11px;color:#16a34a;border-color:#16a34a;text-decoration:none;display:inline-flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> WhatsApp</a>`;
    }
    if (assignee.email) {
      btns += `<a href="mailto:${assignee.email}?subject=${encodeURIComponent('Task: ' + task.title)}&body=${encodeURIComponent(emMsg)}" class="btn-ghost" style="padding:6px 10px;font-size:11px;color:#2563eb;border-color:#2563eb;text-decoration:none;display:inline-flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,12 2,6"></polyline></svg> Email</a>`;
    }
  }

  statusArea.innerHTML = btns;

  document.getElementById('task-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('task-modal').classList.add('hidden');
  document.body.style.overflow = '';
  currentOpenTaskId = null;
}

// ──────────────────────────────────────────
// EDIT TASK FUNCTIONALITY
// ──────────────────────────────────────────
let editingTaskId = null;

function openEditTaskModal(id) {
  closeModal();
  const task = getTasks().find(t => t.id === id);
  if (!task) return;
  editingTaskId = id;
  
  document.getElementById('edit-task-title').value = task.title;
  document.getElementById('edit-task-desc').value = task.description || '';
  
  const assigneeSel = document.getElementById('edit-task-assignee');
  assigneeSel.innerHTML = '<option value="">Select Assignee</option>';
  const groups = [...new Set(getEmployees().map(e => e.group).filter(Boolean))];
  const grpGroup = document.createElement('optgroup'); grpGroup.label = '── GROUPS ──';
  groups.forEach(g => { const o = document.createElement('option'); o.value = 'group:'+g; o.textContent = 'Team: '+g; grpGroup.appendChild(o); });
  assigneeSel.appendChild(grpGroup);
  const eGroup = document.createElement('optgroup'); eGroup.label = '── EMPLOYEES ──';
  getEmployees().forEach(e => { const o = document.createElement('option'); o.value = e.id; o.textContent = `${e.name} (${e.designation})`; eGroup.appendChild(o); });
  assigneeSel.appendChild(eGroup);
  assigneeSel.value = task.assignedTo || '';
  
  document.getElementById('edit-task-due').value = task.dueDate || '';
  document.getElementById('edit-task-priority').value = task.priority || 'medium';
  document.getElementById('edit-task-category').value = task.category || 'General';

  document.getElementById('edit-task-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeEditTask() {
  document.getElementById('edit-task-modal').classList.add('hidden');
  document.body.style.overflow = '';
  editingTaskId = null;
}

function submitEditTask(e) {
  e.preventDefault();
  if(!editingTaskId) return;
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === editingTaskId);
  if(idx === -1) return;

  tasks[idx].title = document.getElementById('edit-task-title').value.trim();
  tasks[idx].description = document.getElementById('edit-task-desc').value.trim();
  const ev = document.getElementById('edit-task-assignee').value; tasks[idx].assignedTo = ev.startsWith('group:') ? ev : parseInt(ev);
  tasks[idx].dueDate = document.getElementById('edit-task-due').value;
  tasks[idx].priority = document.getElementById('edit-task-priority').value;
  tasks[idx].category = document.getElementById('edit-task-category').value;
  
  saveTasks(tasks);
  showToast('✓ Task updated successfully', 'success');
  closeEditTask();
  
  if (activeSection === 'dashboard') renderDashboard();
  else if (activeSection === 'my-tasks') renderMyTasks();
  else if (activeSection === 'team-tasks') renderTeamTasks();
  else if (activeSection === 'all-tasks') renderAllTasks();
  else if (activeSection === 'calendar') renderCalendar();
  
  openTaskModal(editingTaskId); // Re-open task modal to see changes
}

function updateTaskStatus(taskId, newStatus) {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return;
  tasks[idx].status = newStatus;
  tasks[idx].updates = tasks[idx].updates || [];
  tasks[idx].updates.push({
    text: 'Status changed to ' + statusLabel(newStatus) + ' by ' + currentUser.name,
    time: new Date().toLocaleString('en-IN')
  });
  saveTasks(tasks);
  showToast('Task updated to ' + statusLabel(newStatus), 'success');
  openTaskModal(taskId);

  // Re-render current section
  if (activeSection === 'dashboard') renderDashboard();
  else if (activeSection === 'my-tasks') renderMyTasks();
  else if (activeSection === 'team-tasks') renderTeamTasks();
  else if (activeSection === 'all-tasks') renderAllTasks();
}

function saveTaskRemarks(taskId) {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return;
  const val = document.getElementById('modal-task-remarks').value.trim();
  tasks[idx].remarks = val;
  tasks[idx].updates = tasks[idx].updates || [];
  tasks[idx].updates.push({
    text: 'Remarks updated by ' + currentUser.name,
    time: new Date().toLocaleString('en-IN')
  });
  saveTasks(tasks);
  showToast('Remarks saved', 'success');
  openTaskModal(taskId);
}

function deleteTask(taskId) {
  if (!confirm('Delete this task permanently?')) return;
  const tasks = getTasks().filter(t => t.id !== taskId);
  saveTasks(tasks);
  showToast('Task deleted', 'info');
  renderAllTasks();
}

// ──────────────────────────────────────────
// NOTIFICATIONS
// ──────────────────────────────────────────
function buildNotifications(tasks) {
  const today = new Date().toISOString().split('T')[0];
  const notifs = [];

  tasks.filter(t => t.status !== 'completed' && t.status !== 'closed' && t.dueDate < today)
    .forEach(t => notifs.push({ title: '⚠ Overdue: ' + t.title, sub: 'Was due ' + formatDate(t.dueDate) }));

  tasks.filter(t => t.dueDate === today && t.status !== 'completed' && t.status !== 'closed')
    .forEach(t => notifs.push({ title: '⚡ Due Today: ' + t.title, sub: 'Due by ' + (t.dueTime || 'EOD') }));

  const badge = document.getElementById('notif-badge');
  badge.textContent = notifs.length;
  badge.style.display = notifs.length > 0 ? 'flex' : 'none';

  const list = document.getElementById('notif-list');
  if (notifs.length === 0) {
    list.innerHTML = '<div class="notif-item"><div class="notif-item-sub">All clear! No urgent tasks.</div></div>';
  } else {
    list.innerHTML = notifs.slice(0, 5).map(n =>
      `<div class="notif-item">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-sub">${n.sub}</div>
      </div>`
    ).join('');
  }
}

function toggleNotifications() {
  const dd = document.getElementById('notif-dropdown');
  dd.classList.toggle('hidden');
}
function closeNotifications() {
  document.getElementById('notif-dropdown').classList.add('hidden');
}

// Close notifications on click outside
document.addEventListener('click', (e) => {
  const btn = document.getElementById('notif-btn');
  const dd  = document.getElementById('notif-dropdown');
  if (btn && !btn.contains(e.target) && dd && !dd.contains(e.target)) {
    dd.classList.add('hidden');
  }
});

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────
function getVisibleTasks() {
  const today = new Date().toISOString().split('T')[0];
  const isAdmin = currentUser.role === 'admin' || currentUser.auth === 'All Group';
  let tasks = getTasks();

  if (dashboardScope === 'toMe') {
    tasks = tasks.filter(t => t.assignedTo === currentUser.id || t.assignedTo === 'group:' + currentUser.group);
  } else if (dashboardScope === 'byMe') {
    tasks = tasks.filter(t => t.assignedBy === currentUser.id);
  } else if (dashboardScope === 'team') {
    const emps = getEmployees();
    const myGroupMembers = emps.filter(e => e.group === currentUser.group).map(e => e.id);
    tasks = tasks.filter(t => myGroupMembers.includes(t.assignedTo) || t.assignedTo === 'group:' + currentUser.group);
  } else {
    // 'all'
    if (!isAdmin) {
      const myGroupIds = getEmployees().filter(e => e.group === currentUser.group).map(e => e.id);
      tasks = tasks.filter(t =>
        (t.assignedTo === currentUser.id || t.assignedTo === 'group:' + currentUser.group) ||
        t.assignedBy === currentUser.id ||
        myGroupIds.includes(t.assignedTo)
      );
    }
  }

  return tasks.map(t => {
    if (t.status !== 'completed' && t.status !== 'closed' && t.dueDate < today) return {...t, status: 'overdue'};
    return t;
  });
}

function taskCard(task) {
  const assignee = getEmployee(task.assignedTo);
  const assigner = getEmployee(task.assignedBy);
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = task.status !== 'completed' && task.status !== 'closed' && task.dueDate < today;
  const isDueToday = task.dueDate === today;
  const effectiveStatus = isOverdue ? 'overdue' : task.status;

  const progressPct = effectiveStatus === 'completed' ? 100 : effectiveStatus === 'in-progress' ? 55 : effectiveStatus === 'overdue' ? 100 : 0;
  const progressCls = effectiveStatus === 'completed' ? 'complete' : effectiveStatus === 'in-progress' ? 'inprogress' : effectiveStatus === 'overdue' ? 'overdue' : 'pending';

  return `
    <div class="task-card priority-${task.priority}" onclick="openTaskModal('${task.id}')">
      <div class="task-card-header">
        <div class="task-card-title">${task.title}</div>
        <span class="badge badge-${task.priority}">${task.priority}</span>
      </div>
      ${task.description ? `<div class="task-card-desc">${task.description}</div>` : ''}
      <div class="task-card-meta">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span class="${isOverdue ? 'due-warning' : isDueToday ? 'due-today' : ''}">
          ${isOverdue ? '⚠ ' : isDueToday ? '⚡ ' : ''}${formatDate(task.dueDate)}
        </span>
        &nbsp;•&nbsp;
        <span>${task.category || 'General'}</span>
      </div>
      <div class="task-progress">
        <div class="progress-bar">
          <div class="progress-fill ${progressCls}" style="width:${progressPct}%"></div>
        </div>
      </div>
      <div class="task-card-footer">
        <div class="task-assignee">
          <div class="user-avatar small" style="background:${assignee?.color || '#6366f1'}">
            ${assignee ? initials(assignee.name) : '?'}
          </div>
          <span>${assignee?.name || 'Unknown'}</span>
        </div>
        <span class="badge badge-${effectiveStatus}">${statusLabel(effectiveStatus)}</span>
      </div>
    </div>
  `;
}

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getAssigneeName(id) {
  if (typeof id === 'string' && id.startsWith('group:')) return 'Team: ' + id.replace('group:', '');
  const emp = getEmployee(id);
  return emp ? emp.name : 'Unknown';
}

function getAssigneeLabelHtml(id) {
  if (typeof id === 'string' && id.startsWith('group:')) {
    return `<div style="display:flex;align-items:center;gap:8px">
      <div class="user-avatar small" style="background:#4b5563">G</div>
      Team: ${id.replace('group:', '')}
    </div>`;
  }
  const emp = getEmployee(id);
  return `<div style="display:flex;align-items:center;gap:8px">
    <div class="user-avatar small" style="background:${emp ? emp.color : '#ccc'}">
      ${emp ? initials(emp.name) : '?'}
    </div>
    ${emp ? emp.name : 'Unknown'} ${emp && emp.designation ? '– ' + emp.designation : ''}
  </div>`;
}

function statusLabel(s) {
  const labels = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'completed': 'Completed', 'closed': 'Closed',
    'overdue': 'Overdue'
  };
  return labels[s] || s;
}

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateLong(d) {
  if (!d) return '—';
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function emptyState(msg) {
  return `<div class="empty-state">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
    <p>${msg}</p>
  </div>`;
}

// ──────────────────────────────────────────
// TOAST
// ──────────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(100%)'; el.style.transition = '0.3s'; setTimeout(() => el.remove(), 300); }, 3000);
}

// ──────────────────────────────────────────
// INIT — waits for Supabase data
// ──────────────────────────────────────────
function _appInit() {
  // Check session
  const saved = localStorage.getItem('skc_current_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      enterApp();
    } catch(e) {
      localStorage.removeItem('skc_current_user');
    }
  }
}

// data.js fires 'dataReady' after Supabase/localStorage loads
window.addEventListener('dataReady', _appInit);
// Also handle case where dataReady fires before this script loads
window.addEventListener('DOMContentLoaded', () => {
  // If data was already ready before we attached the listener
  if (window._dataAlreadyReady) _appInit();
});

// Modal close on overlay click
document.getElementById('task-modal')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// Refresh UI when data dynamically updates from Supabase
window.addEventListener('dataSyncComplete', () => {
  if (activeSection === 'dashboard') renderDashboard();
  else if (activeSection === 'my-tasks') renderMyTasks();
  else if (activeSection === 'team-tasks') renderTeamTasks();
  else if (activeSection === 'all-tasks') renderAllTasks();
  else if (activeSection === 'calendar') {
     if (typeof renderCalendar === 'function') renderCalendar();
  }
  else if (activeSection === 'team-mgmt') renderTeamMgmt();

  if (currentOpenTaskId && !document.getElementById('task-modal').classList.contains('hidden')) {
    openTaskModal(currentOpenTaskId);
  }
});