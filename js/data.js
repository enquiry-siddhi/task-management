// ============================================
// DATA.JS — Employee Data, Initial Tasks, Auth
// ============================================

let EMPLOYEES = []; // We will load this from localStorage

const SEED_EMPLOYEES = [
  {
    id: 1, slNo: 1, empId: 'ADM-001',
    name: 'Gurudatta',
    designation: 'Director',
    email: 'guru@siddhikabel.com',
    mobile: '9620209346',
    group: 'Admin',
    auth: 'All Group',
    password: 'siddhi123',
    role: 'admin',
    color: '#6366f1'
  },
  {
    id: 2, slNo: 2, empId: 'EMP-002',
    name: 'D C Venugopal',
    designation: 'Sales',
    email: 'dcvenu@siddhikabel.com',
    mobile: '8095501598',
    group: 'Sales',
    auth: 'Sales team',
    password: 'siddhi123',
    role: 'manager',
    color: '#10b981'
  },
  {
    id: 3, slNo: 3, empId: 'EMP-003',
    name: 'Giridhar',
    designation: 'Sales',
    email: 'Giridhar@siddhikabel.com',
    mobile: '7829111594',
    group: 'Sales',
    auth: 'Sales team',
    password: 'siddhi123',
    role: 'member',
    color: '#3b82f6'
  },
  {
    id: 4, slNo: 4, empId: 'EMP-004',
    name: 'Veeresh',
    designation: 'Sales',
    email: 'veeresh@siddhikabel.com',
    mobile: '9606719185',
    group: 'Sales',
    auth: 'Sales team',
    password: 'siddhi123',
    role: 'member',
    color: '#f59e0b'
  },
  {
    id: 5, slNo: 5, empId: 'EMP-005',
    name: 'Purushothama',
    designation: 'Accounts',
    email: 'accounts1@siddhikabel.com',
    mobile: '9741002071',
    group: 'Accounts',
    auth: 'Accounts',
    password: 'siddhi123',
    role: 'manager',
    color: '#ec4899'
  },
  {
    id: 6, slNo: 6, empId: 'EMP-006',
    name: 'Nanditha',
    designation: 'Accounts',
    email: 'accounts2@siddhikabel.com',
    mobile: '9535818083',
    group: 'Accounts',
    auth: 'Accounts',
    password: 'siddhi123',
    role: 'member',
    color: '#14b8a6'
  },
  {
    id: 7, slNo: 7, empId: 'EMP-007',
    name: 'Kumar N',
    designation: 'Admin / C',
    email: 'sales@siddhikabel.com',
    mobile: '7259662678',
    group: 'Admin',
    auth: 'Offer Management and Admin',
    password: 'siddhi123',
    role: 'manager',
    color: '#a78bfa'
  },
  {
    id: 8, slNo: 8, empId: 'EMP-008',
    name: 'Vanditha',
    designation: 'Offer Management',
    email: 'enquiry@siddhikabel.com',
    mobile: '8088288602',
    group: 'Offer Management',
    auth: 'Offer Management',
    password: 'siddhi123',
    role: 'manager',
    color: '#f97316'
  },
  {
    id: 9, slNo: 9, empId: 'EMP-009',
    name: 'Mohan',
    designation: 'SCM / Log',
    email: 'sales2@siddhikabel.com',
    mobile: '9742193023',
    group: 'SCM',
    auth: 'SCM / Logistic',
    password: 'siddhi123',
    role: 'member',
    color: '#06b6d4'
  },
  {
    id: 10, slNo: 10, empId: 'EMP-010',
    name: 'Geetha',
    designation: 'SCM / Log',
    email: 'admin@siddhikabel.com',
    mobile: '9611235461',
    group: 'SCM',
    auth: 'SCM / Logistic / Customer Complaint',
    password: 'siddhi123',
    role: 'manager',
    color: '#84cc16'
  },
  {
    id: 11, slNo: 11, empId: 'EMP-011',
    name: 'Rachana',
    designation: 'SCM',
    email: 'sales3@siddhikabel.com',
    mobile: '8904469598',
    group: 'SCM',
    auth: 'SCM',
    password: 'siddhi123',
    role: 'member',
    color: '#f43f5e'
  },
  {
    id: 12, slNo: 12, empId: 'EMP-012',
    name: 'Ranjan',
    designation: 'SCM/Offer',
    email: 'Info@siddhikabel.com',
    mobile: '9739138919',
    group: 'SCM/Offer',
    auth: 'SCM/Offer management',
    password: 'siddhi123',
    role: 'member',
    color: '#8b5cf6'
  }
];

// Seed tasks — realistic for a cable company
const SEED_TASKS = [
  {
    id: 't001',
    title: 'Follow up with KPTCL for pending purchase order',
    description: 'Contact KPTCL procurement team about the pending PO for 11kV cables worth ₹28L.',
    assignedTo: 2,
    assignedBy: 1,
    category: 'Sales',
    priority: 'high',
    status: 'in-progress',
    dueDate: getTodayOffset(1),
    dueTime: '17:00',
    createdAt: getTodayOffset(-2),
    remarks: 'They have been waiting since last week. Escalate if no response.',
    updates: []
  },
  {
    id: 't002',
    title: 'Prepare quotation for BESCOM LT cable supply',
    description: 'Prepare detailed quotation for 1.1kV XLPE armoured cable supply for BESCOM tender.',
    assignedTo: 8,
    assignedBy: 1,
    category: 'Offer Management',
    priority: 'high',
    status: 'pending',
    dueDate: getTodayOffset(0),
    dueTime: '14:00',
    createdAt: getTodayOffset(-1),
    remarks: 'Deadline is today. Include discount structure.',
    updates: []
  },
  {
    id: 't003',
    title: 'GST filing for March 2026',
    description: 'Complete and file GSTR-3B for March 2026. Reconcile input tax credit.',
    assignedTo: 5,
    assignedBy: 1,
    category: 'Accounts',
    priority: 'high',
    status: 'pending',
    dueDate: getTodayOffset(2),
    dueTime: '16:00',
    createdAt: getTodayOffset(-3),
    remarks: 'Ensure all purchase invoices are uploaded.',
    updates: []
  },
  {
    id: 't004',
    title: 'Dispatch follow-up for Mysore order #MYS-224',
    description: 'Coordinate with logistics for dispatch of 500m HT cable to Mysore client.',
    assignedTo: 9,
    assignedBy: 7,
    category: 'SCM/Logistics',
    priority: 'medium',
    status: 'in-progress',
    dueDate: getTodayOffset(1),
    dueTime: '12:00',
    createdAt: getTodayOffset(-1),
    remarks: 'Vehicle booked. Confirm loading confirmation.',
    updates: []
  },
  {
    id: 't005',
    title: 'Update CRM with new leads from Bangalore expo',
    description: 'Enter all leads collected from the Bangalore Electrical Expo into the CRM system.',
    assignedTo: 3,
    assignedBy: 2,
    category: 'Sales',
    priority: 'medium',
    status: 'completed',
    dueDate: getTodayOffset(-1),
    dueTime: '18:00',
    createdAt: getTodayOffset(-4),
    remarks: '',
    updates: [{ text: 'All 34 leads entered into CRM', time: getTodayOffset(-1) + ' 17:30' }]
  },
  {
    id: 't006',
    title: 'Resolve customer complaint – Order #BNG-198',
    description: 'Customer reported cable defect. Inspect report and coordinate replacement.',
    assignedTo: 10,
    assignedBy: 7,
    category: 'Customer Complaint',
    priority: 'high',
    status: 'in-progress',
    dueDate: getTodayOffset(0),
    dueTime: '15:00',
    createdAt: getTodayOffset(-2),
    remarks: 'Customer is VIP. Handle with priority.',
    updates: []
  },
  {
    id: 't007',
    title: 'Prepare monthly sales report for February',
    description: 'Compile sales data, compare with targets, and prepare MIS report.',
    assignedTo: 4,
    assignedBy: 2,
    category: 'Sales',
    priority: 'medium',
    status: 'completed',
    dueDate: getTodayOffset(-3),
    dueTime: '17:00',
    createdAt: getTodayOffset(-7),
    remarks: '',
    updates: [{ text: 'Report submitted and shared with management', time: getTodayOffset(-3) + ' 16:45' }]
  },
  {
    id: 't008',
    title: 'Vendor payment – Copper supplier invoice',
    description: 'Process payment for copper wire vendor invoice INV-2024-0318 – ₹4.2L',
    assignedTo: 6,
    assignedBy: 5,
    category: 'Accounts',
    priority: 'medium',
    status: 'pending',
    dueDate: getTodayOffset(3),
    dueTime: '12:00',
    createdAt: getTodayOffset(-1),
    remarks: 'Bank transfer approved. Execute on due date.',
    updates: []
  },
  {
    id: 't009',
    title: 'Offer preparation for Hubli HESCOM tender',
    description: 'Prepare technical and commercial offer for HESCOM 33kV cable supply tender.',
    assignedTo: 12,
    assignedBy: 8,
    category: 'Offer Management',
    priority: 'high',
    status: 'pending',
    dueDate: getTodayOffset(2),
    dueTime: '09:00',
    createdAt: getTodayOffset(0),
    remarks: 'Submit before tender closing time.',
    updates: []
  },
  {
    id: 't010',
    title: 'Stock audit – Warehouse A',
    description: 'Conduct physical stock verification for Warehouse A and update inventory records.',
    assignedTo: 11,
    assignedBy: 10,
    category: 'SCM/Logistics',
    priority: 'low',
    status: 'pending',
    dueDate: getTodayOffset(5),
    dueTime: '10:00',
    createdAt: getTodayOffset(0),
    remarks: '',
    updates: []
  },
  {
    id: 't011',
    title: 'Renew ISO certification documentation',
    description: 'Prepare and submit updated quality documents for ISO 9001 annual renewal.',
    assignedTo: 7,
    assignedBy: 1,
    category: 'Admin',
    priority: 'medium',
    status: 'pending',
    dueDate: getTodayOffset(7),
    dueTime: '17:00',
    createdAt: getTodayOffset(0),
    remarks: 'Coordinate with the quality team.',
    updates: []
  },
  {
    id: 't012',
    title: 'Sales visit to Mangalore client – MedPlus Infra',
    description: 'Visit MedPlus Infra office in Mangalore for new project discussion.',
    assignedTo: 2,
    assignedBy: 1,
    category: 'Sales',
    priority: 'medium',
    status: 'completed',
    dueDate: getTodayOffset(-2),
    dueTime: '11:00',
    createdAt: getTodayOffset(-5),
    remarks: '',
    updates: [{ text: 'Visit completed. RFQ expected by end of week.', time: getTodayOffset(-2) + ' 15:00' }]
  }
];

function getTodayOffset(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
}

// Initialize localStorage with seed data if empty
function initData() {
  if (!localStorage.getItem('skc_tasks')) {
    localStorage.setItem('skc_tasks', JSON.stringify(SEED_TASKS));
  }
  if (!localStorage.getItem('skc_employees')) {
    localStorage.setItem('skc_employees', JSON.stringify(SEED_EMPLOYEES));
  }
  EMPLOYEES = getEmployees();
}

function getTasks() {
  return JSON.parse(localStorage.getItem('skc_tasks') || '[]');
}

function saveTasks(tasks) {
  localStorage.setItem('skc_tasks', JSON.stringify(tasks));
}

function getEmployees() {
  return JSON.parse(localStorage.getItem('skc_employees') || '[]');
}

function saveEmployees(emps) {
  EMPLOYEES = emps;
  localStorage.setItem('skc_employees', JSON.stringify(emps));
}

function getEmployee(id) {
  return EMPLOYEES.find(e => e.id === id);
}

// Ensure data is initialized synchronously before app.js runs
initData();
