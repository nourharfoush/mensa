const fs = require('fs');
let text = fs.readFileSync('src/pages/MonthlyReportCreate.jsx', 'utf8');
text = text.replace('select\n                  className="form-select"\n                  value={branch.branch}', '<select\n                  className="form-select"\n                  value={branch.branch}');
fs.writeFileSync('src/pages/MonthlyReportCreate.jsx', text, 'utf8');
console.log('Fixed missing < symbol!');
