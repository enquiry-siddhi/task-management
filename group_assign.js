const fs = require('fs');
let code = fs.readFileSync('c:\\Task Manager\\js\\app.js', 'utf8');

// 1. Helper function for Assignee HTML/Name
if (!code.includes('function getAssigneeName')) {
  code = code.replace(
    /function statusLabel/,
    `function getAssigneeName(id) {
  if (typeof id === 'string' && id.startsWith('group:')) return 'Team: ' + id.replace('group:', '');
  const emp = getEmployee(id);
  return emp ? emp.name : 'Unknown';
}

function getAssigneeLabelHtml(id) {
  if (typeof id === 'string' && id.startsWith('group:')) {
    return \`<div style="display:flex;align-items:center;gap:8px">
      <div class="user-avatar small" style="background:#4b5563">G</div>
      Team: \${id.replace('group:', '')}
    </div>\`;
  }
  const emp = getEmployee(id);
  return \`<div style="display:flex;align-items:center;gap:8px">
    <div class="user-avatar small" style="background:\${emp ? emp.color : '#ccc'}">
      \${emp ? initials(emp.name) : '?'}
    </div>
    \${emp ? emp.name : 'Unknown'} \${emp && emp.designation ? '– ' + emp.designation : ''}
  </div>\`;
}

function statusLabel`
  );
}

// 2. Dropdowns (both new task and edit task)
code = code.replace(
  /assignable\.forEach\(emp => \{\s*const opt = document\.createElement\('option'\);\s*opt\.value = emp\.id;\s*opt\.textContent = `\$\{emp\.name\} \(\$\{emp\.designation\}\)`;\s*sel\.appendChild\(opt\);\s*\}\);/g,
  `const groups = [...new Set(getEmployees().map(e => e.group).filter(Boolean))];
  const groupOptGroup = document.createElement('optgroup');
  groupOptGroup.label = '─── GROUPS ───';
  groups.forEach(g => {
    const opt = document.createElement('option');
    opt.value = 'group:' + g;
    opt.textContent = 'Team: ' + g;
    groupOptGroup.appendChild(opt);
  });
  sel.appendChild(groupOptGroup);

  const empOptGroup = document.createElement('optgroup');
  empOptGroup.label = '─── EMPLOYEES ───';
  assignable.forEach(emp => {
    const opt = document.createElement('option');
    opt.value = emp.id;
    opt.textContent = \`\${emp.name} (\${emp.designation})\`;
    empOptGroup.appendChild(opt);
  });
  sel.appendChild(empOptGroup);`
);

// 3. openEditTaskModal
code = code.replace(
  /assigneeSel\.innerHTML = '<option value="">Select Employee<\/option>' \+ getEmployees\(\)\.map\(e => `<option value="\$\{e\.id\}"\>\$\{e\.name\} \(\$\{e\.designation\}\)<\/option>`\)\.join\(''\);/,
  `assigneeSel.innerHTML = '<option value="">Select Assignee</option>';
  const groups = [...new Set(getEmployees().map(e => e.group).filter(Boolean))];
  const grpGroup = document.createElement('optgroup'); grpGroup.label = '── GROUPS ──';
  groups.forEach(g => { const o = document.createElement('option'); o.value = 'group:'+g; o.textContent = 'Team: '+g; grpGroup.appendChild(o); });
  assigneeSel.appendChild(grpGroup);
  const eGroup = document.createElement('optgroup'); eGroup.label = '── EMPLOYEES ──';
  getEmployees().forEach(e => { const o = document.createElement('option'); o.value = e.id; o.textContent = \`\${e.name} (\${e.designation})\`; eGroup.appendChild(o); });
  assigneeSel.appendChild(eGroup);`
);

// 4. Save/Edit Task AssignVal Parsing
code = code.replace(
  /assignedTo: parseInt\(document\.getElementById\('task-assignee'\)\.value\)/g,
  `assignedTo: document.getElementById('task-assignee').value.startsWith('group:') ? document.getElementById('task-assignee').value : parseInt(document.getElementById('task-assignee').value)`
);
code = code.replace(
  /tasks\[idx\]\.assignedTo = parseInt\(document\.getElementById\('edit-task-assignee'\)\.value\);/g,
  `const ev = document.getElementById('edit-task-assignee').value; tasks[idx].assignedTo = ev.startsWith('group:') ? ev : parseInt(ev);`
);

// 5. My Tasks filter logic
code = code.replace(
  /t\.assignedTo === currentUser\.id/g,
  `(t.assignedTo === currentUser.id || t.assignedTo === 'group:' + currentUser.group)`
);

// 6. Modal View HTML
code = code.replace(
  /<span class="modal-detail-value">\s*<div style="display:flex;align-items:center;gap:8px">\s*<div class="user-avatar small" style="background:\$\{assignee\?\.color\}">\s*\$\{assignee \? initials\(assignee\.name\) : '\?'\}\s*<\/div>\s*\$\{assignee\?\.name \|\| 'Unknown'\} – \$\{assignee\?\.designation \|\| ''\}\s*<\/div>\s*<\/span>/,
  `<span class="modal-detail-value">\${getAssigneeLabelHtml(task.assignedTo)}</span>`
);

// 7. Render functions text mapping
code = code.replace(
  /<div class="user-avatar small" style="background:\$\{assignee \? assignee\.color : '#ccc'\}">\s*\$\{assignee \? initials\(assignee\.name\) : '\?'\}\s*<\/div>\s*\$\{assignee \? assignee\.name : 'Unknown'\}/g,
  `\${getAssigneeLabelHtml(t.assignedTo)}`
);

// 8. Search/Filters logic mapping
code = code.replace(
  /const a = getEmployee\(t\.assignedTo\);\s*if \(\!a \|\| \!a\.name\.toLowerCase\(\)\.includes\(fAssignedTo\)\) return false;/g,
  `if (!getAssigneeName(t.assignedTo).toLowerCase().includes(fAssignedTo)) return false;`
);
code = code.replace(
  /valA = \(getEmployee\(a\.assignedTo\)\?\.name \|\| ''\)\.toLowerCase\(\);/g,
  `valA = getAssigneeName(a.assignedTo).toLowerCase();`
);
code = code.replace(
  /valB = \(getEmployee\(b\.assignedTo\)\?\.name \|\| ''\)\.toLowerCase\(\);/g,
  `valB = getAssigneeName(b.assignedTo).toLowerCase();`
);
code = code.replace(
  /getEmployee\(t\.assignedTo\)\?\.group === teamVal/g,
  `(t.assignedTo === 'group:'+teamVal || getEmployee(t.assignedTo)?.group === teamVal)`
);

// 9. Fix modal canUpdate logic so ANY member of a group can update a group-assigned task
code = code.replace(
  /const canUpdate = \(task\.assignedTo === currentUser\.id \|\| task\.assignedTo === 'group:' \+ currentUser\.group\) \|\| isSameGroup \|\| currentUser\.role === 'admin' \|\| currentUser\.auth === 'All Group';/,
  `const canUpdate = (task.assignedTo === currentUser.id || task.assignedTo === 'group:' + currentUser.group) || isSameGroup || currentUser.role === 'admin' || currentUser.auth === 'All Group';`
);

fs.writeFileSync('c:\\Task Manager\\js\\app.js', code);
