import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Trash2, Search } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';

function SessionReports() {
  const { id } = useParams();
  const location = useLocation();
  const isPlatform = location.pathname.startsWith('/platform-sessions');
  const { sessions, platformSessions, sessionReports, deleteSessionReport, hasPermission } = useAppData();
  
  const sessionId = id;
  const session = isPlatform
    ? platformSessions.find(s => String(s.id) === String(id))
    : sessions.find(s => String(s.id) === String(id));
  
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

  // Check geographic access to the session
  let hasGeographicAccess = true;
  if (!isSuperAdmin) {
    if (isRowaqAdmin && isPlatform) hasGeographicAccess = false;
    if (isPlatformAdmin && !isPlatform) hasGeographicAccess = false;

    if (session) {
      if (isRowaqStaff && userAdmin && session.admin !== userAdmin) hasGeographicAccess = false;
      if (isBranchCoordinator && userBranch && session.branch !== userBranch) hasGeographicAccess = false;
      if ((isMohfez || isPlatformMohfez || isPlatformCoordinator || isStudent) && userSession) {
        if (String(session.id) !== String(userSession) && session.session_name !== userSession && session.session_no !== userSession) {
          hasGeographicAccess = false;
        }
      }
    } else {
      hasGeographicAccess = false;
    }
  }

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filter reports by session ID and optional date range
  const filteredReports = sessionReports.filter(r => {
    if (String(r.sessionId) !== String(sessionId)) return false;
    if (!!r.isPlatform !== isPlatform) return false;
    if (dateFrom && r.date < dateFrom) return false;
    if (dateTo && r.date > dateTo) return false;
    return true;
  });

  const renderSectionBadge = (section) => {
    if (!section || !section.fromSurah) return <span style={{ color: 'var(--text-muted)' }}>-</span>;
    return (
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', direction: 'rtl' }}>
        <span style={{ background: '#f59e0b20', color: '#f59e0b', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
          من سورة: {section.fromSurah} | من الآية: {section.fromAyah}
        </span>
        <span style={{ background: '#3b82f620', color: '#3b82f6', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
          إلى سورة: {section.toSurah} | إلى الآية: {section.toAyah}
        </span>
      </div>
    );
  };

  if (!hasPermission('reports', 'view') || !hasGeographicAccess) {
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
        <h2 style={{ textAlign: 'center', width: '100%' }}>ادارة التقارير اليومية [حلقة:{session?.session_no || sessionId}]</h2>
      </div>

      {/* Filters */}
      <div className="search-section box-card" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '15px' }}>بحث</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label>من التاريخ</label>
            <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label>الي التاريخ</label>
            <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={() => {}}><Search size={16} /> بحث</button>
            <button className="btn btn-outline" onClick={() => { setDateFrom(''); setDateTo(''); }}>إعادة ادخال</button>
          </div>
        </div>
      </div>

      <div className="table-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        {hasPermission('reports', 'add') ? (
          <Link to={isPlatform ? `/platform-sessions/${sessionId}/reports/add` : `/sessions/${sessionId}/reports/add`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
            إضافة تقرير يومي
          </Link>
        ) : (
          <div></div>
        )}
        <div style={{ fontWeight: 'bold' }}>التقارير اليومية</div>
      </div>

      <div className="table-wrapper box-card">
        <table className="management-table">
          <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              <th style={{ textAlign: 'center' }}>التاريخ</th>
              <th style={{ textAlign: 'center' }}>رقم الجلسة</th>
              <th style={{ textAlign: 'center' }}>الحفظ</th>
              <th style={{ textAlign: 'center' }}>المراجعة / التسميع</th>
              <th style={{ textAlign: 'center' }}>مراجعة الماضي القريب</th>
              <th style={{ textAlign: 'center' }}>مراجعة الماضي البعيد</th>
              <th style={{ textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  لا توجد تقارير لهذه الحلقة.
                </td>
              </tr>
            ) : (
              filteredReports.map(r => (
                <tr key={r.id}>
                  <td style={{ direction: 'ltr', textAlign: 'center', fontWeight: 'bold' }}>{r.date}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{r.sessionNum || '-'}</td>
                  <td style={{ textAlign: 'center' }}>{renderSectionBadge(r.memorization)}</td>
                  <td style={{ textAlign: 'center' }}>{renderSectionBadge(r.review)}</td>
                  <td style={{ textAlign: 'center' }}>{renderSectionBadge(r.recentReview)}</td>
                  <td style={{ textAlign: 'center' }}>{renderSectionBadge(r.distantReview)}</td>
                  <td className="actions-cell" style={{ display: 'flex', justifyContent: 'center' }}>
                    {hasPermission('reports', 'delete') ? (
                      <button className="btn" style={{ background: '#ef4444', color: 'white', padding: '6px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => deleteSessionReport(r.id)}>
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
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

export default SessionReports;
