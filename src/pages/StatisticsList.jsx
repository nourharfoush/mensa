import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX } from '../utils/xlsxHelper';
import egyptCenters from '../data/egyptCenters';

function StatisticsList() {
  const { 
    managers, monthlyReports, followUpReports, 
    sessions, sessionReports, attendances, mohfezs 
  } = useAppData();

  // Get current user and role
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const role = currentUser ? currentUser.role : 'admin';
  const userAdmin = currentUser ? currentUser.userAdmin : '';
  const userBranch = currentUser ? currentUser.userBranch : '';

  const isSuperAdmin = ['admin', 'rowaq_admin'].includes(role);
  const isRowaqStaff = ['rowaq_manager', 'rowaq_tech', 'rowaq_member'].includes(role);
  const isBranchCoordinator = ['branch_admin_coordinator', 'branch_scientific_coordinator'].includes(role);
  const isMohfez = ['mohfez', 'platform_mohfez'].includes(role);

  const [filterAdmin, setFilterAdmin] = useState(isRowaqStaff && userAdmin ? userAdmin : '');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  React.useEffect(() => {
    if (isRowaqStaff && userAdmin) {
      setFilterAdmin(userAdmin);
    }
  }, [currentUser]);

  const governorates = Object.keys(egyptCenters);

  const months = [
    {v:'1',l:'يناير'},{v:'2',l:'فبراير'},{v:'3',l:'مارس'},{v:'4',l:'أبريل'},
    {v:'5',l:'مايو'},{v:'6',l:'يونيو'},{v:'7',l:'يوليو'},{v:'8',l:'أغسطس'},
    {v:'9',l:'سبتمبر'},{v:'10',l:'أكتوبر'},{v:'11',l:'نوفمبر'},{v:'12',l:'ديسمبر'}
  ];

  const normalizeArabic = (str) => {
    if (!str) return '';
    return str
      .toString()
      .trim()
      .normalize('NFKD')
      .normalize('NFC')
      .replace(/ً/g, '')
      .replace(/ٌ/g, '')
      .replace(/ٍ/g, '')
      .replace(/َ/g, '')
      .replace(/ُ/g, '')
      .replace(/ِ/g, '')
      .replace(/ّ/g, '')
      .replace(/ْ/g, '')
      .replace(/[أإآا]/g, 'ا')
      .replace(/[ىي]/g, 'ي')
      .replace(/[ة]/g, 'ه')
      .replace(/[ـ]/g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .trim();
  };

  const filtered = managers.filter(m => {
    if (isRowaqStaff && userAdmin && normalizeArabic(m.admin) !== normalizeArabic(userAdmin)) return false;
    return filterAdmin ? normalizeArabic(m.admin) === normalizeArabic(filterAdmin) : true;
  });

  // Helper to dynamically calculate stats for a manager under active filters
  const getManagerStats = (managerName) => {
    // 1) Find all monthly reports for this manager
    let mReports = monthlyReports.filter(r => r.member === managerName);
    
    // Apply filters
    if (filterAdmin) mReports = mReports.filter(r => r.admin === filterAdmin);
    if (filterYear) mReports = mReports.filter(r => r.year === filterYear);
    if (filterMonth) mReports = mReports.filter(r => r.month === filterMonth);

    // 2) Sum planned visits (branches length)
    let plannedCount = 0;
    mReports.forEach(r => {
      plannedCount += r.branches?.length || 0;
    });

    // 3) Find created follow-up reports
    const createdReports = followUpReports.filter(fr => 
      fr.followerName === managerName && mReports.some(r => r.id === fr.monthlyReportId)
    );
    const createdCount = createdReports.length;

    // 4) Find confirmed follow-up reports
    const confirmedCount = createdReports.filter(fr => fr.isConfirmed).length;

    return {
      plannedCount,
      createdCount,
      confirmedCount
    };
  };

  const handleExport = () => {
    const exportData = filtered.map(m => {
      const stats = getManagerStats(m.name);
      return {
        'الإدارة': m.admin,
        'عضو الإدارة': m.name,
        'التخصص': m.specialty,
        'المتابعات المخططة': stats.plannedCount,
        'التقارير التي تم إنشاؤها': stats.createdCount,
        'التقارير التي تم تأكيدها': stats.confirmedCount,
      };
    });
    exportToXLSX(exportData, 'إحصائيات_تقارير_المتابعة', 'إحصائيات تقارير المتابعة لأعضاء الإدارة');
  };

  // --- Mohfez Monthly Report Logic ---

  const isReportInMonthAndYear = (reportDate, year, month) => {
    if (!reportDate) return false;
    const normalized = reportDate.replace(/\//g, '-');
    const parts = normalized.split('-');
    if (parts.length < 2) return false;
    const rYear = parts[0];
    const rMonth = parseInt(parts[1], 10).toString();
    
    const matchYear = year ? String(rYear) === String(year) : true;
    const matchMonth = month ? String(rMonth) === String(month) : true;
    
    return matchYear && matchMonth;
  };

  // Filter Mohfezs list based on geographic permissions and filter select
  const filteredMohfezs = (mohfezs || []).filter(m => {
    if (isRowaqStaff && userAdmin && normalizeArabic(m.admin) !== normalizeArabic(userAdmin)) return false;
    if (isBranchCoordinator && userBranch && normalizeArabic(m.branch) !== normalizeArabic(userBranch)) return false;
    if (filterAdmin && normalizeArabic(m.admin) !== normalizeArabic(filterAdmin)) return false;
    return true;
  });

  const getMohfezMonthlyStats = (m) => {
    const mohfezSessions = (sessions || []).filter(s => 
      normalizeArabic(s.mohfez) === normalizeArabic(m.name) && 
      !s.isPlatform
    );

    let actualSessionsCount = 0;
    let totalHours = 0.0;

    mohfezSessions.forEach(session => {
      const reports = (sessionReports || []).filter(r => 
        String(r.sessionId) === String(session.id) && 
        !r.isPlatform &&
        isReportInMonthAndYear(r.date, filterYear, filterMonth)
      );

      actualSessionsCount += reports.length;

      reports.forEach(r => {
        const attendance = (attendances || []).find(a => 
          String(a.sessionId) === String(session.id) && 
          !a.isPlatform &&
          a.date && r.date &&
          a.date.replace(/\//g, '-') === r.date.replace(/\//g, '-')
        );

        const presentCount = attendance ? (attendance.presentCount || 0) : 0;
        
        let sessionDuration = 1.0;
        if (presentCount < 6) {
          sessionDuration = 1.0;
        } else if (presentCount === 6 || presentCount === 7) {
          sessionDuration = 1.5;
        } else {
          sessionDuration = 2.0;
        }

        // Cap by original session duration
        if (session.time_start && session.time_end) {
          const [startH, startM] = session.time_start.split(':').map(Number);
          const [endH, endM] = session.time_end.split(':').map(Number);
          const diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
          if (diffMinutes > 0) {
            const originalHours = diffMinutes / 60;
            if (sessionDuration > originalHours) {
              sessionDuration = originalHours;
            }
          }
        }

        totalHours += sessionDuration;
      });
    });

    return {
      assignedCount: mohfezSessions.length,
      actualSessionsCount,
      totalHours
    };
  };

  const handleExportMohfezs = () => {
    const exportData = filteredMohfezs.map(m => {
      const stats = getMohfezMonthlyStats(m);
      return {
        'اسم المحفظ': m.name || '',
        'الإدارة': m.admin || '',
        'المركز': m.center || '',
        'الفرع': m.branch || '',
        'عدد الحلقات المسندة': stats.assignedCount,
        'عدد الجلسات الفعلية': stats.actualSessionsCount,
        'إجمالي الساعات المنجزة': stats.totalHours,
      };
    });
    exportToXLSX(exportData, 'التقرير_الشهري_للمحفظين', 'التقرير الشهري للمحفظين');
  };

  if (isMohfez) {
    return (
      <div className="management-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', direction: 'rtl' }}>
        <div className="box-card" style={{ textAlign: 'center', maxWidth: '500px', padding: '40px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '15px' }}>عذراً، ليس لديك صلاحية لعرض هذا القسم</h3>
          <p style={{ color: 'var(--text-secondary)' }}>يرجى التواصل مع مدير النظام للحصول على الصلاحيات اللازمة.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-page" style={{ direction: 'rtl' }}>
      <div className="page-header">
        <div className="title-section">
          <h2>إدارة تقارير المتابعة</h2>
          <p>إدارة وعرض قائمة التقارير والزيارات الفعلية المسجلة في النظام</p>
        </div>
      </div>

      <div className="search-section box-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '20px' }}>
          <div className="form-group">
            <label>الإدارة</label>
            <select className="form-select" value={filterAdmin} onChange={e => setFilterAdmin(e.target.value)} disabled={isRowaqStaff && !!userAdmin}>
              <option value="">--- اختار المحافظة ---</option>
              {governorates.map((g,i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>العام</label>
            <select className="form-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="">--- اختار العام ---</option>
              {[2024,2025,2026,2027,2028,2029,2030].map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>الشهر</label>
            <select className="form-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              <option value="">--- اختار الشهر ---</option>
              {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
          </div>
        </div>
        <div className="search-actions" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
          <button className="btn btn-primary"><Search size={16} /> بحث</button>
          <button className="btn btn-outline" onClick={() => { 
            if (!isRowaqStaff || !userAdmin) setFilterAdmin(''); 
            setFilterYear(''); 
            setFilterMonth(''); 
          }}>إعادة تعيين</button>
        </div>
      </div>

      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <div className="action-buttons">
          <button className="btn btn-outline" onClick={handleExport}><Download size={16} /> تصدير</button>
        </div>
        <div className="table-stats">النتائج ({filtered.length})</div>
      </div>

      <div className="table-wrapper box-card" style={{ marginBottom: '40px' }}>
        <table className="management-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>الإدارة</th>
              <th style={{ textAlign: 'center' }}>عضو الإدارة</th>
              <th style={{ textAlign: 'center' }}>التخصص</th>
              <th style={{ textAlign: 'center' }}>المتابعات المخططة</th>
              <th style={{ textAlign: 'center' }}>التقارير التي تم إنشاؤها</th>
              <th style={{ textAlign: 'center' }}>التقارير التي تم تأكيدها</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  لا توجد بيانات. أضف أعضاء إدارة أولاً.
                </td>
              </tr>
            ) : (
              filtered.map(m => {
                const stats = getManagerStats(m.name);
                return (
                  <tr key={m.id}>
                    <td style={{ textAlign: 'center' }}>{m.admin}</td>
                    <td style={{ textAlign: 'center' }}>{m.name}</td>
                    <td style={{ textAlign: 'center' }}>{m.specialty}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{stats.plannedCount}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#10b981' }}>{stats.createdCount}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#047857' }}>{stats.confirmedCount}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* --- Mohfez Monthly Report Section --- */}
      <div className="page-header" style={{ marginTop: '20px', borderTop: '2px solid var(--border-subtle)', paddingTop: '20px' }}>
        <div className="title-section">
          <h2>التقرير الشهري للمحفظين</h2>
          <p>عرض وحساب عدد الجلسات الفعلية وإجمالي الساعات المنجزة للمحفظين وفقاً للحضور وزمن الحلقة الأصلي</p>
        </div>
      </div>

      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <div className="action-buttons">
          <button className="btn btn-outline" onClick={handleExportMohfezs}><Download size={16} /> تصدير تقرير المحفظين</button>
        </div>
        <div className="table-stats">عدد المحفظين ({filteredMohfezs.length})</div>
      </div>

      <div className="table-wrapper box-card">
        <table className="management-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>اسم المحفظ</th>
              <th style={{ textAlign: 'center' }}>الإدارة</th>
              <th style={{ textAlign: 'center' }}>المركز</th>
              <th style={{ textAlign: 'center' }}>الفرع</th>
              <th style={{ textAlign: 'center' }}>الحلقات المسندة</th>
              <th style={{ textAlign: 'center' }}>الجلسات الفعلية</th>
              <th style={{ textAlign: 'center' }}>إجمالي الساعات</th>
            </tr>
          </thead>
          <tbody>
            {filteredMohfezs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  لا توجد بيانات محفظين مطابقة للفلاتر النشطة أو نطاق صلاحيتك.
                </td>
              </tr>
            ) : (
              filteredMohfezs.map(m => {
                const stats = getMohfezMonthlyStats(m);
                return (
                  <tr key={m.id}>
                    <td style={{ textAlign: 'center' }}>{m.name}</td>
                    <td style={{ textAlign: 'center' }}>{m.admin}</td>
                    <td style={{ textAlign: 'center' }}>{m.center}</td>
                    <td style={{ textAlign: 'center' }}>{m.branch}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{stats.assignedCount}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#3b82f6' }}>{stats.actualSessionsCount}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#10b981' }}>{stats.totalHours.toFixed(1)} ساعة</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StatisticsList;
