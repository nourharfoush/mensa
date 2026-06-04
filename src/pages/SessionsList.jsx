import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, Upload, Edit, Trash2, ClipboardCheck, FileText } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX, importFromXLSX } from '../utils/xlsxHelper';
import egyptCenters from '../data/egyptCenters';

const governorates = Object.keys(egyptCenters);

function SessionsList() {
  const { sessions, deleteSession, addSession, branches, hasPermission, students, deleteAllSessions } = useAppData();
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

  const [filterAdmin, setFilterAdmin] = useState(isRowaqStaff || isBranchCoordinator || isMohfez ? userAdmin : '');
  const [filterCenter, setFilterCenter] = useState(isBranchCoordinator || isMohfez ? userCenter : '');
  const [filterBranch, setFilterBranch] = useState(isBranchCoordinator || isMohfez ? userBranch : '');
  const [filterRowaq, setFilterRowaq] = useState('');
  const [filterStudentType, setFilterStudentType] = useState('');
  const [filterAttendance, setFilterAttendance] = useState('');

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

  const availableCenters = filterAdmin ? (egyptCenters[filterAdmin] || []) : [];
  const availableBranches = branches.filter(b => normalizeArabic(b.admin) === normalizeArabic(filterAdmin) && normalizeArabic(b.center) === normalizeArabic(filterCenter));

  const filtered = sessions.filter(s => {
    // 1. Geographic role restrictions
    if (isRowaqStaff && userAdmin && normalizeArabic(s.admin) !== normalizeArabic(userAdmin)) return false;
    if (isBranchCoordinator && userBranch && normalizeArabic(s.branch) !== normalizeArabic(userBranch)) return false;
    if (isMohfez) {
      if (userSession) {
        if (String(s.id) !== String(userSession) && s.session_name !== userSession && s.session_no !== userSession) return false;
      } else if (userBranch) {
        if (normalizeArabic(s.branch) !== normalizeArabic(userBranch)) return false;
      }
    }

    // 2. Normal filters
    return (
      (filterAdmin ? normalizeArabic(s.admin) === normalizeArabic(filterAdmin) : true) &&
      (filterCenter ? normalizeArabic(s.center) === normalizeArabic(filterCenter) : true) &&
      (filterBranch ? normalizeArabic(s.branch) === normalizeArabic(filterBranch) : true) &&
      (filterRowaq ? normalizeArabic(s.rowaq) === normalizeArabic(filterRowaq) : true) &&
      (filterStudentType ? normalizeArabic(s.student_type) === normalizeArabic(filterStudentType) : true) &&
      (filterAttendance ? normalizeArabic(s.attendance_type) === normalizeArabic(filterAttendance) : true)
    );
  });

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

  const formatWorkDays = (workDaysArr) => {
    if (!workDaysArr || workDaysArr.length === 0) return '';
    return workDaysArr.map(d => {
      if (d === 'الأحد') return 'الاحد';
      if (d === 'الأربعاء') return 'الاربعاء';
      return d;
    }).join(',');
  };

  const parseWorkDays = (daysStr) => {
    if (!daysStr) return [];
    return daysStr.toString().split(/[，,،]/).map(d => {
      const clean = d.trim();
      if (clean === 'الاحد') return 'الأحد';
      if (clean === 'الاربعاء') return 'الأربعاء';
      return clean;
    }).filter(Boolean);
  };

  const handleExport = () => {
    let exportData = filtered.map(s => {
      const studentCount = (students || []).filter(stud => 
        (stud.session_id && String(stud.session_id) === String(s.id)) ||
        (String(stud.session_no) === String(s.session_no) &&
         normalizeArabic(stud.branch) === normalizeArabic(s.branch) &&
         normalizeArabic(stud.center) === normalizeArabic(s.center) &&
         normalizeArabic(stud.admin) === normalizeArabic(s.admin))
      ).length;
      return {
        'رقم الحلقة': s.session_no || '',
        'إدارة': s.admin || '',
        'المركز': s.center || '',
        'الفرع': s.branch || '',
        'الرواق': s.rowaq || '',
        'المستوى': s.level || '',
        'نوع المحفظ': s.mohfez_type || '',
        'المحفّظ': s.mohfez || '',
        'نوع الدارسين': s.student_type || '',
        'نوع الحضور': s.attendance_type || '',
        'ايام العمل': formatWorkDays(s.workDays),
        'الوقت من': formatTimeTo12Hour(s.time_start),
        'الوقت الي': formatTimeTo12Hour(s.time_end),
        'الدارسين': studentCount
      };
    });

    if (exportData.length === 0) {
      exportData = [{
        'رقم الحلقة': '',
        'إدارة': '',
        'المركز': '',
        'الفرع': '',
        'الرواق': '',
        'المستوى': '',
        'نوع المحفظ': '',
        'المحفّظ': '',
        'نوع الدارسين': '',
        'نوع الحضور': '',
        'ايام العمل': '',
        'الوقت من': '',
        'الوقت الي': '',
        'الدارسين': ''
      }];
    }

    exportToXLSX(exportData, 'الحلقات', 'إدارة الحلقات');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await importFromXLSX(file);
      
      const validRows = rows.filter(row => row['رقم الحلقة'] && row['رقم الحلقة'].toString().trim() !== '');

      if (validRows.length === 0) {
        alert('الملف فارغ أو يحتوي على صفوف فارغة فقط');
        e.target.value = '';
        return;
      }

      validRows.forEach(row => {
        const rawStudentType = row['نوع الدارسين'] || '';
        const rawOldStudentType = row['الدارسين'] && isNaN(Number(row['الدارسين'])) ? row['الدارسين'] : '';
        const studentType = rawStudentType || rawOldStudentType || '';

        addSession({
          session_no: row['رقم الحلقة'] || Date.now().toString().slice(-8),
          admin: row['إدارة'] || row['الإدارة'] || '',
          center: row['المركز'] || '',
          branch: row['الفرع'] || '',
          rowaq: row['الرواق'] || '',
          level: row['المستوى'] || '',
          mohfez_type: row['نوع المحفظ'] || '',
          mohfez: row['المحفّظ'] || row['المحفظ'] || '',
          student_type: studentType,
          attendance_type: row['نوع الحضور'] || '',
          workDays: parseWorkDays(row['ايام العمل'] || row['أيام العمل'] || ''),
          time_start: parseTimeTo24Hour(row['الوقت من'] || ''),
          time_end: parseTimeTo24Hour(row['الوقت الي'] || ''),
        });
      });
      alert('تم استيراد البيانات بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في استيراد الملف');
    }
    e.target.value = '';
  };

  if (!hasPermission('sessions', 'view')) {
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
          <h2>إدارة الحلقات</h2>
          <p>إدارة وعرض قائمة الحلقات</p>
        </div>
      </div>

      {/* Search Filters */}
      <div className="search-section box-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '15px' }}>
          <div className="form-group">
            <label>الإدارة</label>
            <select className="form-select" value={filterAdmin} onChange={e => { setFilterAdmin(e.target.value); setFilterCenter(''); setFilterBranch(''); }} disabled={isRowaqStaff || isBranchCoordinator || isMohfez}>
              <option value="">--- اختار الإدارة ---</option>
              {governorates.map((g, i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>المركز</label>
            <select className="form-select" value={filterCenter} onChange={e => { setFilterCenter(e.target.value); setFilterBranch(''); }} disabled={!filterAdmin || isBranchCoordinator || isMohfez}>
              <option value="">{filterAdmin ? '--- اختار المركز ---' : 'اختار الإدارة أولاً'}</option>
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
            <label>نوع الدارسين</label>
            <select className="form-select" value={filterStudentType} onChange={e => setFilterStudentType(e.target.value)}>
              <option value="">--- اختار النوع ---</option>
              <option value="رجال">رجال</option>
              <option value="نساء">نساء</option>
              <option value="أطفال">أطفال</option>
            </select>
          </div>
          <div className="form-group">
            <label>نوع الحضور</label>
            <select className="form-select" value={filterAttendance} onChange={e => setFilterAttendance(e.target.value)}>
              <option value="">--- اختار النوع ---</option>
              <option value="مباشر">مباشر</option>
              <option value="عن بعد">عن بعد</option>
            </select>
          </div>
        </div>
        <div className="search-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn btn-outline" onClick={() => { 
            if (!isRowaqStaff && !isBranchCoordinator && !isMohfez) setFilterAdmin(''); 
            if (!isBranchCoordinator && !isMohfez) setFilterCenter(''); 
            if (!isBranchCoordinator && !isMohfez) setFilterBranch(''); 
            setFilterRowaq(''); 
            setFilterStudentType(''); 
            setFilterAttendance(''); 
          }}>إعادة تعيين</button>
          <button className="btn btn-primary" style={{ marginRight: '10px' }}><Search size={16} /> بحث</button>
        </div>
      </div>

      {/* Table controls */}
      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <div className="action-buttons" style={{ flexDirection: 'row-reverse' }}>
          {hasPermission('sessions', 'add') && (
            <>
              <Link to="/sessions/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                <Plus size={16} /> إضافة حلقة
              </Link>
              <button className="btn btn-gold-outline" onClick={() => importRef.current.click()}>
                <Upload size={16} /> استيراد
              </button>
              <input ref={importRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleImport} />
            </>
          )}
          {hasPermission('sessions', 'delete') && sessions.length > 0 && (
            <button className="btn btn-danger" onClick={deleteAllSessions}>
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
              <th>رقم الحلقة</th>
              <th>المحفظ</th>
              <th>الإدارة</th>
              <th>المركز</th>
              <th>الفرع</th>
              <th>الرواق</th>
              <th>المستوى</th>
              <th>نوع الدارسين</th>
              <th>الدارسين</th>
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
              filtered.map(s => {
                const studentCount = (students || []).filter(stud => 
                  (stud.session_id && String(stud.session_id) === String(s.id)) ||
                  (String(stud.session_no) === String(s.session_no) &&
                   normalizeArabic(stud.branch) === normalizeArabic(s.branch) &&
                   normalizeArabic(stud.center) === normalizeArabic(s.center) &&
                   normalizeArabic(stud.admin) === normalizeArabic(s.admin))
                ).length;
                return (
                  <tr key={s.id}>
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{s.session_no}</td>
                    <td>{s.mohfez}</td>
                    <td>{s.admin}</td>
                    <td>{s.center}</td>
                    <td>{s.branch}</td>
                    <td>{s.rowaq}</td>
                    <td>{s.level}</td>
                    <td>{s.student_type}</td>
                    <td>{studentCount}</td>
                    <td className="actions-cell" style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                      <Link to={`/sessions/${s.id}/attendance`} title="الغياب" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', textDecoration: 'none' }}>
                        <ClipboardCheck size={14}/> الغياب
                      </Link>
                      <Link to={`/sessions/${s.id}/reports`} title="التقارير اليومية" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', textDecoration: 'none' }}>
                        <FileText size={14}/> التقارير
                      </Link>
                      {hasPermission('sessions', 'edit') && (
                        <Link to={`/sessions/create?id=${s.id}`} className="action-icon edit" style={{textDecoration: 'none', color: 'inherit'}} title="تعديل"><Edit size={16}/></Link>
                      )}
                      {hasPermission('sessions', 'delete') && (
                        <button className="action-icon delete" title="حذف" onClick={() => deleteSession(s.id)}><Trash2 size={16}/></button>
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
  );
}

export default SessionsList;
