import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Download, Upload, Trash2 } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX, importFromXLSX } from '../utils/xlsxHelper';
import egyptCenters from '../data/egyptCenters';

function MonthlyReportList() {
  const { monthlyReports, deleteMonthlyReport, followUpReports, managers, addMonthlyReport } = useAppData();
  const navigate = useNavigate();

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const role = currentUser ? currentUser.role : 'admin';
  const canAddOrEdit = ['admin', 'rowaq_admin', 'rowaq_manager', 'rowaq_tech'].includes(role);

  const isEditAllowed = (report) => {
    if (['admin', 'rowaq_admin'].includes(role)) return true;
    if (!['rowaq_manager', 'rowaq_tech'].includes(role)) return false;

    const today = new Date();
    const limitDate = new Date(parseInt(report.year, 10), parseInt(report.month, 10) - 1, 3, 23, 59, 59);
    return today <= limitDate;
  };
  const [filterAdmin, setFilterAdmin] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [selectedReportId, setSelectedReportId] = useState(null);
  const importRef = useRef(null);

  const governorates = Object.keys(egyptCenters);

  const months = [
    {v:'1',l:'يناير'},{v:'2',l:'فبراير'},{v:'3',l:'مارس'},{v:'4',l:'أبريل'},
    {v:'5',l:'مايو'},{v:'6',l:'يونيو'},{v:'7',l:'يوليو'},{v:'8',l:'أغسطس'},
    {v:'9',l:'سبتمبر'},{v:'10',l:'أكتوبر'},{v:'11',l:'نوفمبر'},{v:'12',l:'ديسمبر'}
  ];

  const adminManagers = filterAdmin ? managers.filter(m => m.admin === filterAdmin) : managers;

  const filtered = monthlyReports.filter(r =>
    (filterAdmin ? r.admin === filterAdmin : true) &&
    (filterMember ? r.member === filterMember : true) &&
    (filterYear ? r.year === filterYear : true) &&
    (filterMonth ? r.month === filterMonth : true)
  );

  const selectedReport = monthlyReports.find(r => r.id === selectedReportId);

  const handleExport = () => {
    const exportData = filtered.map(r => ({
      'الإدارة': r.admin,
      'عضو الإدارة': r.member,
      'خطة الشهر': `${r.month} / ${r.year}`,
      'التخصص': r.specialty,
      'رقم الهاتف': r.phone,
      'عدد المتابعات المجدولة': r.branches?.length || 0,
    }));
    exportToXLSX(exportData, 'المتابعات_الشهرية', 'قائمة المتابعات الشهرية المخططة');
  };

  const handleImport = async (e) => {
    if (!canAddOrEdit) {
      alert('ليس لديك صلاحية لاستيراد المتابعات.');
      return;
    }
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await importFromXLSX(file);
      if (!rows || rows.length === 0) {
        alert('الملف فارغ أو يحتوي على بيانات غير صالحة');
        return;
      }
      rows.forEach(row => {
        const admin = row['الإدارة'] || '';
        const member = row['عضو الإدارة'] || '';
        const planMonthYear = String(row['خطة الشهر'] || '');
        const parts = planMonthYear.split('/').map(p => p.trim());
        const month = parts[0] || '1';
        const year = parts[1] || '2026';

        // Check if report already exists for this member, month, and year
        const isDuplicate = monthlyReports.some(r => 
          r.member === member && String(r.month) === String(month) && String(r.year) === String(year)
        );

        if (!isDuplicate) {
          addMonthlyReport({
            admin,
            member,
            month,
            year,
            specialty: row['التخصص'] || '',
            phone: row['رقم الهاتف'] || '',
            branches: [] // Start with no visits, which can be edited/added in UI
          });
        }
      });
      alert('تم استيراد المتابعات الشهرية بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في استيراد الملف');
    }
    e.target.value = '';
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <div className="title-section">
          <h2>إدارة المتابعات الشهرية</h2>
          <p>إدارة وعرض قائمة المتابعة الدورية في النظام</p>
        </div>
      </div>

      <div className="search-section box-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '20px' }}>
          <div className="form-group">
            <label>الإدارة</label>
            <select className="form-select" value={filterAdmin} onChange={e => { setFilterAdmin(e.target.value); setFilterMember(''); }}>
              <option value="">--- اختار الإدارة ---</option>
              {governorates.map((g,i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>عضو الإدارة</label>
            <select className="form-select" value={filterMember} onChange={e => setFilterMember(e.target.value)}>
              <option value="">--- اختار العضو ---</option>
              {adminManagers.map((m,i) => <option key={i} value={m.name}>{m.name}</option>)}
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
          <button className="btn btn-primary" onClick={() => {}}>
            <Search size={16} /> بحث
          </button>
          <button className="btn btn-outline" onClick={() => { setFilterAdmin(''); setFilterMember(''); setFilterYear(''); setFilterMonth(''); setSelectedReportId(null); }}>
            إعادة تعيين
          </button>
        </div>
      </div>

      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <div className="action-buttons" style={{ flexDirection: 'row-reverse' }}>
          {canAddOrEdit && (
            <>
              <Link to="/monthlyreport/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                + إضافة متابعة شهرية
              </Link>
              <button className="btn btn-gold-outline" onClick={() => importRef.current.click()}>
                <Upload size={16} /> استيراد
              </button>
              <input ref={importRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleImport} />
            </>
          )}
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
              <th style={{ textAlign: 'center' }}>خطة الشهر</th>
              <th style={{ textAlign: 'center' }}>التخصص</th>
              <th style={{ textAlign: 'center' }}>رقم الهاتف</th>
              <th style={{ textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  لا توجد بيانات. قم بإضافة متابعة شهرية جديدة.
                </td>
              </tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ textAlign: 'center' }}>{r.admin}</td>
                  <td style={{ textAlign: 'center' }}>{r.member}</td>
                  <td style={{ textAlign: 'center' }}>{r.month} / {r.year}</td>
                  <td style={{ textAlign: 'center' }}>{r.specialty}</td>
                  <td style={{ textAlign: 'center' }}>{r.phone}</td>
                  <td className="actions-cell" style={{ justifyContent: 'center', gap: '8px' }}>
                    <button
                      className="btn"
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedReportId(r.id)}
                    >
                      خطة الشهر
                    </button>
                    {canAddOrEdit && (
                      <button
                        className="btn"
                        style={{
                          backgroundColor: isEditAllowed(r) ? '#d97706' : '#9ca3af',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          cursor: isEditAllowed(r) ? 'pointer' : 'not-allowed',
                        }}
                        onClick={() => {
                          if (isEditAllowed(r)) {
                            navigate(`/monthlyreport/${r.id}/edit`);
                          } else {
                            alert('عذراً، لا يمكن تعديل المتابعة بعد يوم 3 من شهر المتابعة.');
                          }
                        }}
                      >
                        تعديل
                      </button>
                    )}
                    {canAddOrEdit && (
                      <button className="action-icon delete" onClick={() => { deleteMonthlyReport(r.id); if(selectedReportId === r.id) setSelectedReportId(null); }}>
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Daily Plan Table */}
      {selectedReport && (
        <div style={{ marginTop: '35px' }}>
          <div className="page-header" style={{ marginBottom: '15px' }}>
            <div className="title-section">
              <h3>المتابعات الشهرية باليوم ({selectedReport.branches?.length || 0})</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                عرض الخطة التفصيلية للزيارات اليومية لعضو الإدارة: <strong>{selectedReport.member}</strong> لشهر {selectedReport.month} / {selectedReport.year}
              </p>
            </div>
          </div>

          <div className="table-wrapper box-card">
            <table className="management-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>التاريخ</th>
                  <th style={{ textAlign: 'center' }}>إدارة</th>
                  <th style={{ textAlign: 'center' }}>المركز</th>
                  <th style={{ textAlign: 'center' }}>فرع</th>
                  <th style={{ textAlign: 'center' }}>نوع المتابعة</th>
                  <th style={{ textAlign: 'center' }}>عضو الادارة</th>
                  <th style={{ textAlign: 'center' }}>التخصص</th>
                  <th style={{ textAlign: 'center' }}>الهاتف</th>
                  <th style={{ textAlign: 'center' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {!selectedReport.branches || selectedReport.branches.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                      لا توجد خطة يومية مسجلة.
                    </td>
                  </tr>
                ) : (
                  selectedReport.branches.map(b => {
                    const report = followUpReports.find(r => r.monthlyReportId === selectedReport.id && r.branchVisitId === b.id);
                    
                    // Date Checking: allow creation on follow-up day and up to 2 days after
                    const today = new Date();
                    const visitDate = new Date(b.date);
                    const diffTime = today.setHours(0,0,0,0) - visitDate.setHours(0,0,0,0);
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    const canCreate = diffDays >= 0 && diffDays <= 2;

                    return (
                      <tr key={b.id}>
                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{b.date}</td>
                        <td style={{ textAlign: 'center' }}>{selectedReport.admin}</td>
                        <td style={{ textAlign: 'center' }}>{b.center}</td>
                        <td style={{ textAlign: 'center' }}>{b.branch}</td>
                        <td style={{ textAlign: 'center' }}>{b.type}</td>
                        <td style={{ textAlign: 'center' }}>{selectedReport.member}</td>
                        <td style={{ textAlign: 'center' }}>{selectedReport.specialty}</td>
                        <td style={{ textAlign: 'center' }}>{selectedReport.phone}</td>
                        <td className="actions-cell" style={{ justifyContent: 'center', gap: '8px' }}>
                          {report ? (
                            <>
                              <Link
                                to={`/monthlyreport/${selectedReport.id}/branches/${b.id}/preview`}
                                className="btn"
                                style={{
                                  backgroundColor: '#1f2937',
                                  color: 'white',
                                  border: '1px solid #374151',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  textDecoration: 'none',
                                  display: 'inline-block'
                                }}
                              >
                                معاينة التقرير
                              </Link>
                              <Link
                                to={`/monthlyreport/${selectedReport.id}/branches/${b.id}/confirm`}
                                className="btn"
                                style={{
                                  backgroundColor: report.isConfirmed ? '#047857' : '#059669',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  textDecoration: 'none',
                                  display: 'inline-block'
                                }}
                              >
                                {report.isConfirmed ? 'تأكيد التقرير (مؤكد)' : 'تأكيد التقرير'}
                              </Link>
                            </>
                          ) : canCreate ? (
                            <Link
                              to={`/monthlyreport/${selectedReport.id}/branches/${b.id}/report`}
                              className="btn"
                              style={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                textDecoration: 'none',
                                display: 'inline-block'
                              }}
                            >
                              إنشاء تقرير
                            </Link>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>غير متاح</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthlyReportList;
