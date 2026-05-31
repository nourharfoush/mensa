const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'PlatformStudentsList.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace standard names with Platform names
content = content.replace(/StudentsList/g, 'PlatformStudentsList');
content = content.replace(/addStudent/g, 'addPlatformStudent');
content = content.replace(/deleteStudent/g, 'deletePlatformStudent');
content = content.replace(/\/students/g, '/platform-students');

// Remove Admin and Center and Branch completely
// 1. useState filters
content = content.replace(/const \[filterAdmin, setFilterAdmin\] = useState\(''\);\r?\n/g, '');
content = content.replace(/const \[filterCenter, setFilterCenter\] = useState\(''\);\r?\n/g, '');
content = content.replace(/const \[filterBranch, setFilterBranch\] = useState\(''\);\r?\n/g, '');

// 2. availableBranches, Centers
content = content.replace(/const availableCenters = [^\n]*\n/g, '');
content = content.replace(/const availableBranches = [^\n]*\n\s*const normalize = [^\n]*\n\s*return normalize[^\n]*\n\s*\}\);\n/g, '');
// For branches single line:
content = content.replace(/const availableBranches = [^\n]*\n/g, '');

// 3. availableSessions
content = content.replace(/const availableSessions = sessions\.filter\([^;]+;/g, 'const availableSessions = sessions;');

// 4. filter application
content = content.replace(/\(filterAdmin \? s\.admin === filterAdmin : true\) &&\s*/g, '');
content = content.replace(/\(filterCenter \? s\.center === filterCenter : true\) &&\s*/g, '');
content = content.replace(/\(filterBranch \? s\.branch === filterBranch : true\) &&\s*/g, '');

// 5. export
content = content.replace(/'الإدارة': s\.admin,\s*/g, '');
content = content.replace(/'المركز': s\.center,\s*/g, '');
content = content.replace(/'الفرع': s\.branch,\s*/g, '');

// 6. import
content = content.replace(/admin: row\['الإدارة'\] \|\| '',\s*/g, '');
content = content.replace(/center: row\['المركز'\] \|\| '',\s*/g, '');
content = content.replace(/branch: row\['الفرع'\] \|\| '',\s*/g, '');

// 7. Form UI blocks
// Admin
content = content.replace(/<div className="form-group">\s*<label>الإدارة<\/label>\s*<select className="form-select" value=\{filterAdmin\}.*?<\/select>\s*<\/div>/gs, '');
// Center
content = content.replace(/<div className="form-group">\s*<label>المركز<\/label>\s*<select className="form-select" value=\{filterCenter\}.*?<\/select>\s*<\/div>/gs, '');
// Branch
content = content.replace(/<div className="form-group">\s*<label>الفرع<\/label>\s*<select className="form-select" value=\{filterBranch\}.*?<\/select>\s*<\/div>/gs, '');

// 8. Session UI
content = content.replace(/<div className="form-group">\s*<label>الحلقة<\/label>\s*<select className="form-select" value=\{filterSession\}.*?<\/select>\s*<\/div>/gs, 
  '<div className="form-group">\n            <label>الحلقة</label>\n            <select className="form-select" value={filterSession} onChange={e => setFilterSession(e.target.value)}>\n              <option value="">--- اختار الحلقة ---</option>\n              {availableSessions.map((s, i) => <option key={i} value={s.session_no}>حلقة {s.session_no}</option>)}\n            </select>\n          </div>'
);

// 9. Reset button
content = content.replace(/setFilterAdmin\(''\); setFilterCenter\(''\); setFilterBranch\(''\);/g, '');

// 10. Table headers
content = content.replace(/<th>الإدارة<\/th>\s*/g, '');
content = content.replace(/<th>المركز<\/th>\s*/g, '');
content = content.replace(/<th>الفرع<\/th>\s*/g, '');

// 11. Table bodies
content = content.replace(/<td>\{s\.admin\}<\/td>\s*/g, '');
content = content.replace(/<td>\{s\.center\}<\/td>\s*/g, '');
content = content.replace(/<td>\{s\.branch\}<\/td>\s*/g, '');
content = content.replace(/<td colSpan="11"/g, '<td colSpan="8"');

// 12. AppDataContext branches
content = content.replace(/branches,\s*/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done rebuilding PlatformStudentsList.jsx');
