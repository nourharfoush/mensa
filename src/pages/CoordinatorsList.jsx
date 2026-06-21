import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, Upload, Edit, Trash2, Archive } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX, importFromXLSX } from '../utils/xlsxHelper';
import egyptCenters from '../data/egyptCenters';

const governorates = Object.keys(egyptCenters);

function CoordinatorsList() {
  const { coordinators, deleteCoordinator, addCoordinator, branches, hasPermission, deleteAllCoordinators, updateCoordinator } = useAppData();
  const importRef = useRef(null);
  
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
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterAdmin, setFilterAdmin] = useState(isRowaqStaff || isBranchCoordinator || isMohfez ? userAdmin : '');
  const [filterCenter, setFilterCenter] = useState(isBranchCoordinator || isMohfez ? userCenter : '');
  const [filterBranch, setFilterBranch] = useState(isBranchCoordinator || isMohfez ? userBranch : '');

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

  // Normalize governorates list for consistent comparison
  const normalizedGovernoratesSet = new Set(governorates.map(g => normalizeArabic(g)));

  const isAllowedToArchive = ['admin', 'rowaq_admin', 'rowaq_manager', 'rowaq_tech'].includes(role);

  const filtered = coordinators.filter(c => {
    if (c.isArchived) return false;
    // 1. Geographic role restrictions
    const cAdmin = c.admin || '';
    const cDecision = c.decision_no || '';
    
    // Normalize both values before checking if they match governorates
    const normalizedAdmin = normalizeArabic(cAdmin);
    const normalizedDecision = normalizeArabic(cDecision);
    
    const isSwapped = 
      cDecision && 
      normalizedGovernoratesSet.has(normalizedDecision) && 
      !normalizedGovernoratesSet.has(normalizedAdmin);
    
    const actualAdmin = isSwapped ? cDecision : cAdmin;
    const actualDecision = isSwapped ? cAdmin : cDecision;

    if (isRowaqStaff && userAdmin && normalizeArabic(actualAdmin) !== normalizeArabic(userAdmin)) return false;
    if (isBranchCoordinator && userBranch && normalizeArabic(c.branch) !== normalizeArabic(userBranch)) return false;
    if (isMohfez && userBranch && normalizeArabic(c.branch) !== normalizeArabic(userBranch)) return false;

    // 2. Normal filters
    const matchName = !filterName || normalizeArabic(c.name).includes(normalizeArabic(filterName));
    const matchSpecialization = !filterSpecialization || normalizeArabic(c.specialization) === normalizeArabic(filterSpecialization);
    const matchAdmin = !filterAdmin || normalizeArabic(actualAdmin) === normalizeArabic(filterAdmin);
    const matchCenter = !filterCenter || normalizeArabic(c.center) === normalizeArabic(filterCenter);
    const matchBranch = !filterBranch || normalizeArabic(c.branch) === normalizeArabic(filterBranch);

    return matchName && matchSpecialization && matchAdmin && matchCenter && matchBranch;
  });

  const handleExport = () => {
    let exportData = filtered.map(c => ({
      'الاسم': c.name || '',
      'التخصص': c.specialization || '',
      'إدارة': c.admin || '',
      'المركز': c.center || '',
      'الفرع': c.branch || '',
      'رقم السجل': c.registry_no || '',
      'الرقم القومي': c.national_id || '',
      'الوظيفة': c.job || '',
      'جهة العمل': c.workplace || '',
      'الدرجة الوظيفية': c.job_grade || '',
      'المؤهل': c.qualification || '',
      'رقم القرار': c.decision_no || '',
      'العنوان': c.address || '',
      'الهاتف': c.phone || '',
    }));

    if (exportData.length === 0) {
      exportData = [{
        'الاسم': '',
        'التخصص': '',
        'إدارة': '',
        'المركز': '',
        'الفرع': '',
        'رقم السجل': '',
        'الرقم القومي': '',
        'الوظيفة': '',
        'جهة العمل': '',
        'الدرجة الوظيفية': '',
        'المؤهل': '',
        'رقم القرار': '',
        'العنوان': '',
        'الهاتف': ''
      }];
    }

    exportToXLSX(exportData, 'المنسقين', 'إدارة المنسقين');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await importFromXLSX(file);
      
      const validRows = rows.filter(row => row['الاسم'] && row['الاسم'].toString().trim() !== '');

      if (validRows.length === 0) {
        alert('الملف فارغ أو يحتوي على صفوف فارغة فقط');
        e.target.value = '';
        return;
      }

      const duplicates = [];
      validRows.forEach((row, index) => {
        const natId = (row['الرقم القومي'] || row['الرقم القومى'] || '').toString().trim();
        if (natId) {
          const existsInState = coordinators.some(c => String(c.national_id).trim() === natId);
          const existsInBatchIndex = validRows.findIndex((r, idx) => 
            idx < index && 
            String(r['الرقم القومي'] || r['الرقم القومى'] || '').toString().trim() === natId
          );
          
          if (existsInState) {
            duplicates.push(`الرقم القومي (${natId}) في الصف ${index + 2} موجود بالفعل في النظام`);
          } else if (existsInBatchIndex !== -1) {
            duplicates.push(`الرقم القومي (${natId}) مكرر في الملف في الصف ${index + 2} والصف ${existsInBatchIndex + 2}`);
          }
        }
      });

      if (duplicates.length > 0) {
        alert(`فشل الاستيراد لوجود قيم مكررة:\n${duplicates.slice(0, 10).join('\n')}${duplicates.length > 10 ? '\n...وغيرها' : ''}`);
        e.target.value = '';
        return;
      }

      validRows.forEach(row => {
        const natId = (row['الرقم القومي'] || row['الرقم القومى'] || '').toString().trim();

        addCoordinator({
          name: row['الاسم'] || '',
          specialization: row['التخصص'] || '',
          admin: row['إدارة'] || row['الإدارة'] || '',
          center: row['المركز'] || '',
          branch: row['الفرع'] || '',
          registry_no: row['رقم السجل'] || '',
          national_id: natId,
          job: row['الوظيفة'] || '',
          workplace: row['جهة العمل'] || '',
          job_grade: row['الدرجة الوظيفية'] || '',
          qualification: row['المؤهل'] || '',
          decision_no: row['رقم القرار'] || '',
          address: row['العنوان'] || '',
          phone: row['الهاتف'] || '',
        });
      });
      alert('تم استيراد البيانات بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في استيراد الملف');
    }
    e.target.value = '';
  };

  if (!hasPermission('coordinators', 'view')) {
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
          <h2>إدارة المنسقين</h2>
          <p>إدارة وعرض قائمة المنسقين المسجلين</p>
        </div>
      </div>

      {/* Search Filters */}
      <div className="search-section box-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '20px' }}>
          <div className="form-group">
            <label>الاسم</label>
            <input type="text" className="form-input" placeholder="البحث بالاسم" value={filterName} onChange={e => setFilterName(e.target.value)} />
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
        </div>
        <div className="search-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn btn-outline" onClick={() => { 
            setFilterName(''); 
            setFilterSpecialization(''); 
            if (!isRowaqStaff && !isBranchCoordinator && !isMohfez) setFilterAdmin(''); 
            if (!isBranchCoordinator && !isMohfez) setFilterCenter(''); 
            if (!isBranchCoordinator && !isMohfez) setFilterBranch(''); 
          }}>إعادة تعيين</button>
          <button className="btn btn-primary" style={{ marginRight: '10px' }}><Search size={16} /> بحث</button>
        </div>
      </div>

      {/* Table controls */}
      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <div className="action-buttons" style={{ flexDirection: 'row-reverse' }}>
          {hasPermission('coordinators', 'add') && (
            <>
              <Link to="/coordinators/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                <Plus size={16} /> إضافة منسق
              </Link>
              <button className="btn btn-gold-outline" onClick={() => importRef.current.click()}>
                <Upload size={16} /> استيراد
              </button>
              <input ref={importRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleImport} />
            </>
          )}
          {hasPermission('coordinators', 'delete') && coordinators.length > 0 && (
            <button className="btn btn-danger" onClick={deleteAllCoordinators}>
              حذف الجميع
            </button>
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
              <th>الاسم</th>
              <th>الإدارة</th>
              <th>المركز</th>
              <th>الفرع</th>
              <th>رقم القرار</th>
              <th>التخصص</th>
              <th>رقم السجل</th>
              <th>الرقم القومي</th>
              <th>الهاتف</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  لا توجد بيانات.
                </td>
              </tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.admin}</td>
                  <td>{c.center}</td>
                  <td>{c.branch}</td>
                  <td>{c.decision_no}</td>
                  <td>{c.specialization}</td>
                  <td>{c.registry_no}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{c.national_id}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{c.phone}</td>
                  <td className="actions-cell">
                    {isAllowedToArchive && (
                      <button className="action-icon edit" title="أرشفة" onClick={() => { if (window.confirm('هل أنت متأكد من أرشفة المنسق؟')) updateCoordinator(c.id, { isArchived: true }); }} style={{ color: 'var(--accent-gold)' }}><Archive size={16}/></button>
                    )}
                    {hasPermission('coordinators', 'edit') && (
                      <Link to={`/coordinators/create?id=${c.id}`} className="action-icon edit" style={{textDecoration: 'none', color: 'inherit'}}><Edit size={16}/></Link>
                    )}
                    {hasPermission('coordinators', 'delete') && (
                      <button className="action-icon delete" onClick={() => deleteCoordinator(c.id)}><Trash2 size={16}/></button>
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

export default CoordinatorsList;
