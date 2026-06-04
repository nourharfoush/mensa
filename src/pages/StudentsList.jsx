import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, Upload, Edit, Trash2 } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX, importFromXLSX } from '../utils/xlsxHelper';
import egyptCenters from '../data/egyptCenters';
import { calculateBirthDateFromNationalId } from '../utils/nationalIdHelper';

const governorates = Object.keys(egyptCenters);

function StudentsList() {
  const { students, deleteStudent, addStudent, branches, sessions, hasPermission, users, addUser, updateUser, deleteAllStudents } = useAppData();
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
  const [filterNationalId, setFilterNationalId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAdmin, setFilterAdmin] = useState(isRowaqStaff || isBranchCoordinator || isMohfez ? userAdmin : '');
  const [filterCenter, setFilterCenter] = useState(isBranchCoordinator || isMohfez ? userCenter : '');
  const [filterBranch, setFilterBranch] = useState(isBranchCoordinator || isMohfez ? userBranch : '');
  const [filterRowaq, setFilterRowaq] = useState('');
  const [filterSession, setFilterSession] = useState(isMohfez ? userSession : '');

  React.useEffect(() => {
    if ((isRowaqStaff || isMohfez) && userAdmin) {
      setFilterAdmin(userAdmin);
    }
    if (isBranchCoordinator || isMohfez) {
      if (userAdmin) setFilterAdmin(userAdmin);
      if (userCenter) setFilterCenter(userCenter);
      if (userBranch) setFilterBranch(userBranch);
    }
    if (isMohfez && userSession) {
      setFilterSession(userSession);
    }
  }, [currentUser]);

  const availableCenters = filterAdmin ? (egyptCenters[filterAdmin] || []) : [];
  const availableBranches = branches.filter(b => b.admin === filterAdmin && b.center === filterCenter);
  const availableSessions = sessions.filter(s => s.admin === filterAdmin && s.center === filterCenter && s.branch === filterBranch);

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

  const filtered = students.filter(s => {
    // 1. Geographic role restrictions
    if (isRowaqStaff && userAdmin && normalizeArabic(s.admin) !== normalizeArabic(userAdmin)) return false;
    if (isBranchCoordinator && userBranch && normalizeArabic(s.branch) !== normalizeArabic(userBranch)) return false;
    if (isMohfez && userSession) {
      // Find the student's session and check match
      const matchingSession = sessions.find(sess => String(sess.id) === String(userSession) || sess.session_name === userSession || sess.session_no === userSession);
      const studentSessionNo = s.session_id || s.session_no;
      if (matchingSession) {
        if (String(studentSessionNo) !== String(matchingSession.session_no) && String(studentSessionNo) !== String(matchingSession.id)) return false;
      } else {
        if (String(studentSessionNo) !== String(userSession)) return false;
      }
    }

    // 2. Normal filters
    return (
      (filterName ? normalizeArabic(s.name).includes(normalizeArabic(filterName)) : true) &&
      (filterNationalId ? normalizeArabic(s.national_id).includes(normalizeArabic(filterNationalId)) : true) &&
      (filterAdmin ? normalizeArabic(s.admin) === normalizeArabic(filterAdmin) : true) &&
      (filterCenter ? normalizeArabic(s.center) === normalizeArabic(filterCenter) : true) &&
      (filterBranch ? normalizeArabic(s.branch) === normalizeArabic(filterBranch) : true) &&
      (filterRowaq ? normalizeArabic(s.rowaq) === normalizeArabic(filterRowaq) : true) &&
      (filterSession ? String(s.session_id) === String(filterSession) || String(s.session_no) === String(filterSession) : true)
    );
  });

  const handleExport = () => {
    const exportData = filtered.map(s => ({
      'الاسم': s.name,
      'الإدارة': s.admin,
      'المركز': s.center,
      'الفرع': s.branch,
      'الرواق': s.rowaq,
      'الجنس': s.gender,
      'المستوى': s.level,
      'الحلقة': s.session_id,
      'الرقم القومي': s.national_id,
      'رقم التليفون': s.phone || '',
      'العنوان': s.address || '',
      'المؤهل': s.qualification || '',
      'الوظيفة': s.job || '',
    }));
    exportToXLSX(exportData, 'الدارسين', 'إدارة الطلاب');
  };

  const handleDownloadTemplate = () => {
    const templateData = [{
      'الاسم': '',
      'المحافظة': '',
      'المركز': '',
      'الفرع': '',
      'الحلقة': '',
      'النوع': '',
      'الرقم القومى': '',
      'رقم التليفون': '',
      'العنوان': '',
      'المؤهل': '',
      'الوظيفة': ''
    }];
    exportToXLSX(templateData, 'نموذج_استيراد_الدارسين', 'نموذج استيراد الدارسين');
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

      validRows.forEach(row => {
        const sessionNo = (row['الحلقة'] || '').toString().trim();
        const matchedSession = sessions.find(s => String(s.session_no) === sessionNo || String(s.id) === sessionNo);
        
        const adminVal = row['المحافظة'] || row['الإدارة'] || row['إدارة'] || matchedSession?.admin || '';
        const centerVal = row['المركز'] || matchedSession?.center || '';
        const branchVal = row['الفرع'] || matchedSession?.branch || '';
        const rowaqVal = row['الرواق'] || matchedSession?.rowaq || '';
        const levelVal = row['المستوى'] || matchedSession?.level || '';
        
        const genderVal = row['النوع'] || row['الجنس'] || matchedSession?.student_type || '';
        const natId = (row['الرقم القومى'] || row['الرقم القومي'] || '').toString().trim();
        
        const birthDateStr = calculateBirthDateFromNationalId(natId);
        
        const phoneVal = (row['رقم التليفون'] || row['رقم الهاتف'] || row['الهاتف'] || '').toString().trim();
        
        addStudent({
          name: row['الاسم'] || '',
          admin: adminVal,
          center: centerVal,
          branch: branchVal,
          rowaq: rowaqVal,
          level: levelVal,
          session_id: sessionNo,
          gender: genderVal,
          national_id: natId,
          birth_date: birthDateStr,
          phone: phoneVal,
          address: row['العنوان'] || '',
          qualification: row['المؤهل'] || '',
          job: row['الوظيفة'] || '',
          username: natId,
          password: natId
        });

        if (natId) {
          const existingUser = (users || []).find(u => u.national_id === natId || u.email === natId);
          if (existingUser) {
            updateUser(existingUser.id, {
              name: row['الاسم'] || '',
              phone: phoneVal,
              role: 'student',
              email: natId,
              national_id: natId,
              userAdmin: adminVal,
              userCenter: centerVal,
              userBranch: branchVal,
              userSession: sessionNo
            });
          } else {
            addUser({
              name: row['الاسم'] || '',
              email: natId,
              password: natId,
              phone: phoneVal,
              role: 'student',
              national_id: natId,
              userAdmin: adminVal,
              userCenter: centerVal,
              userBranch: branchVal,
              userSession: sessionNo
            });
          }
        }
      });
      alert('تم استيراد البيانات بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في استيراد الملف');
    }
    e.target.value = '';
  };

  if (!hasPermission('students', 'view')) {
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
          <h2>إدارة الطلاب</h2>
          <p>إدارة وعرض قائمة الطلاب المسجلين</p>
        </div>
      </div>

      {/* Search Filters */}
      <div className="search-section box-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '15px' }}>
          <div className="form-group">
            <label>الاسم</label>
            <input type="text" className="form-input" placeholder="البحث بالاسم" value={filterName} onChange={e => setFilterName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>الرقم القومي</label>
            <input type="text" className="form-input" placeholder="البحث بالرقم القومي" value={filterNationalId} onChange={e => setFilterNationalId(e.target.value)} />
          </div>
          <div className="form-group">
            <label>الحالة</label>
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">--- اختار الحالة ---</option>
              <option value="نشط">نشط</option>
              <option value="منقطع">منقطع</option>
            </select>
          </div>
          <div className="form-group">
            <label>المحافظة</label>
            <select className="form-select" value={filterAdmin} onChange={e => { setFilterAdmin(e.target.value); setFilterCenter(''); setFilterBranch(''); setFilterSession(''); }} disabled={isRowaqStaff || isBranchCoordinator || isMohfez}>
              <option value="">--- اختار المحافظة ---</option>
              {governorates.map((g, i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label>المركز</label>
            <select className="form-select" value={filterCenter} onChange={e => { setFilterCenter(e.target.value); setFilterBranch(''); setFilterSession(''); }} disabled={!filterAdmin || isBranchCoordinator || isMohfez}>
              <option value="">{filterAdmin ? '--- اختار المركز ---' : 'اختار المحافظة أولاً'}</option>
              {availableCenters.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>الفرع</label>
            <select className="form-select" value={filterBranch} onChange={e => { setFilterBranch(e.target.value); setFilterSession(''); }} disabled={!filterCenter || isBranchCoordinator || isMohfez}>
              <option value="">{filterCenter ? '--- اختار الفرع ---' : 'اختار المركز أولاً'}</option>
              {availableBranches.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>الحلقة</label>
            <select className="form-select" value={filterSession} onChange={e => setFilterSession(e.target.value)} disabled={!filterBranch || (isMohfez && !!userSession)}>
              <option value="">{filterBranch ? '--- اختار الحلقة ---' : 'اختار الفرع أولاً'}</option>
              {availableSessions.map((s, i) => <option key={i} value={s.session_no}>حلقة {s.session_no}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>الرواق</label>
            <select className="form-select" value={filterRowaq} onChange={e => setFilterRowaq(e.target.value)}>
              <option value="">--- اختار الرواق ---</option>
              <option value="رواق القرآن الكريم (أطفال)">رواق القرآن الكريم (أطفال)</option>
              <option value="رواق القرآن الكريم (كبار)">رواق القرآن الكريم (كبار)</option>
              <option value="رواق التجويد">رواق التجويد</option>
              <option value="رواق القراءات">رواق القراءات</option>
            </select>
          </div>
        </div>
        <div className="search-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn btn-outline" onClick={() => { 
            setFilterName(''); setFilterNationalId(''); setFilterStatus(''); 
            if (!isRowaqStaff && !isBranchCoordinator && !isMohfez) setFilterAdmin(''); 
            if (!isBranchCoordinator && !isMohfez) setFilterCenter(''); 
            if (!isBranchCoordinator && !isMohfez) setFilterBranch(''); 
            setFilterRowaq(''); 
            if (!isMohfez || !userSession) setFilterSession(''); 
          }}>إعادة تعيين</button>
          <button className="btn btn-primary" style={{ marginRight: '10px' }}><Search size={16} /> بحث</button>
        </div>
      </div>

      {/* Table controls */}
      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <div className="action-buttons" style={{ flexDirection: 'row-reverse' }}>
          {hasPermission('students', 'add') && (
            <>
              <Link to="/students/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                <Plus size={16} /> إضافة طالب
              </Link>
              <button className="btn btn-gold-outline" onClick={handleDownloadTemplate}>
                <Download size={16} /> تحميل النموذج
              </button>
              <button className="btn btn-gold-outline" onClick={() => importRef.current.click()}>
                <Upload size={16} /> استيراد
              </button>
              <input ref={importRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleImport} />
            </>
          )}
          {hasPermission('students', 'delete') && students.length > 0 && (
            <button className="btn btn-danger" onClick={deleteAllStudents}>
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
              <th>الرواق</th>
              <th>الجنس</th>
              <th>المستوى</th>
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
              filtered.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.admin}</td>
                  <td>{s.center}</td>
                  <td>{s.branch}</td>
                  <td>{s.rowaq}</td>
                  <td>{s.gender || '-'}</td>
                  <td>{s.level}</td>
                  <td className="actions-cell">
                    {hasPermission('students', 'edit') && (
                      <Link to={`/students/create?id=${s.id}`} className="action-icon edit" style={{textDecoration: 'none', color: 'inherit'}}><Edit size={16}/></Link>
                    )}
                    {hasPermission('students', 'delete') && (
                      <button className="action-icon delete" onClick={() => deleteStudent(s.id)}><Trash2 size={16}/></button>
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

export default StudentsList;
