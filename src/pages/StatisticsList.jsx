import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX } from '../utils/xlsxHelper';
import egyptCenters from '../data/egyptCenters';

function StatisticsList() {
  const { managers, monthlyReports, followUpReports } = useAppData();
  const [filterAdmin, setFilterAdmin] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const governorates = Object.keys(egyptCenters);

  const months = [
    {v:'1',l:'يناير'},{v:'2',l:'فبراير'},{v:'3',l:'مارس'},{v:'4',l:'أبريل'},
    {v:'5',l:'مايو'},{v:'6',l:'يونيو'},{v:'7',l:'يوليو'},{v:'8',l:'أغسطس'},
    {v:'9',l:'سبتمبر'},{v:'10',l:'أكتوبر'},{v:'11',l:'نوفمبر'},{v:'12',l:'ديسمبر'}
  ];

  const filtered = managers.filter(m =>
    filterAdmin ? m.admin === filterAdmin : true
  );

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
            <select className="form-select" value={filterAdmin} onChange={e => setFilterAdmin(e.target.value)}>
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
          <button className="btn btn-outline" onClick={() => { setFilterAdmin(''); setFilterYear(''); setFilterMonth(''); }}>إعادة تعيين</button>
        </div>
      </div>

      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <div className="action-buttons">
          <button className="btn btn-outline" onClick={handleExport}><Download size={16} /> تصدير</button>
        </div>
        <div className="table-stats">النتائج ({filtered.length})</div>
      </div>

      <div className="table-wrapper box-card">
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
    </div>
  );
}

export default StatisticsList;
