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
  const { sessions, platformSessions, attendances, deleteAttendance } = useAppData();
  
  const sessionId = id;
  const session = isPlatform
    ? platformSessions.find(s => String(s.id) === String(id))
    : sessions.find(s => String(s.id) === String(id));
  const sessionAttendances = attendances.filter(a => String(a.sessionId) === String(sessionId) && !!a.isPlatform === isPlatform);


  const handleExport = () => {
    const exportData = sessionAttendances.map(a => ({
      'التاريخ': a.date,
      'الحاضرين': a.presentCount,
      'الغائبين': a.absentCount,
    }));
    exportToXLSX(exportData, `غياب_حلقة_${session?.session_no || sessionId}`, `إدارة الغياب - حلقة: ${session?.session_no || sessionId}`);
  };

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
