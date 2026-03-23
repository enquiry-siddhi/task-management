const fs = require('fs');
let code = fs.readFileSync('c:\\Task Manager\\js\\app.js', 'utf8');

// Replace EMPLOYEES.filter with getEmployees().filter
code = code.replace(/EMPLOYEES\.filter/g, 'getEmployees().filter');

// Replace let assignable = EMPLOYEES; with let assignable = getEmployees();
code = code.replace(/let assignable = EMPLOYEES;/g, 'let assignable = getEmployees();');

// Replace let emps = EMPLOYEES; with let emps = getEmployees();
code = code.replace(/let emps = EMPLOYEES;/g, 'let emps = getEmployees();');

fs.writeFileSync('c:\\Task Manager\\js\\app.js', code);
