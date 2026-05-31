import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Lock } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import egyptCenters from '../data/egyptCenters';

const governorates = Object.keys(egyptCenters);

const months = [
  {v:'1',l:'يناير'},{v:'2',l:'فبراير'},{v:'3',l:'مارس'},{v:'4',l:'أبريل'},
  {v:'5',l:'مايو'},{v:'6',l:'يونيو'},{v:'7',l:'يوليو'},{v:'8',l:'أغسطس'},
  {v:'9',l:'سبتمبر'},{v:'10',l:'أكتوبر'},{v:'11',l:'نوفمبر'},{v:'12',l:'ديسمبر'}
];

function MonthlyReportEdit() {
  const { id } = useParams();
  const { monthlyReports, updateMonthlyReport, branches: appBranches, managers, followUpReports } = useAppData();
  const navigate = useNavigate();

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const role = currentUser ? currentUser.role : 'admin';
  const canEdit = ['admin', 'rowaq_admin', 'rowaq_manager', 'rowaq_tech'].includes(role);

  const report = monthlyReports.find(r => String(r.id) === String(id));

  const isEditAllowed = () => {
    if (!report) return false;
    if (['admin', 'rowaq_admin'].includes(role)) return true;
    if (!['rowaq_manager', 'rowaq_tech'].includes(role)) return false;

    const today = new Date();
    const limitDate = new Date(parseInt(report.year, 10), parseInt(report.month, 10) - 1, 3, 23, 59, 59);
    return today <= limitDate;
  };

  useEffect(() => {
    if (!canEdit) {
      alert('عذراً، تعديل المتابعات الشهرية من صلاحيات التقني والمدير فقط.');
      navigate('/monthlyreport');
    } else if (report && !isEditAllowed()) {
      alert('عذراً، انتهت فترة التعديل لهذه المتابعة (متاحة فقط حتى يوم 3 من شهر المتابعة).');
      navigate('/monthlyreport');
    }
  }, [canEdit, report, navigate]);

  const [form, setForm] = useState({
    admin: '', member: '', specialty: '', phone: '', month: '', year: ''
  });

  const [branches, setBranches] = useState([]);

  useEffect(() => {
    if (report) {
      setForm({
        admin: report.admin || '',
        member: report.member || '',
        specialty: report.specialty || '',
        phone: report.phone || '',
        month: report.month || '',
        year: report.year || ''
      });
      setBranches(report.branches || []);
    }
  }, [report]);

  if (!canEdit || !report) return null;

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // When admin changes, reset all branch centers and manager selections
  const handleAdminChange = e => {
    // If any visit has followUp, warn and prevent changing admin
    const hasAnyFollowUp = branches.some(b => hasFollowUp(b.id));
    if (hasAnyFollowUp) {
      alert('لا يمكن تغيير الإدارة لوجود زيارات مسجل لها تقارير متابعة بالفعل.');
      return;
    }
    setForm({ ...form, admin: e.target.value, member: '', specialty: '', phone: '' });
    setBranches([]);
  };

  // When member changes, autofill specialty and phone
  const handleMemberChange = e => {
    const selectedMember = managers.find(m => m.name === e.target.value);
    setForm({ 
      ...form, 
      member: e.target.value,
      specialty: selectedMember?.specialty || '',
      phone: selectedMember?.phone || ''
    });
  };

  const addBranch = () => {
    if (branches.length >= 15) {
      alert('الحد الأقصى للمتابعات هو 15 متابعة للعضو');
      return;
    }
    setBranches(prev => [
      ...prev, { id: Date.now() + Math.random(), type: 'مباشر', date: '', center: '', branch: '' }
    ]);
  };

  const removeBranch = (branchId) => {
    if (hasFollowUp(branchId)) {
      alert('لا يمكن حذف هذه الزيارة لوجود تقرير متابعة مسجل لها.');
      return;
    }
    setBranches(prev => prev.filter(b => b.id !== branchId));
  };

  const handleBranchChange = (branchId, field, value) => {
    if (hasFollowUp(branchId)) {
      return; // Prevent edits if there is a follow-up report
    }
    setBranches(prev => prev.map(b => b.id === branchId ? { ...b, [field]: value } : b));
  };

  const hasFollowUp = (branchVisitId) => {
    return followUpReports.some(r => String(r.monthlyReportId) === String(id) && String(r.branchVisitId) === String(branchVisitId));
  };

  const handleDateChange = (branchId, dateValue) => {
    if (hasFollowUp(branchId)) return;

    if (!dateValue) {
      handleBranchChange(branchId, 'date', '');
      return;
    }

    const row = branches.find(b => b.id === branchId);
    if (row && row.branch) {
      const selectedBranchObj = appBranches.find(b => b.admin === form.admin && b.name === row.branch);
      if (selectedBranchObj && selectedBranchObj.workDays && selectedBranchObj.workDays.length > 0) {
        const jsDayToArabic = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const selectedDate = new Date(dateValue);
        const selectedDayName = jsDayToArabic[selectedDate.getDay()];

        if (!selectedBranchObj.workDays.includes(selectedDayName)) {
          alert(`عذراً، يوم العمل الموافق للتاريخ المختار هو (${selectedDayName})، وهو ليس من ضمن أيام عمل الفرع المحدد (${selectedBranchObj.workDays.join('، ')}).`);
          handleBranchChange(branchId, 'date', '');
          return;
        }
      }
    }
    handleBranchChange(branchId, 'date', dateValue);
  };

  const handleSubmit = () => {
    if (!form.admin || !form.month || !form.year) {
      alert('الرجاء ملء الحقول المطلوبة: الإدارة، الشهر، السنة');
      return;
    }

    // التحقق من تعبئة جميع الحقول لكل المتابعات المضافة
    for (let i = 0; i < branches.length; i++) {
      const b = branches[i];
      if (!b.date || !b.center || !b.branch) {
        alert(`الرجاء إكمال كافة بيانات المتابعة رقم ${i + 1} (النوع، التاريخ، المركز، والفرع)`);
        return;
      }
    }

    // 1) التحقق من عدم تكرار زيارة نفس الفرع في نفس اليوم في المتابعة الحالية
    const localKeys = new Set();
    for (const b of branches) {
      const key = `${b.branch}_${b.date}`;
      if (localKeys.has(key)) {
        alert(`عذراً، لا يمكن تكرار زيارة نفس الفرع (${b.branch}) في نفس اليوم (${b.date}) في المتابعة الحالية.`);
        return;
      }
      localKeys.add(key);
    }

    // 2) التحقق من عدم وجود متابعة من عضوين لنفس الفرع في نفس اليوم في النظام (مع استبعاد التقرير الحالي)
    for (const b of branches) {
      const conflict = monthlyReports.find(r => {
        if (String(r.id) !== String(id) && r.member !== form.member) {
          return r.branches && r.branches.some(v => v.branch === b.branch && v.date === b.date);
        }
        return false;
      });

      if (conflict) {
        alert(`عذراً، لا يمكن إضافة المتابعة للفرع (${b.branch}) في تاريخ (${b.date}) لوجود متابعة مسجلة بالفعل من العضو (${conflict.member || 'عضو آخر'}) في نفس اليوم.`);
        return;
      }
    }

    updateMonthlyReport(report.id, { ...form, branches });
    alert('تم تعديل خطة المتابعة الشهرية بنجاح.');
    navigate('/monthlyreport');
  };

  const adminManagers = managers.filter(m => m.admin === form.admin);
  const availableCenters = form.admin ? (egyptCenters[form.admin] || []) : [];

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center' }}>تعديل خطة المتابعة الشهرية</h2>
      </div>

      <div className="form-wrapper box-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Admin + Member */}
        <div className="form-grid" style={{ marginBottom: '25px' }}>
          <div className="form-group">
            <label>الإدارة <span className="req">*</span></label>
            <select name="admin" className="form-select" value={form.admin} onChange={handleAdminChange}>
              <option value="">اختار الإدارة</option>
              {governorates.map((g, i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>عضو الإدارة <span className="req">*</span></label>
            <select
              name="member"
              className="form-select"
              value={form.member}
              onChange={handleMemberChange}
              disabled={!form.admin}
            >
              <option value="">{form.admin ? 'اختار العضو' : 'اختار الإدارة أولاً'}</option>
              {adminManagers.map((m, i) => <option key={i} value={m.name}>{m.name}</option>)}
            </select>
          </div>
        </div>

        {/* Specialty + Phone */}
        <div className="form-grid" style={{ marginBottom: '25px' }}>
          <div className="form-group">
            <label>التخصص</label>
            <input
              type="text"
              className="form-input"
              value={form.specialty}
              readOnly
              placeholder="التخصص (يظهر تلقائياً)"
            />
          </div>
          <div className="form-group">
            <label>رقم الهاتف</label>
            <input
              type="text"
              className="form-input"
              value={form.phone}
              readOnly
              placeholder="رقم الهاتف (يظهر تلقائياً)"
            />
          </div>
        </div>

        {/* Month + Year */}
        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label>خطة الشهر <span className="req">*</span></label>
          <div className="form-grid">
            <select name="month" className="form-select" value={form.month} onChange={handleChange} disabled={branches.length > 0}>
              <option value="">الشهر</option>
              {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
            <select name="year" className="form-select" value={form.year} onChange={handleChange} disabled={branches.length > 0}>
              <option value="">السنة</option>
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
          </div>
          {branches.length > 0 && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              لا يمكن تغيير الشهر والسنة بعد إضافة زيارات للخطة.
            </span>
          )}
        </div>

        {/* Dynamic Branches with center filtered by admin */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--text-primary)' }}>المتابعات المجدولة</h3>
            <button
              type="button"
              onClick={addBranch}
              className="btn btn-outline"
              style={{ gap: '8px' }}
              disabled={branches.length >= 15}
            >
              <Plus size={16} /> إضافة متابعة
            </button>
          </div>

          {/* Header row */}
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr) 60px', marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>المركز</label>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>الفرع</label>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>التاريخ</label>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>النوع</label>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>حذف</label>
          </div>

          {branches.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
              لا توجد زيارات مسجلة في الخطة حالياً. اضغط على "إضافة متابعة" للبدء.
            </div>
          ) : (
            branches.map((branch, index) => {
              const locked = hasFollowUp(branch.id);
              return (
                <div key={branch.id} className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr) 60px', marginBottom: '15px', alignItems: 'center' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <select
                      className="form-select"
                      value={branch.center}
                      onChange={e => {
                        handleBranchChange(branch.id, 'center', e.target.value);
                        handleBranchChange(branch.id, 'branch', ''); // Reset branch selection when center changes
                      }}
                      disabled={!form.admin || locked}
                      style={locked ? { opacity: 0.65, backgroundColor: 'rgba(255,255,255,0.05)' } : {}}
                    >
                      <option value="">{form.admin ? 'اختار المركز' : 'اختار الإدارة أولاً'}</option>
                      {availableCenters.map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <select
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
                              alert(`عذراً، يوم العمل الموافق للتاريخ المختار هو (${selectedDayName})، وهو ليس من ضمن أيام عمل الفرع المحدد (${selectedBranchObj.workDays.join('، ')}).`);
                              handleBranchChange(branch.id, 'date', '');
                            }
                          }
                        }
                      }}
                      disabled={!branch.center || locked}
                      style={locked ? { opacity: 0.65, backgroundColor: 'rgba(255,255,255,0.05)' } : {}}
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
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    {locked ? (
                      <div
                        className="form-input"
                        style={{
                          opacity: 0.65,
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderRadius: '8px',
                          padding: '12px 15px',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <span>{branch.date}</span>
                        <span>🔒</span>
                      </div>
                    ) : (
                      <CustomDatePicker
                        value={branch.date}
                        onChange={dateValue => handleDateChange(branch.id, dateValue)}
                        branchName={branch.branch}
                        adminName={form.admin}
                        appBranches={appBranches}
                        month={form.month}
                        year={form.year}
                      />
                    )}
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <select
                      className="form-select"
                      value={branch.type}
                      onChange={e => handleBranchChange(branch.id, 'type', e.target.value)}
                      disabled={locked}
                      style={locked ? { opacity: 0.65, backgroundColor: 'rgba(255,255,255,0.05)' } : {}}
                    >
                      <option>مباشر</option>
                      <option>اونلاين</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {locked ? (
                      <div title="تم إرسال تقرير المتابعة لهذه الزيارة، لا يمكن حذفها." style={{ color: 'var(--accent-gold)' }}>
                        <Lock size={18} />
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="action-icon delete"
                        onClick={() => removeBranch(branch.id)}
                        style={{ margin: 0, padding: '8px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" style={{ padding: '10px 40px' }} onClick={handleSubmit}>حفظ التعديلات</button>
        <Link to="/monthlyreport" className="btn btn-outline" style={{ textDecoration: 'none', padding: '10px 40px' }}>إلغاء</Link>
      </div>
    </div>
  );
}

function CustomDatePicker({ value, onChange, branchName, adminName, appBranches, month, year }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!branchName) {
    return (
      <input
        type="text"
        className="form-input"
        placeholder="اختار الفرع أولاً"
        disabled
        style={{ width: '100%' }}
      />
    );
  }

  if (!month || !year) {
    return (
      <input
        type="text"
        className="form-input"
        placeholder="حدد خطة الشهر أولاً"
        disabled
        style={{ width: '100%' }}
      />
    );
  }

  const selectedBranchObj = appBranches.find(b => b.admin === adminName && b.name === branchName);
  const workDays = selectedBranchObj?.workDays || [];

  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);

  const firstDayOfMonth = new Date(yearNum, monthNum - 1, 1);
  const totalDays = new Date(yearNum, monthNum, 0).getDate();

  const getSaturdayIndexedDay = (jsDay) => (jsDay + 1) % 7;
  const startOffset = getSaturdayIndexedDay(firstDayOfMonth.getDay());

  const jsDayToArabic = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const weekDaysAr = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  const cells = [];
  // Add empty cells for offset
  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: null, dateStr: '', isWorkDay: false });
  }

  // Add month days
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(yearNum, monthNum - 1, d);
    const dayName = jsDayToArabic[dateObj.getDay()];
    const isWorkDay = workDays.includes(dayName);

    const mStr = String(monthNum).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    const dateStr = `${yearNum}-${mStr}-${dStr}`;

    cells.push({
      day: d,
      dateStr,
      isWorkDay
    });
  }

  const handleDateSelect = (dateStr) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const displayValue = value ? value : 'اختار التاريخ';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="form-input"
        style={{
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#11141D',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '12px 15px',
          color: value ? 'var(--text-primary)' : '#888'
        }}
      >
        <span>{displayValue}</span>
        <span style={{ fontSize: '14px' }}>📅</span>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            marginTop: '8px',
            backgroundColor: '#11141d',
            border: '1px solid var(--accent-gold-dark)',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              direction: 'rtl'
            }}
          >
            <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)', fontSize: '13px' }}>
              {months.find(m => m.v === month)?.l} {year}
            </span>
          </div>

          {/* Weekday Names Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              textAlign: 'center',
              marginBottom: '6px',
              direction: 'rtl'
            }}
          >
            {weekDaysAr.map((wd, index) => (
              <span key={index} style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                {wd.substring(0, 3)}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              textAlign: 'center',
              direction: 'rtl'
            }}
          >
            {cells.map((cell, index) => {
              if (cell.day === null) {
                return <div key={`empty-${index}`} />;
              }

              const isSelected = value === cell.dateStr;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => cell.isWorkDay && handleDateSelect(cell.dateStr)}
                  disabled={!cell.isWorkDay}
                  style={{
                    padding: '6px 0',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: isSelected 
                      ? 'var(--accent-gold)' 
                      : 'transparent',
                    color: isSelected 
                      ? '#000' 
                      : cell.isWorkDay 
                        ? 'var(--text-primary)' 
                        : 'var(--text-muted)',
                    opacity: cell.isWorkDay ? 1 : 0.25,
                    cursor: cell.isWorkDay ? 'pointer' : 'not-allowed',
                    pointerEvents: cell.isWorkDay ? 'auto' : 'none',
                    fontSize: '12px',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    transition: 'all 0.1s ease',
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthlyReportEdit;
