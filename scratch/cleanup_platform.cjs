const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, '..', 'src', 'pages');

const files = fs.readdirSync(srcDir).filter(f => f.startsWith('Platform') && f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove state for Admin/Center
  content = content.replace(/const \[filterAdmin, setFilterAdmin\] = useState\(''\);\n?/g, '');
  content = content.replace(/const \[filterCenter, setFilterCenter\] = useState\(''\);\n?/g, '');
  content = content.replace(/const availableCenters = [^\n]+\n?/g, '');
  
  // Remove from filters logic
  content = content.replace(/\(filterAdmin \? [^)]+\) &&\n?/g, '');
  content = content.replace(/\(filterCenter \? [^)]+\) &&\n?/g, '');

  // Remove from JSX UI (Admin)
  content = content.replace(/<div className="form-group">\s*<label>الإدارة<\/label>[\s\S]*?<\/div>\n?/g, '');
  content = content.replace(/<div className="form-group">\s*<label>المحافظة<\/label>[\s\S]*?<\/div>\n?/g, '');
  
  // Remove from JSX UI (Center)
  content = content.replace(/<div className="form-group">\s*<label>المركز<\/label>[\s\S]*?<\/div>\n?/g, '');

  // Remove setFilterAdmin('') from reset buttons
  content = content.replace(/setFilterAdmin\(''\); /g, '');
  content = content.replace(/setFilterCenter\(''\); /g, '');

  fs.writeFileSync(filePath, content);
});

console.log('Cleanup done');
