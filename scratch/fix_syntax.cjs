const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, '..', 'src', 'pages');

const files = fs.readdirSync(srcDir).filter(f => f.startsWith('Platform') && f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  // Read file handling potentially corrupted utf-8 by just reading it as utf8
  // If PowerShell wrote it in UTF16, Node might read it weirdly. Let's read it normally.
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('\0')) {
      // It's UTF-16 LE
      content = fs.readFileSync(filePath, 'utf16le');
    }
  } catch(e) {
    console.error(e);
    return;
  }

  // Fix PlatformStudentsList.jsx syntax errors
  if (file === 'PlatformStudentsList.jsx') {
    // Add missing closing div
    content = content.replace(/<\/select>\s*<\/div>\s*<div className="search-actions"/, '</select>\n          </div>\n        </div>\n        <div className="search-actions"');
    // Ensure the filterSession dropdown has a closing div
    content = content.replace(/<div className="form-group">\s*<label>الحلقة<\/label>\s*<select className="form-select" value=\{filterSession\} onChange=\{e => setFilterSession\(e\.target\.value\)\}>\s*<option value="">--- اختار الحلقة ---<\/option>\s*<\/select>\s*(<div className="search-actions")/, '<div className="form-group">\n            <label>الحلقة</label>\n            <select className="form-select" value={filterSession} onChange={e => setFilterSession(e.target.value)}>\n              <option value="">--- اختار الحلقة ---</option>\n            </select>\n          </div>\n        </div>\n        $1');
  }

  // Clean any hanging `&& );`
  content = content.replace(/&&\s*\);/g, ');');
  
  // Write back safely as utf8
  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Fixed syntax and encoding');
