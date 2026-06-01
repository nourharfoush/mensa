import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, Upload, Edit, Trash2, ClipboardCheck, FileText } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX, importFromXLSX } from '../utils/xlsxHelper';
import egyptCenters from '../data/egyptCenters';

const governorates = Object.keys(egyptCenters);

function SessionsList() {
  const { sessions, deleteSession, addSession, branches, hasPermission } = useAppData();
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

  const availableCenters = filterAdmin ? (egyptCenters[filterAdmin] || []) : [];
  const availableBranches = branches.filter(b => b.admin === filterAdmin && b.center === filterCenter);

  const filtered = sessions.filter(s => {
    // 1. Geographic role restrictions
    if (isRowaqStaff && userAdmin && s.admin !== userAdmin) return false;
    if (isBranchCoordinator && userBranch && s.branch !== userBranch) return false;
    if (isMohfez) {
      if (userSession) {
        if (String(s.id) !== String(userSession) && s.session_name !== userSession && s.session_no !== userSession) return false;
      } else if (userBranch) {
        if (s.branch !== userBranch) return false;
      }
    }

    // 2. Normal filters
    return (
      (filterAdmin ? s.admin === filterAdmin : true) &&
      (filterCenter ? s.center === filterCenter : true) &&
      (filterBranch ? s.branch === filterBranch : true) &&
      (filterRowaq ? s.rowaq === filterRowaq : true) &&
      (filterStudentType ? s.student_type === filterStudentType : true) &&
      (filterAttendance ? s.attendance_type === filterAttendance : true)
    );
  });

  const handleExport = () => {
    const exportData = filtered.map(s => ({
      'رقم الحلقة': s.session_no,
      'المحفظ': s.mohfez || '',
      'الإدارة': s.admin,
      'المركز': s.center,
      'الفرع': s.branch,
      'الرواق': s.rowaq,
      'المستوى': s.level,
      'الدارسين': s.student_type,
    }));
    exportToXLSX(exportData, 'الحلقات', 'إدارة الحلقات');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await importFromXLSX(file);
      rows.forEach(row => {
        addSession({
          session_no: row['رقم الحلقة'] || Date.now().toString().slice(-8),
          mohfez: row['المحفظ'] || '',
          admin: row['الإدارة'] || '',
          center: row['المركز'] || '',
          branch: row['الفرع'] || '',
          rowaq: row['الرواق'] || '',
          level: row['المستوى'] || '',
          student_type: row['الدارسين'] || '',
        });
      });
      alert('تم استيراد البيانات بنجاح');
    } catch {
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
              <option value="رواق القرآن الكريم (أطفال)">رواق القرآن الكريم (أطفال)</option>
              <option value="رواق القرآن الكريم (كبار)">رواق القرآن الكريم (كبار)</option>
              <option value="رواق التجويد">رواق التجويد</option>
              <option value="رواق القراءات">رواق القراءات</option>
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
              <th>الدارسين</th>
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
                  <td style={{ direction: 'ltr', textAlign: 'right' }}>{s.session_no}</td>
                  <td>{s.mohfez}</td>
                  <td>{s.admin}</td>
                  <td>{s.center}</td>
                  <td>{s.branch}</td>
                  <td>{s.rowaq}</td>
                  <td>{s.level}</td>
                  <td>{s.student_type}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SessionsList;
