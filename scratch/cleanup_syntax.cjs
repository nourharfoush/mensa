const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, '..', 'src', 'pages');

const files = fs.readdirSync(srcDir).filter(f => f.startsWith('Platform') && f.endsWith('Create.jsx'));

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove the leftover broken code from availableBranches
  content = content.replace(/\s*const normalize = [^\n]+\n\s*return normalize[^\n]+\n\s*\}\);\n/g, '');
  
  // Remove broken availableSessions
  content = content.replace(/const availableSessions = sessions\.filter\(s => \{\n\s*const normalize = [^\n]+\n\s*return normalize[^\n]+\n\s*normalize[^\n]+\n\s*normalize[^\n]+\n\s*\}\);\n/g, '');
  
  // Clean up availableMohfezs error
  content = content.replace(/const availableMohfezs = mohfezs\.filter[^\n]+\n?/g, '');
  
  // Clean up availableCenters
  content = content.replace(/const availableCenters = [^\n]+\n?/g, '');

  // Now fix mapping variables in UI
  content = content.replace(/\{availableMohfezs/g, '{platformMohfezs');
  content = content.replace(/\{availableSessions/g, '{platformSessions');

  fs.writeFileSync(filePath, content);
});

console.log('Cleanup done');
