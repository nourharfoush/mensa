import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Plus, Trash2, Eye, Download } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX } from '../utils/xlsxHelper';

function SessionAttendance() {
  const { id } = useParams();
  const location = useLocation();
  const isPlatform = location.pathname.startsWith('/platform-sessions');
  const { sessions, platformSessions, attendances, deleteAttendance, hasPermission } = useAppData();
  
  const sessionId = id;
  const session = isPlatform
    ? platformSessions.find(s => String(s.id) === String(id))
    : sessions.find(s => String(s.id) === String(id));
  const sessionAttendances = attendances.filter(a => String(a.sessionId) === String(sessionId) && !!a.isPlatform === isPlatform);

  // Get current user and role
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const role = currentUser ? currentUser.role : 'admin';
  const userAdmin = currentUser ? currentUser.userAdmin : '';
  const userBranch = currentUser ? currentUser.userBranch : '';
  const userSession = currentUser ? currentUser.userSession : '';

  const isSuperAdmin = role === 'admin';
  const isRowaqAdmin = role === 'rowaq_admin';
  const isPlatformAdmin = role === 'platform_admin';
  const isRowaqStaff = ['rowaq_manager', 'rowaq_tech', 'rowaq_member'].includes(role);
  const isBranchCoordinator = ['branch_admin_coordinator', 'branch_scientific_coordinator'].includes(role);
  const isMohfez = role === 'mohfez';
  const isPlatformCoordinator = role === 'platform_coordinator';
  const isPlatformMohfez = role === 'platform_mohfez';
  const isStudent = role === 'student';

  const normalizeArabic = (str) => {
    if (!str) return '';
    return str
      .toString()
      .trim()
      .normalize('NFKD')
      .normalize('NFC')
      .replace(/ً/g, '')
      .replace(/ٌ/g, '')
      .replace(/ٍ/g, '')
      .replace(/َ/g, '')
      .replace(/ُ/g, '')
      .replace(/ِ/g, '')
      .replace(/ّ/g, '')
      .replace(/ْ/g, '')
      .replace(/[أإآا]/g, 'ا')
      .replace(/[ىي]/g, 'ي')
      .replace(/[ة]/g, 'ه')
      .replace(/[ـ]/g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .trim();
  };

  // Check geographic access to the session
  let hasGeographicAccess = true;
  if (!isSuperAdmin) {
    if (isRowaqAdmin && isPlatform) hasGeographicAccess = false;
    if (isPlatformAdmin && !isPlatform) hasGeographicAccess = false;

    if (session) {
      if (isRowaqStaff && userAdmin && session.admin !== userAdmin) hasGeographicAccess = false;
      if (isBranchCoordinator && userBranch && session.branch !== userBranch) hasGeographicAccess = false;
      if (isMohfez || isPlatformMohfez) {
        if (currentUser.name && normalizeArabic(session.mohfez) !== normalizeArabic(currentUser.name)) {
          hasGeographicAccess = false;
        }
      }
      if ((isMohfez || isPlatformMohfez || isPlatformCoordinator || isStudent) && userSession) {
        if (String(session.id) !== String(userSession) && session.session_name !== userSession && session.session_no !== userSession) {
          hasGeographicAccess = false;
        }
      }
    } else {
      hasGeographicAccess = false;
    }
  }


  const handleExport = () => {
    const exportData = sessionAttendances.map(a => ({
      'التاريخ': a.date,
      'الحاضرين': a.presentCount,
      'الغائبين': a.absentCount,
    }));
    exportToXLSX(exportData, `غياب_حلقة_${session?.session_no || sessionId}`, `إدارة الغياب - حلقة: ${session?.session_no || sessionId}`);
  };

  if (!hasPermission('sessions', 'view') || !hasGeographicAccess) {
    return (
      <div className="management-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="box-card" style={{ textAlign: 'center', maxWidth: '500px', padding: '40px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '15px' }}>عذراً، ليس لديك صلاحية لعرض هذا القسم</h3>
          <p style={{ color: 'var(--text-secondary)' }}>يرجى التواصل مع مدير النظام للحصول على الصلاحيات اللازمة أو التأكد من نطاق صلاحيتك الجغرافية.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', width: '100%' }}>ادارة الغياب [حلقة:{session?.session_no || sessionId}]</h2>
      </div>

      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse', marginBottom: '15px' }}>
        <div className="action-buttons" style={{ flexDirection: 'row-reverse' }}>
          <Link to={isPlatform ? `/platform-sessions/${sessionId}/attendance/add` : `/sessions/${sessionId}/attendance/add`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={16} /> إضافة الغياب
          </Link>
        </div>
      </div>

      <div className="table-wrapper box-card">
        <table className="management-table">
          <thead>
            <tr>
              <th colSpan="4" style={{ textAlign: 'center', background: 'var(--bg-card)' }}>الغياب</th>
            </tr>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              <th style={{ textAlign: 'center' }}>التاريخ</th>
              <th style={{ textAlign: 'center' }}>الحاضرين</th>
              <th style={{ textAlign: 'center' }}>الغائبين</th>
              <th style={{ textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {sessionAttendances.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  لا يوجد سجلات غياب لهذه الحلقة.
                </td>
              </tr>
            ) : (
              sessionAttendances.map(a => (
                <tr key={a.id}>
                  <td style={{ direction: 'ltr', textAlign: 'center' }}>{a.date}</td>
                  <td style={{ textAlign: 'center' }}>{a.presentCount}</td>
                  <td style={{ textAlign: 'center' }}>{a.absentCount}</td>
                  <td className="actions-cell" style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                    <button className="btn" style={{ background: '#374151', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleExport}>
                      تصدير <Download size={14} />
                    </button>
                    <button className="btn" style={{ background: '#0ea5e9', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      معاينة <Eye size={14} />
                    </button>
                    <button className="btn" style={{ background: '#ef4444', color: 'white', padding: '6px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => deleteAttendance(a.id)}>
                      <Trash2 size={14} />
                    </button>
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

export default SessionAttendance;
