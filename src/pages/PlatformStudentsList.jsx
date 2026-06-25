import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, Upload, Edit, Trash2 } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX, importFromXLSX } from '../utils/xlsxHelper';
import { countriesList } from '../data/countries';

function PlatformStudentsList() {
  const { platformStudents, deletePlatformStudent, addPlatformStudent, platformSessions, rowaqs, hasPermission, users, addUser, updateUser, deleteAllPlatformStudents, bulkImportPlatformStudents } = useAppData();
  const importRef = useRef(null);
  
  // Get current user and role
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const role = currentUser ? currentUser.role : 'admin';
  const userSession = currentUser ? currentUser.userSession : '';

  const isSuperAdmin = role === 'admin';
  const isPlatformAdmin = role === 'platform_admin';
  const isPlatformSupervisor = role === 'platform_supervisor';
  const isPlatformCoordinator = role === 'platform_coordinator';
  const isPlatformMohfez = role === 'platform_mohfez';
  const isStudent = role === 'student';

  const isAuthorized = isSuperAdmin || isPlatformAdmin || isPlatformSupervisor || isPlatformCoordinator;

  const [filterName, setFilterName] = useState('');
  const [filterPassportNo, setFilterPassportNo] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterRowaq, setFilterRowaq] = useState('');
  const [filterSession, setFilterSession] = useState(isPlatformCoordinator ? userSession : '');

  // Sync filters
  React.useEffect(() => {
    if (isPlatformCoordinator && userSession) {
      setFilterSession(userSession);
    }
  }, [currentUser]);

  const filtered = platformStudents.filter(s => {
    // 1. Session role restrictions
    if (isPlatformCoordinator && userSession) {
      const matchingSession = platformSessions.find(sess => String(sess.id) === String(userSession) || sess.session_name === userSession || sess.session_no === userSession);
      const studentSessionNo = s.session_id || s.session_no;
      if (matchingSession) {
        if (String(studentSessionNo) !== String(matchingSession.session_no) && String(studentSessionNo) !== String(matchingSession.id)) return false;
      } else {
        if (String(studentSessionNo) !== String(userSession)) return false;
      }
    }

    // 2. Normal filters
    return (
      (filterName ? s.name?.includes(filterName) : true) &&
      (filterPassportNo ? (s.passport_no || s.national_id)?.includes(filterPassportNo) : true) &&
      (filterCountry ? s.country === filterCountry : true) &&
      (filterRowaq ? s.rowaq === filterRowaq : true) &&
      (filterSession ? String(s.session_id) === String(filterSession) || String(s.session_no) === String(filterSession) : true)
    );
  });

  const handleExport = () => {
    const exportData = filtered.map(s => ({
      'الاسم': s.name,
      'الدولة': s.country || '',
      'الرواق': s.rowaq,
      'الجنس': s.gender,
      'المستوى': s.level,
      'الحلقة': s.session_no || '',
      'رقم جواز السفر': s.passport_no || s.national_id || '',
      'رقم التليفون': s.phone || '',
      'العنوان': s.address || '',
      'المؤهل': s.qualification || '',
      'الوظيفة': s.job || '',
    }));
    exportToXLSX(exportData, 'الدارسين', 'دارسين المنصة');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await importFromXLSX(file);
      const platformStudentsToImport = [];
      const usersToImport = [];

      const isValidObjectId = (id) => typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
      rows.forEach(row => {
        const passport = String(row['رقم جواز السفر'] || row['الرقم القومي'] || '').trim();
        if (!passport) return;
        const sessionNo = (row['الحلقة'] || '').toString().trim();
        const matchedSession = platformSessions.find(s => String(s.session_no) === sessionNo || String(s.id) === sessionNo);
        const sessionObjId = matchedSession?.id && isValidObjectId(matchedSession.id) ? matchedSession.id : undefined;

        platformStudentsToImport.push({
          name: row['الاسم'] || '',
          country: row['الدولة'] || '',
          rowaq: row['الرواق'] || '',
          gender: row['الجنس'] || '',
          level: row['المستوى'] || '',
          session_id: sessionObjId,
          session_no: sessionNo,
          passport_no: passport,
          phone: row['رقم التليفون'] || '',
          address: row['العنوان'] || '',
          qualification: row['المؤهل'] || '',
          job: row['الوظيفة'] || ''
        });

        usersToImport.push({
          name: row['الاسم'] || '',
          email: passport,
          password: passport,
          phone: row['رقم التليفون'] || '',
          role: 'student',
          national_id: passport,
          userSession: sessionNo
        });
      });

      await bulkImportPlatformStudents(platformStudentsToImport, usersToImport);
      alert('تم استيراد البيانات بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في استيراد الملف');
    }
    e.target.value = '';
  };

  if (!hasPermission('students', 'view') || !isAuthorized) {
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
          <h2>دارسين المنصة</h2>
          <p>إدارة وعرض قائمة دارسين المنصة</p>
        </div>
      </div>

      <div className="search-section box-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '15px' }}>
          <div className="form-group">
            <label>الاسم</label>
            <input type="text" className="form-input" placeholder="البحث بالاسم" value={filterName} onChange={e => setFilterName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>رقم جواز السفر</label>
            <input type="text" className="form-input" placeholder="البحث برقم جواز السفر" value={filterPassportNo} onChange={e => setFilterPassportNo(e.target.value)} />
          </div>
          <div className="form-group">
            <label>الدولة</label>
            <select className="form-select" value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
              <option value="">--- اختار الدولة ---</option>
              {countriesList.map((c, i) => <option key={i} value={c}>{c}</option>)}
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
          <div className="form-group">
            <label>الحلقة</label>
            <select className="form-select" value={filterSession} onChange={e => setFilterSession(e.target.value)} disabled={isPlatformCoordinator}>
              <option value="">--- اختار الحلقة ---</option>
              {platformSessions.map((s, i) => <option key={i} value={s.session_no}>حلقة {s.session_no}</option>)}
            </select>
          </div>
        </div>
        <div className="search-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn btn-outline" onClick={() => { 
            setFilterName(''); setFilterPassportNo(''); setFilterCountry(''); 
            setFilterRowaq(''); 
            if (!isPlatformCoordinator) setFilterSession(''); 
          }}>إعادة تعيين</button>
          <button className="btn btn-primary" style={{ marginRight: '10px' }}><Search size={16} /> بحث</button>
        </div>
      </div>

      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <div className="action-buttons" style={{ flexDirection: 'row-reverse' }}>
          {hasPermission('students', 'add') && (
            <>
              <Link to="/platform-students/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                <Plus size={16} /> إضافة دارس
              </Link>
              <button className="btn btn-gold-outline" onClick={() => importRef.current.click()}>
                <Upload size={16} /> استيراد
              </button>
              <input ref={importRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleImport} />
            </>
          )}
          {hasPermission('students', 'delete') && platformStudents.length > 0 && (
            <button className="btn btn-danger" onClick={deleteAllPlatformStudents}>
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
              <th>الدولة</th>
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
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  لا توجد بيانات.
                </td>
              </tr>
            ) : (
              filtered.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.country || '-'}</td>
                  <td>{s.session_no || '-'}</td>
                  <td>{s.rowaq}</td>
                  <td>{s.gender || '-'}</td>
                  <td>{s.level}</td>
                  <td className="actions-cell">
                    {hasPermission('students', 'edit') && (
                      <Link to={`/platform-students/create?id=${s.id}`} className="action-icon edit" style={{textDecoration: 'none', color: 'inherit'}}><Edit size={16}/></Link>
                    )}
                    {hasPermission('students', 'delete') && (
                      <button className="action-icon delete" onClick={() => deletePlatformStudent(s.id)}><Trash2 size={16}/></button>
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

export default PlatformStudentsList;
