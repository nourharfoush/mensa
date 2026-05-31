const fs = require('fs');

const buf = fs.readFileSync('src/pages/MonthlyReportCreate.jsx');

const p1 = buf.slice(0, 11480);
const p2 = buf.slice(12356, 20443);

const repText = `select
                  className="form-select"
                  value={branch.branch}
                  onChange={e => {
                    const selectedBranchName = e.target.value;
                    handleBranchChange(branch.id, 'branch', selectedBranchName);
                    
                    // تحقق من توافق تاريخ المتابعة الحالي مع أيام عمل الفرع الجديد
                    if (branch.date && selectedBranchName) {
                      const selectedBranchObj = appBranches.find(b => b.admin === form.admin && b.name === selectedBranchName);
                      if (selectedBranchObj && selectedBranchObj.workDays && selectedBranchObj.workDays.length > 0) {
                        const jsDayToArabic = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                        const selectedDate = new Date(branch.date);
                        const selectedDayName = jsDayToArabic[selectedDate.getDay()];
                        if (!selectedBranchObj.workDays.includes(selectedDayName)) {
                          alert(\`عذراً، يوم العمل الموافق للتاريخ المختار هو (\${selectedDayName})، وهو ليس من ضمن أيام عمل الفرع المحدد (\${selectedBranchObj.workDays.join('، ')}).\`);
                          handleBranchChange(branch.id, 'date', '');
                        }
                      }
                    }
                  }}
                  disabled={!branch.center}
                >
                  <option value="">{branch.center ? 'اختار الفرع' : 'اختار المركز أولاً'}</option>
                  {appBranches
                    .filter(b => b.admin === form.admin && b.center === branch.center)
                    .map((b, i) => (
                      <option key={i} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                </select>

                `;

const finalBuf = Buffer.concat([p1, Buffer.from(repText), p2]);
fs.writeFileSync('src/pages/MonthlyReportCreate.jsx', finalBuf);
console.log('MonthlyReportCreate.jsx successfully rebuilt!');
console.log('Original length:', buf.length, 'New length:', finalBuf.length);
