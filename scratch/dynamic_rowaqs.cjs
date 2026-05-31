const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'pages');
const files = fs.readdirSync(srcDir).filter(f => f.startsWith('Platform') && f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Make sure platformRowaqs is in the useAppData hook if we need it
  if (content.includes('rowaq"') || content.includes("rowaq'") || content.includes('filterRowaq')) {
    if (!content.includes('platformRowaqs') && content.includes('useAppData')) {
      content = content.replace(/const\s*{\s*([^}]+)\s*}\s*=\s*useAppData\(\);/, (match, group1) => {
        return `const { ${group1}, platformRowaqs } = useAppData();`;
      });
    }
  }

  // Replace hardcoded options with dynamic options
  const rowaqOptionsRegex = /<option value="رواق القرآن الكريم \(أطفال\)">.*?<\/option>\s*<option value="رواق القرآن الكريم \(كبار\)">.*?<\/option>\s*<option value="رواق التجويد">.*?<\/option>\s*<option value="رواق القراءات">.*?<\/option>/g;
  
  if (rowaqOptionsRegex.test(content)) {
    content = content.replace(rowaqOptionsRegex, '{platformRowaqs.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}');
  }

  // In PlatformSessionsCreate.jsx, also fix levels and context variables
  if (file === 'PlatformSessionsCreate.jsx') {
    content = content.replace(/const levelsForRowaq = {[\s\S]*?};\n/, '');
    
    // Fix useAppData variables
    content = content.replace(/mohfezs,\s*sessions/g, 'platformMohfezs, platformSessions');
    
    // Fix levels dropdown
    const levelsRegex = /\{form\.rowaq && levelsForRowaq\[form\.rowaq\] \? \([\s\S]*?\) : \([\s\S]*?\)\}/;
    const dynamicLevels = `{(() => {
                const selectedRowaq = platformRowaqs.find(r => r.name === form.rowaq);
                if (!selectedRowaq) return <option value="">اختار الرواق أولاً</option>;
                const levels = Array.from({ length: selectedRowaq.levels || 0 }, (_, i) => \`المستوى \${i + 1}\`);
                return levels.map((lvl, i) => <option key={i} value={lvl}>{lvl}</option>);
              })()}`;
    content = content.replace(levelsRegex, dynamicLevels);
  }

  // Also in PlatformStudentsCreate.jsx we might have levels
  if (file === 'PlatformStudentsCreate.jsx') {
    // If levelsForRowaq exists, remove it
    content = content.replace(/const levelsForRowaq = {[\s\S]*?};\n/, '');
    
    const levelsRegex = /\{form\.rowaq && levelsForRowaq\[form\.rowaq\] \? \([\s\S]*?\) : \([\s\S]*?\)\}/;
    const dynamicLevels = `{(() => {
                const selectedRowaq = platformRowaqs.find(r => r.name === form.rowaq);
                if (!selectedRowaq) return <option value="">اختار الرواق أولاً</option>;
                const levels = Array.from({ length: selectedRowaq.levels || 0 }, (_, i) => \`المستوى \${i + 1}\`);
                return levels.map((lvl, i) => <option key={i} value={lvl}>{lvl}</option>);
              })()}`;
    content = content.replace(levelsRegex, dynamicLevels);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
console.log('Finished updating Rowaq dropdowns');
