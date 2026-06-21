import React, { useState } from 'react';
import { 
  GitBranch, User, Users, BookOpen, RotateCcw, Trash2, Search, Archive
} from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';

function ArchiveList() {
  const {
    branches, coordinators, mohfezs, sessions, students,
    updateBranch, updateCoordinator, updateMohfez, updateSession, updateStudent,
    deleteBranch, deleteCoordinator, deleteMohfez, deleteSession, deleteStudent
  } = useAppData();

  // Get current user and role
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const role = currentUser ? currentUser.role : '';
  const isAllowed = ['admin', 'rowaq_admin', 'rowaq_manager', 'rowaq_tech'].includes(role);

  // Active tab state
  const [activeTab, setActiveTab] = useState('branches');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAllowed) {
    return (
      <div className="management-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="box-card" style={{ textAlign: 'center', maxWidth: '500px', padding: '40px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '15px' }}>عذراً، ليس لديك صلاحية لعرض هذا القسم</h3>
          <p style={{ color: 'var(--text-secondary)' }}>يرجى التواصل مع مدير النظام للحصول على الصلاحيات اللازمة.</p>
        </div>
      </div>
    );
  }

  // Filter archived records
  const archivedBranches = branches.filter(b => b && b.isArchived);
  const archivedCoordinators = coordinators.filter(c => c && c.isArchived);
  const archivedMohfezs = mohfezs.filter(m => m && m.isArchived);
  const archivedSessions = sessions.filter(s => s && s.isArchived);
  const archivedStudents = students.filter(s => s && s.isArchived);

  // Restore Handlers
  const handleRestoreBranch = (id) => {
    if (window.confirm('هل أنت متأكد من استرجاع هذا الفرع إلى القائمة النشطة؟')) {
      updateBranch(id, { isArchived: false });
    }
  };

  const handleRestoreCoordinator = (id) => {
    if (window.confirm('هل أنت متأكد من استرجاع هذا المنسق إلى القائمة النشطة؟')) {
      updateCoordinator(id, { isArchived: false });
    }
  };

  const handleRestoreMohfez = (id) => {
    if (window.confirm('هل أنت متأكد من استرجاع هذا المحفظ إلى القائمة النشطة؟')) {
      updateMohfez(id, { isArchived: false });
    }
  };

  const handleRestoreSession = (id) => {
    if (window.confirm('هل أنت متأكد من استرجاع هذه الحلقة إلى القائمة النشطة؟')) {
      updateSession(id, { isArchived: false });
    }
  };

  const handleRestoreStudent = (id) => {
    if (window.confirm('هل أنت متأكد من استرجاع هذا الدارس إلى القائمة النشطة؟')) {
      updateStudent(id, { isArchived: false });
    }
  };

  // Search logic helper
  const normalize = (str) => {
    if (!str) return '';
    return str.toString().trim().toLowerCase();
  };

  const filterBySearch = (items, fields) => {
    if (!searchTerm) return items;
    const query = normalize(searchTerm);
    return items.filter(item => 
      item && fields.some(field => normalize(item[field]).includes(query))
    );
  };

  return (
    <div className="management-page">
      <style>{`
        .archive-tabs-container {
          display: flex;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 25px;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 5px;
        }
        .archive-tab-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 12px 24px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px 8px 0 0;
          display: flex;
          align-items: center;
          gap: 10px;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .archive-tab-btn:hover {
          color: var(--text-primary);
          background-color: rgba(255, 255, 255, 0.02);
        }
        .archive-tab-btn.active {
          color: var(--accent-gold);
          border-bottom: 3px solid var(--accent-gold);
          background-color: rgba(212, 175, 55, 0.06);
        }
        .archive-badge {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        .archive-tab-btn.active .archive-badge {
          background-color: var(--accent-gold);
          color: #11141d;
        }
        .actions-cell-archive {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .action-btn-restore {
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.2);
        }
        .action-btn-restore:hover {
          background-color: rgba(16, 185, 129, 0.1);
        }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div className="title-section">
          <h2>أرشيف شؤون الأروقة</h2>
          <p>إدارة واسترجاع السجلات المؤرشفة أو حذفها نهائياً من النظام</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="archive-tabs-container">
        <button 
          className={`archive-tab-btn ${activeTab === 'branches' ? 'active' : ''}`}
          onClick={() => { setActiveTab('branches'); setSearchTerm(''); }}
        >
          <GitBranch size={18} />
          <span>الفروع المؤرشفة</span>
          <span className="archive-badge">{archivedBranches.length}</span>
        </button>

        <button 
          className={`archive-tab-btn ${activeTab === 'coordinators' ? 'active' : ''}`}
          onClick={() => { setActiveTab('coordinators'); setSearchTerm(''); }}
        >
          <User size={18} />
          <span>المنسقين المؤرشفين</span>
          <span className="archive-badge">{archivedCoordinators.length}</span>
        </button>

        <button 
          className={`archive-tab-btn ${activeTab === 'mohfezs' ? 'active' : ''}`}
          onClick={() => { setActiveTab('mohfezs'); setSearchTerm(''); }}
        >
          <Users size={18} />
          <span>المحفظين المؤرشفين</span>
          <span className="archive-badge">{archivedMohfezs.length}</span>
        </button>

        <button 
          className={`archive-tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => { setActiveTab('sessions'); setSearchTerm(''); }}
        >
          <Users size={18} />
          <span>الحلقات المؤرشفة</span>
          <span className="archive-badge">{archivedSessions.length}</span>
        </button>

        <button 
          className={`archive-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => { setActiveTab('students'); setSearchTerm(''); }}
        >
          <BookOpen size={18} />
          <span>الدارسين المؤرشفين</span>
          <span className="archive-badge">{archivedStudents.length}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section box-card" style={{ marginBottom: '20px', padding: '15px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', width: '100%' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }} 
              placeholder="ابحث في الأرشيف الحالي..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && (
            <button className="btn btn-outline" onClick={() => setSearchTerm('')}>إلغاء التصفية</button>
          )}
        </div>
      </div>

      {/* Content according to selected tab */}
      {activeTab === 'branches' && (
        <div className="table-wrapper box-card">
          <table className="management-table">
            <thead>
              <tr>
                <th>اسم الفرع</th>
                <th>الإدارة</th>
                <th>المركز</th>
                <th>رقم القرار</th>
                <th>أيام العمل</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filterBySearch(archivedBranches, ['name', 'admin', 'center', 'decision_no']).length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                    لا توجد فروع مؤرشفة تطابق البحث.
                  </td>
                </tr>
              ) : (
                filterBySearch(archivedBranches, ['name', 'admin', 'center', 'decision_no']).map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 'bold' }}>{b.name}</td>
                    <td>{b.admin}</td>
                    <td>{b.center}</td>
                    <td>{b.decision_no || '-'}</td>
                    <td>{(b.workDays || []).join('، ') || 'غير محدد'}</td>
                    <td className="actions-cell">
                      <div className="actions-cell-archive">
                        <button 
                          className="action-icon edit action-btn-restore" 
                          title="استرجاع الفرع" 
                          onClick={() => handleRestoreBranch(b.id)}
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button 
                          className="action-icon delete" 
                          title="حذف نهائي" 
                          onClick={() => deleteBranch(b.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'coordinators' && (
        <div className="table-wrapper box-card">
          <table className="management-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الإدارة</th>
                <th>المركز</th>
                <th>الفرع</th>
                <th>التخصص</th>
                <th>رقم السجل</th>
                <th>الرقم القومي</th>
                <th>الهاتف</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filterBySearch(archivedCoordinators, ['name', 'admin', 'center', 'branch', 'specialization', 'registry_no', 'national_id', 'phone']).length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                    لا يوجد منسقين مؤرشفين يطابقون البحث.
                  </td>
                </tr>
              ) : (
                filterBySearch(archivedCoordinators, ['name', 'admin', 'center', 'branch', 'specialization', 'registry_no', 'national_id', 'phone']).map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 'bold' }}>{c.name}</td>
                    <td>{c.admin}</td>
                    <td>{c.center}</td>
                    <td>{c.branch}</td>
                    <td>{c.specialization}</td>
                    <td>{c.registry_no}</td>
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{c.national_id}</td>
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{c.phone}</td>
                    <td className="actions-cell">
                      <div className="actions-cell-archive">
                        <button 
                          className="action-icon edit action-btn-restore" 
                          title="استرجاع المنسق" 
                          onClick={() => handleRestoreCoordinator(c.id)}
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button 
                          className="action-icon delete" 
                          title="حذف نهائي" 
                          onClick={() => deleteCoordinator(c.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'mohfezs' && (
        <div className="table-wrapper box-card">
          <table className="management-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الإدارة</th>
                <th>المركز</th>
                <th>الفرع</th>
                <th>الرواق</th>
                <th>رقم السجل</th>
                <th>الرقم القومي</th>
                <th>الهاتف</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filterBySearch(archivedMohfezs, ['name', 'admin', 'center', 'branch', 'rowaq', 'registry_no', 'national_id', 'phone']).length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                    لا يوجد محفظين مؤرشفين يطابقون البحث.
                  </td>
                </tr>
              ) : (
                filterBySearch(archivedMohfezs, ['name', 'admin', 'center', 'branch', 'rowaq', 'registry_no', 'national_id', 'phone']).map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 'bold' }}>{m.name}</td>
                    <td>{m.admin}</td>
                    <td>{m.center}</td>
                    <td>{m.branch}</td>
                    <td>{m.rowaq}</td>
                    <td>{m.registry_no}</td>
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{m.national_id}</td>
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{m.phone}</td>
                    <td className="actions-cell">
                      <div className="actions-cell-archive">
                        <button 
                          className="action-icon edit action-btn-restore" 
                          title="استرجاع المحفظ" 
                          onClick={() => handleRestoreMohfez(m.id)}
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button 
                          className="action-icon delete" 
                          title="حذف نهائي" 
                          onClick={() => deleteMohfez(m.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'sessions' && (
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
                <th>نوع الحضور</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filterBySearch(archivedSessions, ['session_no', 'mohfez', 'admin', 'center', 'branch', 'rowaq', 'level', 'student_type', 'attendance_type']).length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                    لا توجد حلقات مؤرشفة تطابق البحث.
                  </td>
                </tr>
              ) : (
                filterBySearch(archivedSessions, ['session_no', 'mohfez', 'admin', 'center', 'branch', 'rowaq', 'level', 'student_type', 'attendance_type']).map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 'bold', direction: 'ltr', textAlign: 'right' }}>{s.session_no}</td>
                    <td>{s.mohfez}</td>
                    <td>{s.admin}</td>
                    <td>{s.center}</td>
                    <td>{s.branch}</td>
                    <td>{s.rowaq}</td>
                    <td>{s.level}</td>
                    <td>{s.student_type}</td>
                    <td>{s.attendance_type}</td>
                    <td className="actions-cell">
                      <div className="actions-cell-archive">
                        <button 
                          className="action-icon edit action-btn-restore" 
                          title="استرجاع الحلقة" 
                          onClick={() => handleRestoreSession(s.id)}
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button 
                          className="action-icon delete" 
                          title="حذف نهائي" 
                          onClick={() => deleteSession(s.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'students' && (
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
              {filterBySearch(archivedStudents, ['name', 'admin', 'center', 'branch', 'session_no', 'rowaq', 'gender', 'level']).length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                    لا يوجد دارسين مؤرشفين يطابقون البحث.
                  </td>
                </tr>
              ) : (
                filterBySearch(archivedStudents, ['name', 'admin', 'center', 'branch', 'session_no', 'rowaq', 'gender', 'level']).map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 'bold' }}>{s.name}</td>
                    <td>{s.admin}</td>
                    <td>{s.center}</td>
                    <td>{s.branch}</td>
                    <td>{s.session_no || '-'}</td>
                    <td>{s.rowaq}</td>
                    <td>{s.gender || '-'}</td>
                    <td>{s.level}</td>
                    <td className="actions-cell">
                      <div className="actions-cell-archive">
                        <button 
                          className="action-icon edit action-btn-restore" 
                          title="استرجاع الدارس" 
                          onClick={() => handleRestoreStudent(s.id)}
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button 
                          className="action-icon delete" 
                          title="حذف نهائي" 
                          onClick={() => deleteStudent(s.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ArchiveList;
