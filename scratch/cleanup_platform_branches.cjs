const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, '..', 'src', 'pages');

const files = fs.readdirSync(srcDir).filter(f => f.startsWith('Platform') && f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove `branch` from forms (Create files)
  content = content.replace(/branch: '[^']*',\s*/g, '');
  content = content.replace(/branch: '[^']*'/g, '');
  content = content.replace(/branch:\s*[^,]+,\s*/g, ''); // like branch: sessionToEdit.branch || '',
  
  // Remove !form.branch validation
  content = content.replace(/!form\.branch\s*\|\|\s*/g, '');

  // Remove handleBranchChange
  content = content.replace(/const handleBranchChange = [^\n]+\n/g, '');

  // Remove the Branch dropdown from UI (Create files)
  content = content.replace(/<div className="form-group">\s*<label>الفرع[^<]*<\/label>\s*<select name="branch"[\s\S]*?<\/select>\s*<\/div>/g, '');
  // sometimes it's `<label>الفرع <span className="req">*</span></label>`
  content = content.replace(/<div className="form-group">\s*<label>الفرع.*?<\/label>\s*<select name="branch"[\s\S]*?<\/select>\s*<\/div>/g, '');

  // For List files:
  // Remove `filterBranch` and its setter
  content = content.replace(/const \[filterBranch, setFilterBranch\] = useState\(''\);\n/g, '');

  // Remove `filterBranch` from filters in List
  content = content.replace(/\(filterBranch \? [^:]+ : true\) &&\s*/g, '');
  content = content.replace(/&& \(filterBranch \? [^:]+ : true\)/g, '');
  
  // Remove `branch` from export / import
  content = content.replace(/'الفرع': c\.branch,\s*/g, '');
  content = content.replace(/branch: row\['الفرع'\] \|\| '',\s*/g, '');
  
  // Remove Branch filter dropdown in List
  content = content.replace(/<div className="form-group">\s*<label>الفرع<\/label>\s*<select className="form-select" value=\{filterBranch\}[\s\S]*?<\/select>\s*<\/div>/g, '');

  // Remove 'الفرع' column from table headers
  content = content.replace(/<th>الفرع<\/th>/g, '');

  // Remove branch column from table body
  content = content.replace(/<td>\{c\.branch\}<\/td>/g, '');

  // Specific fix for setFilterBranch('') in clear button
  content = content.replace(/setFilterBranch\(''\); /g, '');
  
  // Also remove `branches` from AppDataContext imports
  content = content.replace(/branches, /g, '');
  content = content.replace(/, branches/g, '');

  fs.writeFileSync(filePath, content);
});

console.log('Branch cleanup done');
