import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, Upload, Edit, Trash2 } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX, importFromXLSX } from '../utils/xlsxHelper';
import egyptCenters from '../data/egyptCenters';

const governorates = Object.keys(egyptCenters);
const workDaysList = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

function BranchesList() {
  const { branches, deleteBranch, addBranch, hasPermission, sessions, coordinators, mohfezs, students } = useAppData();
  const importRef = useRef(null);

  // Get current user and role
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const role = currentUser ? currentUser.role : 'admin';
  const userAdmin = currentUser ? currentUser.userAdmin : '';
  const userCenter = currentUser ? currentUser.userCenter : '';
  const userBranch = currentUser ? currentUser.userBranch : '';
  const userSession = currentUser ? currentUser.userSession : '';

  const isSuperAdmin = role === 'admin';
  const isRowaqAdmin = role === 'rowaq_admin';
  const isRowaqStaff = ['rowaq_manager', 'rowaq_tech', 'rowaq_member'].includes(role);
  const isBranchCoordinator = ['branch_admin_coordinator', 'branch_scientific_coordinator'].includes(role);
  const isMohfez = role === 'mohfez';

  const [filterName, setFilterName] = useState('');
  const [filterAdmin, setFilterAdmin] = useState(isRowaqStaff || isBranchCoordinator || isMohfez ? userAdmin : '');
  const [filterCenter, setFilterCenter] = useState(isBranchCoordinator || isMohfez ? userCenter : '');
  const [filterWorkDay, setFilterWorkDay] = useState('');

  // Sync filters with user profile if role is restricted
  React.useEffect(() => {
    if ((isRowaqStaff || isMohfez) && userAdmin) {
      setFilterAdmin(userAdmin);
    }
    if (isBranchCoordinator || isMohfez) {
      if (userAdmin) setFilterAdmin(userAdmin);
      if (userCenter) setFilterCenter(userCenter);
    }
  }, [currentUser]);

  const availableCenters = filterAdmin ? (egyptCenters[filterAdmin] || []) : [];

  const normalizeArabic = (str) => {
    if (!str) return '';
    return str
      .toString()
      .trim()
      .normalize('NFKD')  // Use NFKD for stronger decomposition
      .normalize('NFC')   // Then recompose
      .replace(/ً/g, '')  // Remove FATHATAN
      .replace(/ٌ/g, '')  // Remove DAMMATAN
      .replace(/ٍ/g, '')  // Remove KASRATAN
      .replace(/َ/g, '')  // Remove FATHA
      .replace(/ُ/g, '')  // Remove DAMMA
      .replace(/ِ/g, '')  // Remove KASRA
      .replace(/ّ/g, '')  // Remove SHADDA
      .replace(/ْ/g, '')  // Remove SUKUN
      .replace(/[أإآا]/g, 'ا')  // Normalize all forms of alef
      .replace(/[ىي]/g, 'ي')    // Normalize ya
      .replace(/[ة]/g, 'ه')      // Normalize ta marbuta
      .replace(/[ـ]/g, '')       // Remove Arabic tatweel
      .replace(/\s+/g, ' ')      // Normalize spaces
      .toLowerCase()
      .trim();
  };

  const filtered = branches.filter(b => {
    // 1. Geographic role restrictions
    if (isRowaqStaff && userAdmin && normalizeArabic(b.admin) !== normalizeArabic(userAdmin)) return false;
    if (isBranchCoordinator && userBranch && normalizeArabic(b.name) !== normalizeArabic(userBranch)) return false;
    if (isMohfez) {
      const mohfezSession = sessions.find(s => String(s.id) === String(userSession) || s.session_name === userSession);
      if (mohfezSession && normalizeArabic(b.name) !== normalizeArabic(mohfezSession.branchName)) return false;
      if (!mohfezSession && userBranch && normalizeArabic(b.name) !== normalizeArabic(userBranch)) return false;
    }

    // 2. Normal filters
    return (
      (filterName ? normalizeArabic(b.name).includes(normalizeArabic(filterName)) : true) &&
      (filterAdmin ? normalizeArabic(b.admin) === normalizeArabic(filterAdmin) : true) &&
      (filterCenter ? normalizeArabic(b.center) === normalizeArabic(filterCenter) : true) &&
      (filterWorkDay 
        ? (filterWorkDay === 'لا يعمل' 
            ? (!b.workDays || b.workDays.length === 0 || b.workDays.some(d => normalizeArabic(d) === normalizeArabic('لا يعمل')))
            : (b.workDays || []).some(d => normalizeArabic(d) === normalizeArabic(filterWorkDay))
          )
        : true)
    );
  });

  const handleExport = () => {
    const formatTimeTo12Hour = (timeStr) => {
      if (!timeStr) return '';
      const parts = timeStr.split(':');
      if (parts.length < 2) return timeStr;
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      if (isNaN(hours)) return timeStr;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hourFormatted = String(hours).padStart(2, '0');
      return `${hourFormatted}:${minutes} ${ampm}`;
    };

    const exportData = filtered.map(b => ({
      'الكود': b.id,
      'فرع': b.name,
      'العنوان': b.address || '',
      'الهاتف': b.phone || '',
      'رقم القرار': b.decision_no || '',
      'ايام العمل': (b.workDays && b.workDays.length > 0)
        ? b.workDays.map(d => d === 'الأحد' ? 'الاحد' : d).join(',')
        : 'لا يعمل',
      'الوقت من': formatTimeTo12Hour(b.timeFrom),
      'الوقت الي': formatTimeTo12Hour(b.timeTo),
      'الإدارة': b.admin || '',
      'المركز': b.center || '',
      'المحفّظين': mohfezs.filter(m => 
        normalizeArabic(m.branch) === normalizeArabic(b.name) && 
        normalizeArabic(m.admin) === normalizeArabic(b.admin) && 
        normalizeArabic(m.center) === normalizeArabic(b.center)
      ).length,
      'المنسّقين': coordinators.filter(c => 
        normalizeArabic(c.branch) === normalizeArabic(b.name) && 
        normalizeArabic(c.admin) === normalizeArabic(b.admin) && 
        normalizeArabic(c.center) === normalizeArabic(b.center)
      ).length,
      'الحلقات': sessions.filter(s => 
        normalizeArabic(s.branch) === normalizeArabic(b.name) && 
        normalizeArabic(s.admin) === normalizeArabic(b.admin) && 
        normalizeArabic(s.center) === normalizeArabic(b.center)
      ).length,
      'الدارسين': students.filter(s => 
        normalizeArabic(s.branch) === normalizeArabic(b.name) && 
        normalizeArabic(s.admin) === normalizeArabic(b.admin) && 
        normalizeArabic(s.center) === normalizeArabic(b.center)
      ).length,
    }));
    exportToXLSX(exportData, 'الفروع', 'إدارة الفروع');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await importFromXLSX(file);
      
      const parseTimeTo24Hour = (timeStr) => {
        if (!timeStr) return '';
        timeStr = timeStr.toString().trim();
        const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (match) {
          let hours = parseInt(match[1], 10);
          const minutes = match[2];
          const ampm = match[3].toUpperCase();
          if (ampm === 'PM' && hours < 12) {
            hours += 12;
          } else if (ampm === 'AM' && hours === 12) {
            hours = 0;
          }
          return `${String(hours).padStart(2, '0')}:${minutes}`;
        }
        return timeStr;
      };

      rows.forEach(row => {
        const workDaysRaw = row['ايام العمل'] || row['أيام العمل'] || '';
        const workDays = workDaysRaw 
          ? workDaysRaw.split(/[，,،]/).map(d => d.trim()).filter(Boolean) 
          : [];
        const cleanWorkDays = workDays.map(d => d === 'الاحد' ? 'الأحد' : d);

        addBranch({
          name: row['فرع'] || row['اسم الفرع'] || '',
          admin: row['الإدارة'] || '',
          center: row['المركز'] || '',
          decision_no: row['رقم القرار'] || '',
          address: row['العنوان'] || '',
          phone: row['الهاتف'] || '',
          workDays: cleanWorkDays,
          timeFrom: parseTimeTo24Hour(row['الوقت من'] || row['من'] || ''),
          timeTo: parseTimeTo24Hour(row['الوقت الي'] || row['الوقت إلى'] || row['إلى'] || ''),
        });
      });
      alert('تم استيراد البيانات بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في استيراد الملف');
    }
    e.target.value = '';
  };

  if (!hasPermission('branches', 'view')) {
    return (
      <div className="management-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="box-card" style={{ textAlign: 'center', maxWidth: '500px', padding: '40px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '15px' }}>عذراً، ليس لديك صلاحية لعرض هذا القسم</h3>
          <p style={{ color: 'var(--text-secondary)' }}>يرجى التواصل مع مدير النظام للحصول على الصلاحيات اللازمة.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-page">
      <div className="page-header">
        <div className="title-section">
          <h2>إدارة الفروع</h2>
          <p>إدارة وعرض قائمة الفروع المسجلة في النظام</p>
        </div>
      </div>

      {/* Search Filters */}
      <div className="search-section box-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '20px' }}>
          <div className="form-group">
            <label>اسم الفرع</label>
            <input type="text" className="form-input" placeholder="ابحث باسم الفرع" value={filterName} onChange={e => setFilterName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>الإدارة</label>
            <select className="form-select" value={filterAdmin} onChange={e => { setFilterAdmin(e.target.value); setFilterCenter(''); }} disabled={isRowaqStaff || isBranchCoordinator || isMohfez}>
              <option value="">--- اختار المحافظة ---</option>
              {governorates.map((g, i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>المركز <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>*</span></label>
            <select className="form-select" value={filterCenter} onChange={e => setFilterCenter(e.target.value)} disabled={!filterAdmin || isBranchCoordinator || isMohfez}>
              <option value="">{filterAdmin ? 'اختار المركز' : 'اختار الإدارة أولاً'}</option>
              {availableCenters.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>أيام العمل</label>
            <select className="form-select" value={filterWorkDay} onChange={e => setFilterWorkDay(e.target.value)}>
              <option value="">--- اختار اليوم ---</option>
              {workDaysList.map((d, i) => <option key={i} value={d}>{d}</option>)}
              <option value="لا يعمل">لا يعمل</option>
            </select>
          </div>
        </div>
        <div className="search-actions" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
          <button className="btn btn-primary"><Search size={16} /> بحث</button>
          <button className="btn btn-outline" onClick={() => { 
            setFilterName(''); 
            if (!isRowaqStaff && !isBranchCoordinator && !isMohfez) setFilterAdmin(''); 
            if (!isBranchCoordinator && !isMohfez) setFilterCenter(''); 
            setFilterWorkDay(''); 
          }}>إعادة تعيين</button>
        </div>
      </div>

      {/* Table controls */}
      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <div className="action-buttons" style={{ flexDirection: 'row-reverse' }}>
          {hasPermission('branches', 'add') && (
            <>
              <Link to="/branches/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                <Plus size={16} /> إضافة فرع
              </Link>
              <button className="btn btn-gold-outline" onClick={() => importRef.current.click()}>
                <Upload size={16} /> استيراد
              </button>
              <input ref={importRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleImport} />
            </>
          )}
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={16} /> تصدير
          </button>
        </div>
        <div className="table-stats">النتائج ({filtered.length})</div>
      </div>

      <div className="table-wrapper box-card">
        <table className="management-table">
          <thead>
            <tr>
              <th>اسم الفرع</th>
              <th>الإدارة</th>
              <th>المركز</th>
              <th>رقم القرار</th>
              <th>المنسقين</th>
              <th>أيام العمل</th>
              <th>من</th>
              <th>إلى</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  لا توجد بيانات. قم بإضافة فرع جديد أو استيراد ملف xlsx.
                </td>
              </tr>
            ) : (
              filtered.map(b => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.admin}</td>
                  <td>{b.center}</td>
                  <td>{b.decision_no}</td>
                  <td>{b.coordinators || 'لا يوجد منسقين'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(b.workDays || []).map((d, i) => (
                        <span key={i} style={{ background: '#3b82f620', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{b.timeFrom || '-'}</td>
                  <td>{b.timeTo || '-'}</td>
                  <td className="actions-cell">
                    {hasPermission('branches', 'edit') && (
                      <Link to={`/branches/create?id=${b.id}`} className="action-icon edit" style={{textDecoration: 'none', color: 'inherit'}}><Edit size={16}/></Link>
                    )}
                    {hasPermission('branches', 'delete') && (
                      <button className="action-icon delete" onClick={() => deleteBranch(b.id)}><Trash2 size={16}/></button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BranchesList;
