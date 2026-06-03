import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, Upload, Edit, Trash2 } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX, importFromXLSX } from '../utils/xlsxHelper';
import egyptCenters from '../data/egyptCenters';

const governorates = Object.keys(egyptCenters);

function MohfezList() {
  const { mohfezs, deleteMohfez, addMohfez, branches, hasPermission } = useAppData();
  const importRef = useRef(null);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'مسّكن':
      case 'نشط':
        return {
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        };
      case 'اجازة':
        return {
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        };
      case 'معتذر':
        return {
          background: 'rgba(107, 114, 128, 0.15)',
          color: '#6b7280',
          border: '1px solid rgba(107, 114, 128, 0.3)'
        };
      case 'انتظار':
        return {
          background: 'rgba(59, 130, 246, 0.15)',
          color: '#3b82f6',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        };
      case 'مستبعد':
      case 'غير نشط':
        return {
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        };
      case 'موقوف':
        return {
          background: 'rgba(139, 92, 246, 0.15)',
          color: '#8b5cf6',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        };
      case 'اُخرى':
        return {
          background: 'rgba(20, 184, 166, 0.15)',
          color: '#14b8a6',
          border: '1px solid rgba(20, 184, 166, 0.3)'
        };
      default:
        return {
          background: 'rgba(107, 114, 128, 0.15)',
          color: '#6b7280',
          border: '1px solid rgba(107, 114, 128, 0.3)'
        };
    }
  };
  
  // Get current user and role
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const role = currentUser ? currentUser.role : 'admin';
  const userAdmin = currentUser ? currentUser.userAdmin : '';
  const userCenter = currentUser ? currentUser.userCenter : '';
  const userBranch = currentUser ? currentUser.userBranch : '';

  const isSuperAdmin = role === 'admin';
  const isRowaqAdmin = role === 'rowaq_admin';
  const isRowaqStaff = ['rowaq_manager', 'rowaq_tech', 'rowaq_member'].includes(role);
  const isBranchCoordinator = ['branch_admin_coordinator', 'branch_scientific_coordinator'].includes(role);
  const isMohfez = role === 'mohfez';

  const [filterName, setFilterName] = useState('');
  const [filterNationalId, setFilterNationalId] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterAdmin, setFilterAdmin] = useState(isRowaqStaff || isBranchCoordinator || isMohfez ? userAdmin : '');
  const [filterCenter, setFilterCenter] = useState(isBranchCoordinator || isMohfez ? userCenter : '');
  const [filterBranch, setFilterBranch] = useState(isBranchCoordinator || isMohfez ? userBranch : '');
  const [filterStatus, setFilterStatus] = useState('');

  // Sync filters with user profile if role is restricted
  React.useEffect(() => {
    if ((isRowaqStaff || isMohfez) && userAdmin) {
      setFilterAdmin(userAdmin);
    }
    if (isBranchCoordinator || isMohfez) {
      if (userAdmin) setFilterAdmin(userAdmin);
      if (userCenter) setFilterCenter(userCenter);
      if (userBranch) setFilterBranch(userBranch);
    }
  }, [currentUser]);

  const availableCenters = filterAdmin ? (egyptCenters[filterAdmin] || []) : [];
  const availableBranches = branches.filter(b => b.admin === filterAdmin && b.center === filterCenter);

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

  const filtered = mohfezs.filter(m => {
    // 1. Geographic role restrictions
    if (isRowaqStaff && userAdmin && normalizeArabic(m.admin) !== normalizeArabic(userAdmin)) return false;
    if (isBranchCoordinator && userBranch && normalizeArabic(m.branch) !== normalizeArabic(userBranch)) return false;
    if (isMohfez && userBranch && normalizeArabic(m.branch) !== normalizeArabic(userBranch)) return false;

    // 2. Normal filters
    return (
      (filterName ? normalizeArabic(m.name).includes(normalizeArabic(filterName)) : true) &&
      (filterNationalId ? normalizeArabic(m.national_id).includes(normalizeArabic(filterNationalId)) : true) &&
      (filterEmail ? normalizeArabic(m.email).includes(normalizeArabic(filterEmail)) : true) &&
      (filterSpecialization ? normalizeArabic(m.specialization) === normalizeArabic(filterSpecialization) : true) &&
      (filterAdmin ? normalizeArabic(m.admin) === normalizeArabic(filterAdmin) : true) &&
      (filterCenter ? normalizeArabic(m.center) === normalizeArabic(filterCenter) : true) &&
      (filterBranch ? normalizeArabic(m.branch) === normalizeArabic(filterBranch) : true) &&
      (filterStatus ? normalizeArabic(m.status) === normalizeArabic(filterStatus) : true)
    );
  });

  const handleExport = () => {
    const exportData = filtered.map(m => ({
      'اسم المحفظ': m.name,
      'الإدارة': m.admin,
      'المركز': m.center,
      'الفرع': m.branch,
      'تاريخ المسابقة': m.contest_date,
      'الرواق': m.rowaq,
      'الرقم القومي': m.national_id,
      'البريد الإلكتروني': m.email,
      'التخصص': m.specialization,
      'الحالة': m.status,
    }));
    exportToXLSX(exportData, 'المحفظين', 'إدارة المحفظين');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await importFromXLSX(file);
      rows.forEach(row => {
        addMohfez({
          name: row['اسم المحفظ'] || '',
          admin: row['الإدارة'] || '',
          center: row['المركز'] || '',
          branch: row['الفرع'] || '',
          contest_date: row['تاريخ المسابقة'] || '',
          rowaq: row['الرواق'] || '',
          national_id: row['الرقم القومي'] || '',
          email: row['البريد الإلكتروني'] || '',
          specialization: row['التخصص'] || '',
          status: row['الحالة'] || '',
        });
      });
      alert('تم استيراد البيانات بنجاح');
    } catch {
      alert('حدث خطأ في استيراد الملف');
    }
    e.target.value = '';
  };

  if (!hasPermission('mohfezs', 'view')) {
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
          <h2>إدارة المحفظين</h2>
          <p>إدارة وعرض قائمة المحفظين المسجلين في النظام</p>
        </div>
      </div>

      {/* Search Filters */}
      <div className="search-section box-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '15px' }}>
          <div className="form-group">
            <label>اسم المحفظ</label>
            <input type="text" className="form-input" placeholder="البحث باسم المحفظ" value={filterName} onChange={e => setFilterName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>الرقم القومي</label>
            <input type="text" className="form-input" placeholder="البحث بالرقم القومي" value={filterNationalId} onChange={e => setFilterNationalId(e.target.value)} />
          </div>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input type="text" className="form-input" placeholder="البحث بالبريد الإلكتروني" value={filterEmail} onChange={e => setFilterEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>التخصص</label>
            <select className="form-select" value={filterSpecialization} onChange={e => setFilterSpecialization(e.target.value)}>
              <option value="">--- اختار التخصص ---</option>
              <option value="إداري">إداري</option>
              <option value="علمي">علمي</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>المحافظة</label>
            <select className="form-select" value={filterAdmin} onChange={e => { setFilterAdmin(e.target.value); setFilterCenter(''); setFilterBranch(''); }} disabled={isRowaqStaff || isBranchCoordinator || isMohfez}>
              <option value="">--- اختار المحافظة ---</option>
              {governorates.map((g, i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>المركز</label>
            <select className="form-select" value={filterCenter} onChange={e => { setFilterCenter(e.target.value); setFilterBranch(''); }} disabled={!filterAdmin || isBranchCoordinator || isMohfez}>
              <option value="">{filterAdmin ? '--- اختار المركز ---' : 'اختار المحافظة أولاً'}</option>
              {availableCenters.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>الفرع</label>
            <select className="form-select" value={filterBranch} onChange={e => setFilterBranch(e.target.value)} disabled={!filterCenter || isBranchCoordinator || isMohfez}>
              <option value="">{filterCenter ? '--- اختار الفرع ---' : 'اختار المركز أولاً'}</option>
              {availableBranches.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>الحالة</label>
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">--- اختار الحالة ---</option>
              <option value="مسّكن">مسّكن</option>
              <option value="اجازة">اجازة</option>
              <option value="اُخرى">اُخرى</option>
              <option value="معتذر">معتذر</option>
              <option value="انتظار">انتظار</option>
              <option value="مستبعد">مستبعد</option>
              <option value="موقوف">موقوف</option>
            </select>
          </div>
        </div>
        <div className="search-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn btn-outline" onClick={() => { 
            setFilterName(''); setFilterNationalId(''); setFilterEmail(''); setFilterSpecialization(''); 
            if (!isRowaqStaff && !isBranchCoordinator && !isMohfez) setFilterAdmin(''); 
            if (!isBranchCoordinator && !isMohfez) setFilterCenter(''); 
            if (!isBranchCoordinator && !isMohfez) setFilterBranch(''); 
            setFilterStatus(''); 
          }}>إعادة تعيين</button>
          <button className="btn btn-primary" style={{ marginRight: '10px' }}><Search size={16} /> بحث</button>
        </div>
      </div>

      {/* Table controls */}
      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <div className="action-buttons" style={{ flexDirection: 'row-reverse' }}>
          {hasPermission('mohfezs', 'add') && (
            <>
              <Link to="/mohfez/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                <Plus size={16} /> إضافة محفظ
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
              <th>اسم المحفظ</th>
              <th>الإدارة</th>
              <th>المركز</th>
              <th>الفرع</th>
              <th>تاريخ المسابقة</th>
              <th>الرواق</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  لا توجد بيانات.
                </td>
              </tr>
            ) : (
              filtered.map(m => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.admin}</td>
                  <td>{m.center}</td>
                  <td>{m.branch}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{m.contest_date}</td>
                  <td>{m.rowaq}</td>
                  <td>
                    <span className="status-badge" style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      ...getStatusStyle(m.status)
                    }}>
                      {m.status || 'غير محدد'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {hasPermission('mohfezs', 'edit') && (
                      <Link to={`/mohfez/create?id=${m.id}`} className="action-icon edit" style={{textDecoration: 'none', color: 'inherit'}}><Edit size={16}/></Link>
                    )}
                    {hasPermission('mohfezs', 'delete') && (
                      <button className="action-icon delete" onClick={() => deleteMohfez(m.id)}><Trash2 size={16}/></button>
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

export default MohfezList;
