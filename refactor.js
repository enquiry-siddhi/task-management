const fs = require('fs');

let appJs = fs.readFileSync('c:\\Task Manager\\js\\app.js', 'utf8');

// 1. Dashboard Stats
appJs = appJs.replace(
  `completed: tasks.filter(t => t.status === 'completed').length,`,
  `completed: tasks.filter(t => t.status === 'completed' || t.status === 'closed').length,`
);
appJs = appJs.replace(
  `overdue: tasks.filter(t => t.status !== 'completed' && t.dueDate < today).length,`,
  `overdue: tasks.filter(t => t.status !== 'completed' && t.status !== 'closed' && t.dueDate < today).length,`
);
appJs = appJs.replace(
  `dueToday: tasks.filter(t => t.dueDate === today && t.status !== 'completed').length,`,
  `dueToday: tasks.filter(t => t.dueDate === today && t.status !== 'completed' && t.status !== 'closed').length,`
);

// 2. Map overdue logic
appJs = appJs.replace(/if \(t\.status !== 'completed' && t\.dueDate < today\) return \{\.\.\.t, status: 'overdue'\};/g, 
  `if (t.status !== 'completed' && t.status !== 'closed' && t.dueDate < today) return {...t, status: 'overdue'};`);

// 3. Status Order
appJs = appJs.replace(
  `const statusOrder = { overdue: 0, pending: 1, 'in-progress': 2, completed: 3 };`,
  `const statusOrder = { overdue: 0, pending: 1, 'in-progress': 2, completed: 3, closed: 4 };`
);

// 4. Overdue logic in map/filter
appJs = appJs.replace(/const isOverdue  = t\.status !== 'completed' && t\.dueDate < today;/g,
  `const isOverdue = t.status !== 'completed' && t.status !== 'closed' && t.dueDate < today;`);
appJs = appJs.replace(/const isOverdue = t\.dueDate < today && t\.status !== 'completed';/g,
  `const isOverdue = t.dueDate < today && t.status !== 'completed' && t.status !== 'closed';`);
appJs = appJs.replace(/const isOverdue = task\.status !== 'completed' && task\.dueDate < today;/g,
  `const isOverdue = task.status !== 'completed' && task.status !== 'closed' && task.dueDate < today;`);

// 5. Urgent badge logic
appJs = appJs.replace(
  `t.priority === 'high' && t.status !== 'completed' ?`,
  `t.priority === 'high' && t.status !== 'completed' && t.status !== 'closed' ?`
);

// 6. Timeline and Kanban logic
appJs = appJs.replace(/const barCls = t\.status === 'completed' \? 'completed' : t\.priority;/g,
  `const barCls = (t.status === 'completed' || t.status === 'closed') ? 'completed' : t.priority;`);
appJs = appJs.replace(/const cls = t\.status === 'completed' \? 'completed' : t\.priority;/g,
  `const cls = (t.status === 'completed' || t.status === 'closed') ? 'completed' : t.priority;`);

// 7. Team management stats
appJs = appJs.replace(/const done = empTasks\.filter\(t => t\.status === 'completed'\)\.length;/g,
  `const done = empTasks.filter(t => t.status === 'completed' || t.status === 'closed').length;`);
appJs = appJs.replace(/const pending = empTasks\.filter\(t => t\.status !== 'completed'\)\.length;/g,
  `const pending = empTasks.filter(t => t.status !== 'completed' && t.status !== 'closed').length;`);

// 8. Overdue notifications
appJs = appJs.replace(/tasks\.filter\(t => t\.status !== 'completed' && t\.dueDate < today\)/g,
  `tasks.filter(t => t.status !== 'completed' && t.status !== 'closed' && t.dueDate < today)`);
appJs = appJs.replace(/tasks\.filter\(t => t\.dueDate === today && t\.status !== 'completed'\)/g,
  `tasks.filter(t => t.dueDate === today && t.status !== 'completed' && t.status !== 'closed')`);

// 9. Status label
appJs = appJs.replace(
  `'completed': 'Completed',`,
  `'completed': 'Completed', 'closed': 'Closed',`
);

fs.writeFileSync('c:\\Task Manager\\js\\app.js', appJs);

let styleCss = fs.readFileSync('c:\\Task Manager\\css\\style.css', 'utf8');
if (!styleCss.includes('.badge-closed')) {
  styleCss = styleCss.replace(
    `.badge-completed { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }`,
    `.badge-completed { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }\n.badge-closed { background: #f3f4f6; color: #4b5563; border: 1px solid #d1d5db; }`
  );
  fs.writeFileSync('c:\\Task Manager\\css\\style.css', styleCss);
}

let dashboardCss = fs.readFileSync('c:\\Task Manager\\css\\dashboard.css', 'utf8');
if (!dashboardCss.includes('.badge-closed')) {
  dashboardCss = dashboardCss.replace(
    `.badge-completed { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }`,
    `.badge-completed { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }\n.badge-closed { background: #f3f4f6; color: #4b5563; border: 1px solid #d1d5db; }`
  );
  fs.writeFileSync('c:\\Task Manager\\css\\dashboard.css', dashboardCss);
}

let indexHtml = fs.readFileSync('c:\\Task Manager\\index.html', 'utf8');
if (!indexHtml.includes('value="closed"')) {
  indexHtml = indexHtml.replace(
    `<option value="overdue">Overdue</option>`,
    `<option value="overdue">Overdue</option>\n                        <option value="closed">Closed</option>`
  );
  fs.writeFileSync('c:\\Task Manager\\index.html', indexHtml);
}

console.log('Refactoring complete');
