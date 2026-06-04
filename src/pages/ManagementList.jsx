import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, Upload, Edit, Trash2 } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX, importFromXLSX } from '../utils/xlsxHelper';
import egyptCenters from '../data/egyptCenters';

const specialties = [
  'مدير الإدارة',
  'العضو الإداري قران كريم',
  'عضو علمي قران كريم',
  'العضو الإداري، علوم شرعية وعربية',
  'العضو العلمي، علوم شرعية وعربية',
  'العضو العلمي تجويد وقراءات',
  'العضو التقني'
];

const governorates = Object.keys(egyptCenters);

function ManagementList() {
  const { managers, deleteManager, addManager, addUser, deleteAllManagers } = useAppData();

  // Get current user and role
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const role = currentUser ? currentUser.role : 'admin';
  const userAdmin = currentUser ? currentUser.userAdmin : '';

  const isRowaqStaff = ['rowaq_manager', 'rowaq_tech', 'rowaq_member'].includes(role);

  const [filterAdmin, setFilterAdmin] = useState(isRowaqStaff && userAdmin ? userAdmin : '');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [searchName, setSearchName] = useState('');
  const importRef = useRef(null);

  React.useEffect(() => {
    if (isRowaqStaff && userAdmin) {
      setFilterAdmin(userAdmin);
    }
  }, [currentUser]);

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
  const normalizedGovernoratesMap = new Map(governorates.map(g => [normalizeArabic(g), g]));

  const filtered = managers.filter(m => {
    // Gracefully handle swapped admin (Governorate) and decision_no fields from Excel imports
    const actualAdmin = m.admin || '';
    const actualDecision = m.decision_no || '';
    
    // Normalize both values before checking if they match governorates
    const normalizedAdmin = normalizeArabic(actualAdmin);
    const normalizedDecision = normalizeArabic(actualDecision);
    
    const isSwapped = 
      actualDecision && 
      normalizedGovernoratesSet.has(normalizedDecision) && 
      !normalizedGovernoratesSet.has(normalizedAdmin);
    
    const mAdminNormalized = isSwapped ? normalizedDecision : normalizedAdmin;
    
    if (isRowaqStaff && userAdmin && mAdminNormalized !== normalizeArabic(userAdmin)) return false;

    // Important: filterAdmin comes directly from governorates list, so we normalize it too
    const filterAdminNormalized = normalizeArabic(filterAdmin);

    const matchAdmin = !filterAdmin || mAdminNormalized === filterAdminNormalized;
    const matchSpecialty = !filterSpecialty || normalizeArabic(m.specialty) === normalizeArabic(filterSpecialty);
    const matchName = !searchName || normalizeArabic(m.name).includes(normalizeArabic(searchName));

    return matchAdmin && matchSpecialty && matchName;
  });

  const handleExport = () => {
    const exportData = filtered.map(m => ({
      'الاسم': m.name || '',
      'التخصص': m.specialty || '',
      'إدارة': m.admin || '',
      'رقم السجل': m.record_no || '',
      'الرقم القومي': m.national_id || '',
      'الوظيفة': m.job_title || '',
      'جهة العمل': m.workplace || '',
      'الدرجة الوظ': m.job_grade || '',
      'المؤهل': m.qualification || '',
      'رقم القرار': m.decision_no || '',
      'العنوان': m.address || '',
      'الهاتف': m.phone || '',
    }));
    exportToXLSX(exportData, 'أعضاء_الإدارة', 'قائمة أعضاء الإدارة');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await importFromXLSX(file);
      if (!rows || rows.length === 0) {
        alert('الملف فارغ أو يحتوي على بيانات غير صالحة');
        return;
      }
      const processedNationalIds = [];
      rows.forEach(row => {
        const nationalId = String(row['الرقم القومي'] || row['الرقم القومى'] || '').trim();
        const recordNo = String(row['رقم السجل'] || '').trim();
        if (!nationalId) return; // Skip invalid rows
        
        // Avoid duplicate managers by national_id
        const isDuplicateInState = managers.some(m => String(m.national_id || '').trim() === nationalId);
        const isDuplicateInBatch = processedNationalIds.includes(nationalId);
        if (isDuplicateInState || isDuplicateInBatch) return;
        processedNationalIds.push(nationalId);

        const finalForm = {
          name: row['الاسم'] || '',
          admin: row['إدارة'] || row['الإدارة'] || '',
          decision_no: row['رقم القرار'] || '',
          specialty: row['التخصص'] || '',
          record_no: recordNo,
          national_id: nationalId,
          phone: row['الهاتف'] || '',
          email: row['البريد الإلكتروني'] || `${nationalId}@azhar.eg`,
          address: row['العنوان'] || row['العنوان التفصيلي'] || 'غير محدد',
          job_title: row['الوظيفة'] || 'عضو إداري',
          workplace: row['جهة العمل'] || 'الأزهر الشريف',
          job_grade: row['الدرجة الوظ'] || row['الدرجة الوظيفية'] || 'الثالثة',
          qualification: row['المؤهل'] || row['المؤهل الدراسي'] || 'مؤهل عالي',
          username: nationalId,
          password: recordNo,
        };
        
        addManager(finalForm);
        
        let computedRole = 'rowaq_member';
        if (finalForm.specialty === 'مدير الإدارة') computedRole = 'rowaq_manager';
        else if (finalForm.specialty === 'العضو التقني') computedRole = 'rowaq_tech';

        addUser({
          name: finalForm.name,
          email: finalForm.national_id,
          password: finalForm.record_no,
          phone: finalForm.phone,
          role: computedRole,
          national_id: finalForm.national_id,
          record_number: finalForm.record_no,
          userAdmin: finalForm.admin || ''
        });
      });
      alert('تم استيراد أعضاء الإدارة بنجاح');
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
          <h2>إدارة أعضاء الإدارة</h2>
          <p>إدارة وعرض قائمة المديرين المسجلين</p>
        </div>
      </div>

      <fieldset className="search-section box-card" style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', direction: 'rtl', margin: '0 0 25px 0' }}>
        <legend style={{ float: 'right', padding: '0 10px', fontSize: '14px', color: 'var(--text-secondary)', border: 'none', width: 'auto', margin: 0, fontWeight: 'bold' }}>بحث</legend>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
          
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '180px' }}>
            <select
              className="form-select"
              value={filterAdmin}
              onChange={e => setFilterAdmin(e.target.value)}
              style={{ width: '100%' }}
              disabled={isRowaqStaff && !!userAdmin}
            >
              <option value="">--- اختر الادارة ---</option>
              {governorates.map((g, i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '180px' }}>
            <select
              className="form-select"
              value={filterSpecialty}
              onChange={e => setFilterSpecialty(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">--- اختر التخصص ---</option>
              {specialties.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
            <input
              type="text"
              placeholder="الاسم"
              className="form-input"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" style={{ padding: '10px 20px' }}>
              بحث
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                if (!isRowaqStaff || !userAdmin) setFilterAdmin('');
                setFilterSpecialty('');
                setSearchName('');
              }}
              style={{ padding: '10px 20px' }}
            >
              اعادة ادخال
            </button>
          </div>
        </div>
      </fieldset>

      <div className="table-controls">
        <div className="table-stats">النتائج ({filtered.length})</div>
        <div className="action-buttons">
          <Link to="/management/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={16} /> إضافة مدير
          </Link>
          <button className="btn btn-gold-outline" onClick={() => importRef.current.click()}>
            <Upload size={16} /> استيراد
          </button>
          <input ref={importRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleImport} />
          {managers.length > 0 && (
            <button className="btn btn-danger" onClick={deleteAllManagers}>
              حذف الجميع
            </button>
          )}
          <button className="btn btn-outline" onClick={handleExport}><Download size={16} /> تصدير</button>
        </div>
      </div>


      <div className="table-wrapper box-card">
        <table className="management-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الإدارة</th>
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
                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  لا توجد بيانات. قم بإضافة مدير جديد.
                </td>
              </tr>
            ) : (
              filtered.map(m => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.admin}</td>
                  <td>{m.decision_no}</td>
                  <td>{m.specialty}</td>
                  <td>{m.record_no}</td>
                  <td>{m.national_id}</td>
                  <td>{m.phone}</td>
                  <td className="actions-cell">
                    <Link to={`/management/create?id=${m.id}`} className="action-icon edit" style={{textDecoration: 'none', color: 'inherit'}}><Edit size={16}/></Link>
                    <button className="action-icon delete" onClick={() => deleteManager(m.id)}><Trash2 size={16}/></button>
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

export default ManagementList;
