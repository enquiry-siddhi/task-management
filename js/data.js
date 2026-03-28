// ============================================
// DATA.JS — Supabase Backend + Local Cache
// Project: Task Management (ihsogkyivbgdjgoyxhyv)
// ============================================

const SUPABASE_URL  = 'https://ihsogkyivbgdjgoyxhyv.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_xdOd2oJZDIYWm2bzWcslfg_CbT0SvyA';

let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  if (window.supabase && window.supabase.createClient) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _supabase;
}

// ─── In-memory cache ─────────────────────────
let _tasksCache    = null;
let _employeesCache = null;

// ─── Seed Employees ────────────────────────────
const SEED_EMPLOYEES = [
  {
    id: 1, slNo: 1, empId: 'ADM-001',
    name: 'Gurudatta', designation: 'Director',
    email: 'guru@siddhikabel.com', mobile: '9620209346',
    group: 'Admin', auth: 'All Group',
    password: 'siddhi123', role: 'admin', color: '#6366f1'
  },
  {
    id: 2, slNo: 2, empId: 'EMP-002',
    name: 'D C Venugopal', designation: 'Sales',
    email: 'dcvenu@siddhikabel.com', mobile: '8095501598',
    group: 'Sales', auth: 'Sales team',
    password: 'siddhi123', role: 'manager', color: '#10b981'
  },
  {
    id: 3, slNo: 3, empId: 'EMP-003',
    name: 'Giridhar', designation: 'Sales',
    email: 'Giridhar@siddhikabel.com', mobile: '7829111594',
    group: 'Sales', auth: 'Sales team',
    password: 'siddhi123', role: 'member', color: '#3b82f6'
  },
  {
    id: 4, slNo: 4, empId: 'EMP-004',
    name: 'Veeresh', designation: 'Sales',
    email: 'veeresh@siddhikabel.com', mobile: '9606719185',
    group: 'Sales', auth: 'Sales team',
    password: 'siddhi123', role: 'member', color: '#f59e0b'
  },
  {
    id: 5, slNo: 5, empId: 'EMP-005',
    name: 'Purushothama', designation: 'Accounts',
    email: 'accounts1@siddhikabel.com', mobile: '9741002071',
    group: 'Accounts', auth: 'Accounts',
    password: 'siddhi123', role: 'manager', color: '#ec4899'
  },
  {
    id: 6, slNo: 6, empId: 'EMP-006',
    name: 'Nanditha', designation: 'Accounts',
    email: 'accounts2@siddhikabel.com', mobile: '9535818083',
    group: 'Accounts', auth: 'Accounts',
    password: 'siddhi123', role: 'member', color: '#14b8a6'
  },
  {
    id: 7, slNo: 7, empId: 'EMP-007',
    name: 'Kumar N', designation: 'Admin / C',
    email: 'sales@siddhikabel.com', mobile: '7259662678',
    group: 'Admin', auth: 'Offer Management and Admin',
    password: 'siddhi123', role: 'manager', color: '#a78bfa'
  },
  {
    id: 8, slNo: 8, empId: 'EMP-008',
    name: 'Vanditha', designation: 'Offer Management',
    email: 'enquiry@siddhikabel.com', mobile: '8088288602',
    group: 'Offer Management', auth: 'Offer Management',
    password: 'siddhi123', role: 'manager', color: '#f97316'
  },
  {
    id: 9, slNo: 9, empId: 'EMP-009',
    name: 'Mohan', designation: 'SCM / Log',
    email: 'sales2@siddhikabel.com', mobile: '9742193023',
    group: 'SCM', auth: 'SCM / Logistic',
    password: 'siddhi123', role: 'member', color: '#06b6d4'
  },
  {
    id: 10, slNo: 10, empId: 'EMP-010',
    name: 'Geetha', designation: 'SCM / Log',
    email: 'admin@siddhikabel.com', mobile: '9611235461',
    group: 'SCM', auth: 'SCM / Logistic / Customer Complaint',
    password: 'siddhi123', role: 'manager', color: '#84cc16'
  },
  {
    id: 11, slNo: 11, empId: 'EMP-011',
    name: 'Rachana', designation: 'SCM',
    email: 'sales3@siddhikabel.com', mobile: '8904469598',
    group: 'SCM', auth: 'SCM',
    password: 'siddhi123', role: 'member', color: '#f43f5e'
  },
  {
    id: 12, slNo: 12, empId: 'EMP-012',
    name: 'Ranjan', designation: 'SCM/Offer',
    email: 'Info@siddhikabel.com', mobile: '9739138919',
    group: 'SCM/Offer', auth: 'SCM/Offer management',
    password: 'siddhi123', role: 'member', color: '#8b5cf6'
  }
];

function getTodayOffset(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
}

const SEED_TASKS = [];

// ─── Core CRUD ─────────────────────────────────

function getTasks() {
  return _tasksCache || [];
}

function saveTasks(tasks) {
  _tasksCache = tasks;
  // Write to localStorage as fallback
  localStorage.setItem('skc_tasks', JSON.stringify(tasks));
  // Sync to Supabase async (non-blocking)
  _syncTasksToSupabase(tasks);
}

function getEmployees() {
  return _employeesCache || [];
}

function saveEmployees(emps) {
  _employeesCache = emps;
  localStorage.setItem('skc_employees', JSON.stringify(emps));
  _syncEmployeesToSupabase(emps);
}

function getEmployee(id) {
  return (_employeesCache || []).find(e => e.id === id);
}

// ─── Supabase Sync ─────────────────────────────

async function _syncTasksToSupabase(tasks) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    // Upsert all tasks as rows: id=task.id, data=task object
    const rows = tasks.map(t => ({ id: t.id, data: t }));
    await sb.from('tasks').upsert(rows, { onConflict: 'id' });
  } catch (err) {
    console.warn('[Supabase] Task sync error:', err.message);
  }
}

async function _syncEmployeesToSupabase(emps) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const rows = emps.map(e => ({ id: e.id, data: e }));
    await sb.from('employees').upsert(rows, { onConflict: 'id' });
  } catch (err) {
    console.warn('[Supabase] Employee sync error:', err.message);
  }
}

async function deleteTaskFromSupabase(taskId) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('tasks').delete().eq('id', taskId);
  } catch (err) {
    console.warn('[Supabase] Delete error:', err.message);
  }
}

// ─── Load from Supabase then fall back to localStorage ─────

async function _loadFromSupabase(isBackgroundSync = false) {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const [{ data: taskRows, error: te }, { data: empRows, error: ee }] = await Promise.all([
      sb.from('tasks').select('data'),
      sb.from('employees').select('data')
    ]);

    let dataChanged = false;

    if (!te && taskRows) {
      const parsedTasks = taskRows.map(r => r.data).sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      const oldTasks = [...(_tasksCache || [])].sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      if (JSON.stringify(oldTasks) !== JSON.stringify(parsedTasks)) {
        _tasksCache = parsedTasks;
        localStorage.setItem('skc_tasks', JSON.stringify(_tasksCache));
        dataChanged = true;
      }
    }

    if (!ee && empRows) {
      const parsedEmps = empRows.map(r => r.data).sort((a, b) => (a.id || 0) - (b.id || 0));
      const oldEmps = [...(_employeesCache || [])].sort((a, b) => (a.id || 0) - (b.id || 0));
      if (JSON.stringify(oldEmps) !== JSON.stringify(parsedEmps)) {
        _employeesCache = parsedEmps;
        localStorage.setItem('skc_employees', JSON.stringify(_employeesCache));
        dataChanged = true;
      }
    }

    if (isBackgroundSync && dataChanged) {
      window.dispatchEvent(new Event('dataSyncComplete'));
    }

    return true;
  } catch (err) {
    console.warn('[Supabase] Load error:', err.message);
    return false;
  }
}

// ─── Realtime Sync ─────────────────────────────

function enableRealtimeSync() {
  const sb = getSupabase();
  if (!sb) return;

  // 1. Supabase Realtime via Postgres Changes
  try {
    sb.channel('public-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
        _loadFromSupabase(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, payload => {
        _loadFromSupabase(true);
      })
      .subscribe();
  } catch (err) {
    console.warn('[Supabase] Realtime error:', err.message);
  }

  // 2. Fallback polling every 5 seconds for robustness
  setInterval(() => {
    _loadFromSupabase(true);
  }, 5000);
}

// ─── Initialise ────────────────────────────────

async function initData() {
  // Show loading indicator if app is ready
  const loginPage = document.getElementById('login-page');
  if (!loginPage) return;

  // Try loading from Supabase first
  const loaded = await _loadFromSupabase();

  if (!loaded || !_tasksCache || _tasksCache.length === 0) {
    // Fall back to localStorage
    const localTasks = localStorage.getItem('skc_tasks');
    const localEmps  = localStorage.getItem('skc_employees');
    _tasksCache    = localTasks  ? JSON.parse(localTasks)  : SEED_TASKS;
    _employeesCache = localEmps  ? JSON.parse(localEmps)   : SEED_EMPLOYEES;

    if (!localTasks)  {
      // First-ever boot: seed to Supabase
      localStorage.setItem('skc_tasks', JSON.stringify(SEED_TASKS));
      _syncTasksToSupabase(SEED_TASKS);
    }
    if (!localEmps) {
      localStorage.setItem('skc_employees', JSON.stringify(SEED_EMPLOYEES));
      _syncEmployeesToSupabase(SEED_EMPLOYEES);
    }
  }

  if (!_employeesCache || _employeesCache.length === 0) {
    _employeesCache = SEED_EMPLOYEES;
  }

  // Signal app.js that data is ready
  window._dataAlreadyReady = true;
  window.dispatchEvent(new Event('dataReady'));

  // Start real-time sync after initial load
  setTimeout(enableRealtimeSync, 1000);
}

// Run immediately
initData();
