import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, Upload, Edit, Trash2, Archive } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX, importFromXLSX } from '../utils/xlsxHelper';
import egyptCenters from '../data/egyptCenters';
import { calculateBirthDateFromNationalId } from '../utils/nationalIdHelper';

const governorates = Object.keys(egyptCenters);

function StudentsList() {
  const { students, deleteStudent, addStudent, branches, sessions, hasPermission, users, addUser, updateUser, deleteAllStudents, bulkImportStudents, coordinators, mohfezs, updateStudent } = useAppData();
  const importRef = useRef(null);
  
  // Get current user and role
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const role = currentUser ? currentUser.role : 'admin';
  const userSession = currentUser ? currentUser.userSession : '';

  const isSuperAdmin = role === 'admin';
  const isRowaqAdmin = role === 'rowaq_admin';
  const isRowaqStaff = ['rowaq_manager', 'rowaq_tech', 'rowaq_member'].includes(role);
  const isBranchCoordinator = ['branch_admin_coordinator', 'branch_scientific_coordinator'].includes(role);
  const isMohfez = role === 'mohfez';

  // Fallbacks for geographic fields if they are missing in currentUser
  const nationalId = currentUser ? String(currentUser.national_id || currentUser.username || '').trim() : '';
  let userAdmin = currentUser ? currentUser.userAdmin : '';
  let userCenter = currentUser ? currentUser.userCenter : '';
  let userBranch = currentUser ? currentUser.userBranch : '';

  if (isBranchCoordinator && (!userAdmin || !userCenter || !userBranch)) {
    const matchedCoord = coordinators?.find(c => 
      (nationalId && String(c.national_id || '').trim() === nationalId) ||
      (currentUser?.name && normalizeArabic(c.name) === normalizeArabic(currentUser.name))
    );
    if (matchedCoord) {
      userAdmin = userAdmin || matchedCoord.admin || '';
      userCenter = userCenter || matchedCoord.center || '';
      userBranch = userBranch || matchedCoord.branch || '';
    }
  } else if (isMohfez && (!userAdmin || !userCenter || !userBranch)) {
    const matchedMohfez = mohfezs?.find(m => 
      (nationalId && String(m.national_id || '').trim() === nationalId) ||
      (currentUser?.name && normalizeArabic(m.name) === normalizeArabic(currentUser.name))
    );
    if (matchedMohfez) {
      userAdmin = userAdmin || matchedMohfez.admin || '';
      userCenter = userCenter || matchedMohfez.center || '';
      userBranch = userBranch || matchedMohfez.branch || '';
    }
  }

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

  const resolveGeographicFields = (adminVal, centerVal, branchVal, branchesList) => {
    const normAdmin = normalizeArabic(adminVal);
    const normCenter = normalizeArabic(centerVal);
    const normBranch = normalizeArabic(branchVal);

    if (!branchesList || branchesList.length === 0) {
      return { admin: adminVal, center: centerVal, branch: branchVal };
    }

    // 1. Check if centerVal is a valid branch name, and branchVal is NOT (shifted columns)
    const isBranchValValid = normBranch && branchesList.some(b => normalizeArabic(b.name) === normBranch);
    const isCenterValValid = normCenter && branchesList.some(b => normalizeArabic(b.name) === normCenter);

    if (isCenterValValid && !isBranchValValid) {
      const matchedBranch = branchesList.find(b => 
        normalizeArabic(b.name) === normCenter &&
        (normalizeArabic(b.center) === normAdmin || normalizeArabic(b.admin) === normAdmin)
      ) || branchesList.find(b => normalizeArabic(b.name) === normCenter);
      
      if (matchedBranch) {
        return { admin: matchedBranch.admin, center: matchedBranch.center, branch: matchedBranch.name };
      }
    }

    // 2. Exact match
    let matchedBranch = branchesList.find(b => 
      normalizeArabic(b.name) === normBranch &&
      normalizeArabic(b.center) === normCenter &&
      normalizeArabic(b.admin) === normAdmin
    );
    if (matchedBranch) {
      return { admin: matchedBranch.admin, center: matchedBranch.center, branch: matchedBranch.name };
    }

    // 3. Match by branch name (normBranch)
    if (isBranchValValid) {
      const matchedBranch = branchesList.find(b => 
        normalizeArabic(b.name) === normBranch &&
        (normalizeArabic(b.center) === normCenter || normalizeArabic(b.admin) === normAdmin)
      ) || branchesList.find(b => normalizeArabic(b.name) === normBranch);

      if (matchedBranch) {
        return { admin: matchedBranch.admin, center: matchedBranch.center, branch: matchedBranch.name };
      }
    }

    return { admin: adminVal, center: centerVal, branch: branchVal };
  };

  const isAllowedToArchive = ['admin', 'rowaq_admin', 'rowaq_manager', 'rowaq_tech'].includes(role);

  const filtered = students.filter(s => {
    if (s.isArchived) return false;
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
      'الحلقة': s.session_no || '',
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

      const duplicates = [];
      validRows.forEach((row, index) => {
        const natId = (row['الرقم القومى'] || row['الرقم القومي'] || '').toString().trim();
        if (natId) {
          const existsInState = students.some(s => String(s.national_id).trim() === natId);
          const existsInBatchIndex = validRows.findIndex((r, idx) => 
            idx < index && 
            String(r['الرقم القومى'] || r['الرقم القومي'] || '').toString().trim() === natId
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

      const isValidObjectId = (id) => typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
      const studentsToImport = [];
      const usersToImport = [];

      validRows.forEach(row => {
        const sessionNo = (row['الحلقة'] || '').toString().trim();
        const adminFromRow = (row['إدارة'] || row['الإدارة'] || row['المحافظة'] || row['المحافظه'] || '').toString().trim();
        const centerFromRow = (row['المركز'] || row['المركز/القسم'] || row['مركز'] || row['قسم'] || '').toString().trim();
        const branchFromRow = (row['الفرع'] || row['فرع'] || row['اسم الفرع'] || row['اسم فرع'] || '').toString().trim();

        // Resolve geographic fields using branches lookup
        const resolved = resolveGeographicFields(adminFromRow, centerFromRow, branchFromRow, branches);

        // 1. Strict Match: match by session_no AND branch AND center AND admin
        let matchedSession = sessions.find(s => {
          const numMatch = String(s.session_no) === sessionNo || String(s.id) === sessionNo;
          if (!numMatch) return false;

          const adminMatch = resolved.admin ? normalizeArabic(s.admin) === normalizeArabic(resolved.admin) : true;
          const centerMatch = resolved.center ? normalizeArabic(s.center) === normalizeArabic(resolved.center) : true;
          const branchMatch = resolved.branch ? normalizeArabic(s.branch) === normalizeArabic(resolved.branch) : true;

          return adminMatch && centerMatch && branchMatch;
        });

        // 2. Fallback Match: if no strict match, match by session_no AND branch
        if (!matchedSession && branchFromRow) {
          matchedSession = sessions.find(s => {
            const numMatch = String(s.session_no) === sessionNo || String(s.id) === sessionNo;
            if (!numMatch) return false;

            return normalizeArabic(s.branch) === normalizeArabic(branchFromRow);
          });
        }

        // 3. Last Fallback: match by session_no only
        if (!matchedSession) {
          matchedSession = sessions.find(s => String(s.session_no) === sessionNo || String(s.id) === sessionNo);
        }
        
        const adminVal = adminFromRow || matchedSession?.admin || '';
        const centerVal = centerFromRow || matchedSession?.center || '';
        const branchVal = branchFromRow || matchedSession?.branch || '';
        const rowaqVal = row['الرواق'] || matchedSession?.rowaq || '';
        const levelVal = row['المستوى'] || matchedSession?.level || '';
        
        const genderVal = row['النوع'] || row['الجنس'] || matchedSession?.student_type || '';
        const natId = (row['الرقم القومى'] || row['الرقم القومي'] || '').toString().trim();

        if (natId) {
          const existsInState = students.some(s => String(s.national_id).trim() === natId);
          const existsInBatch = studentsToImport.some(s => String(s.national_id).trim() === natId);
          if (existsInState || existsInBatch) return;
        }
        
        const birthDateStr = calculateBirthDateFromNationalId(natId);
        const phoneVal = (row['رقم التليفون'] || row['رقم الهاتف'] || row['الهاتف'] || '').toString().trim();
        
        const sessionObjId = matchedSession?.id && isValidObjectId(matchedSession.id) ? matchedSession.id : undefined;

        studentsToImport.push({
          name: row['الاسم'] || '',
          admin: adminVal,
          center: centerVal,
          branch: branchVal,
          rowaq: rowaqVal,
          level: levelVal,
          session_id: sessionObjId,
          session_no: sessionNo,
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
          usersToImport.push({
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
      });

      await bulkImportStudents(studentsToImport, usersToImport);
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
              <option value="رواق القرآن الكريم ( أطفال )">رواق القرآن الكريم ( أطفال )</option>
              <option value="رواق القرآن الكريم ( كبار )">رواق القرآن الكريم ( كبار )</option>
              <option value="متعدد البرامج ( قرآن كريم_قراءات_تجويد)">متعدد البرامج ( قرآن كريم_قراءات_تجويد)</option>
              <option value="متعدد البرامج ( قرآن كريم_قراءات_تجويد)">متعدد البرامج ( قرآن كريم_قراءات_تجويد)</option>
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
              <th>الحلقة</th>
              <th>الرواق</th>
              <th>الجنس</th>
              <th>المستوى</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
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
                  <td>{s.session_no || '-'}</td>
                  <td>{s.rowaq}</td>
                  <td>{s.gender || '-'}</td>
                  <td>{s.level}</td>
                  <td className="actions-cell">
                    {isAllowedToArchive && (
                      <button className="action-icon edit" title="أرشفة" onClick={() => { if (window.confirm('هل أنت متأكد من أرشفة الدارس؟')) updateStudent(s.id, { isArchived: true }); }} style={{ color: 'var(--accent-gold)' }}><Archive size={16}/></button>
                    )}
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
