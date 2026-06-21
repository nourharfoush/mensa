import React, { useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, Download, Upload, Edit, Trash2, ArrowRight, GraduationCap, Users, BookOpen, FileText, LayoutDashboard, PlusCircle, Archive } from 'lucide-react';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { exportToXLSX, importFromXLSX } from '../utils/xlsxHelper';
import egyptCenters from '../data/egyptCenters';

const governorates = Object.keys(egyptCenters);
const workDaysList = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

function BranchesList() {
  const { 
    branches, deleteBranch, addBranch, hasPermission, sessions, coordinators, mohfezs, students, deleteAllBranches,
    deleteCoordinator, deleteMohfez, deleteSession, deleteStudent, followUpReports, sessionReports, deleteSessionReport, attendances,
    updateBranch, updateCoordinator, updateMohfez, updateSession, updateStudent
  } = useAppData();
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
  const [filterAdmin, setFilterAdmin] = useState(isRowaqStaff || isBranchCoordinator || isMohfez ? userAdmin : '');
  const [filterCenter, setFilterCenter] = useState(isBranchCoordinator || isMohfez ? userCenter : '');
  const [filterWorkDay, setFilterWorkDay] = useState('');

  // Sync filters with user profile if role is restricted
  React.useEffect(() => {
    if ((isRowaqStaff || isMohfez) && userAdmin) {
      setFilterAdmin(userAdmin);
    }
    if (isBranchCoordinator || isMohfez) {
      if (userAdmin) setFilterAdmin(userAdmin);
      if (userCenter) setFilterCenter(userCenter);
    }
  }, [currentUser]);

  const availableCenters = filterAdmin ? (egyptCenters[filterAdmin] || []) : [];

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

  const isAllowedToArchive = ['admin', 'rowaq_admin', 'rowaq_manager', 'rowaq_tech'].includes(role);

  const filtered = branches.filter(b => {
    if (b.isArchived) return false;
    // 1. Geographic role restrictions
    if (isRowaqStaff && userAdmin && normalizeArabic(b.admin) !== normalizeArabic(userAdmin)) return false;
    if (isBranchCoordinator && userBranch && normalizeArabic(b.name) !== normalizeArabic(userBranch)) return false;
    if (isMohfez) {
      const mohfezSession = sessions.find(s => String(s.id) === String(userSession) || s.session_name === userSession);
      if (mohfezSession && normalizeArabic(b.name) !== normalizeArabic(mohfezSession.branchName)) return false;
      if (!mohfezSession && userBranch && normalizeArabic(b.name) !== normalizeArabic(userBranch)) return false;
    }

    // 2. Normal filters
    return (
      (filterName ? normalizeArabic(b.name).includes(normalizeArabic(filterName)) : true) &&
      (filterAdmin ? normalizeArabic(b.admin) === normalizeArabic(filterAdmin) : true) &&
      (filterCenter ? normalizeArabic(b.center) === normalizeArabic(filterCenter) : true) &&
      (filterWorkDay 
        ? (filterWorkDay === 'لا يعمل' 
            ? (!b.workDays || b.workDays.length === 0 || b.workDays.some(d => normalizeArabic(d) === normalizeArabic('لا يعمل')))
            : (b.workDays || []).some(d => normalizeArabic(d) === normalizeArabic(filterWorkDay))
          )
        : true)
    );
  });

  const handleExport = () => {
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

    const exportData = filtered.map(b => ({
      'الكود': b.id,
      'فرع': b.name,
      'العنوان': b.address || '',
      'الهاتف': b.phone || '',
      'رقم القرار': b.decision_no || '',
      'ايام العمل': (b.workDays && b.workDays.length > 0)
        ? b.workDays.map(d => d === 'الأحد' ? 'الاحد' : d).join(',')
        : 'لا يعمل',
      'الوقت من': formatTimeTo12Hour(b.timeFrom),
      'الوقت الي': formatTimeTo12Hour(b.timeTo),
      'الإدارة': b.admin || '',
      'المركز': b.center || '',
      'المحفّظين': mohfezs.filter(m => 
        normalizeArabic(m.branch) === normalizeArabic(b.name) && 
        normalizeArabic(m.admin) === normalizeArabic(b.admin) && 
        normalizeArabic(m.center) === normalizeArabic(b.center)
      ).length,
      'المنسّقين': coordinators.filter(c => 
        normalizeArabic(c.branch) === normalizeArabic(b.name) && 
        normalizeArabic(c.admin) === normalizeArabic(b.admin) && 
        normalizeArabic(c.center) === normalizeArabic(b.center)
      ).length,
      'الحلقات': sessions.filter(s => 
        normalizeArabic(s.branch) === normalizeArabic(b.name) && 
        normalizeArabic(s.admin) === normalizeArabic(b.admin) && 
        normalizeArabic(s.center) === normalizeArabic(b.center)
      ).length,
      'الدارسين': students.filter(s => 
        normalizeArabic(s.branch) === normalizeArabic(b.name) && 
        normalizeArabic(s.admin) === normalizeArabic(b.admin) && 
        normalizeArabic(s.center) === normalizeArabic(b.center)
      ).length,
    }));
    exportToXLSX(exportData, 'الفروع', 'إدارة الفروع');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await importFromXLSX(file);
      
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

      rows.forEach(row => {
        const workDaysRaw = row['ايام العمل'] || row['أيام العمل'] || '';
        const workDays = workDaysRaw 
          ? workDaysRaw.split(/[，,،]/).map(d => d.trim()).filter(Boolean) 
          : [];
        const cleanWorkDays = workDays.map(d => d === 'الاحد' ? 'الأحد' : d);

        addBranch({
          name: row['فرع'] || row['اسم الفرع'] || '',
          admin: row['الإدارة'] || '',
          center: row['المركز'] || '',
          decision_no: row['رقم القرار'] || '',
          address: row['العنوان'] || '',
          phone: row['الهاتف'] || '',
          workDays: cleanWorkDays,
          timeFrom: parseTimeTo24Hour(row['الوقت من'] || row['من'] || ''),
          timeTo: parseTimeTo24Hour(row['الوقت الي'] || row['الوقت إلى'] || row['إلى'] || ''),
        });
      });
      alert('تم استيراد البيانات بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في استيراد الملف');
    }
    e.target.value = '';
  };

  if (!hasPermission('branches', 'view')) {
    return (
      <div className="management-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="box-card" style={{ textAlign: 'center', maxWidth: '500px', padding: '40px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '15px' }}>عذراً، ليس لديك صلاحية لعرض هذا القسم</h3>
          <p style={{ color: 'var(--text-secondary)' }}>يرجى التواصل مع مدير النظام للحصول على الصلاحيات اللازمة.</p>
        </div>
      </div>
    );
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedBranchId = searchParams.get('selectedBranchId');
  const currentBranch = selectedBranchId ? branches.find(b => String(b.id) === String(selectedBranchId)) : null;
  const [activeBranchTab, setActiveBranchTab] = useState('coordinators');
  const [reportsSubTab, setReportsSubTab] = useState('mohfez');
  const [reportYear, setReportYear] = useState(String(new Date().getFullYear()));
  const [reportMonth, setReportMonth] = useState(String(new Date().getMonth() + 1));

  const handleBack = () => {
    setSearchParams({});
  };

  const months = [
    {v:'1',l:'يناير'},{v:'2',l:'فبراير'},{v:'3',l:'مارس'},{v:'4',l:'أبريل'},
    {v:'5',l:'مايو'},{v:'6',l:'يونيو'},{v:'7',l:'يوليو'},{v:'8',l:'أغسطس'},
    {v:'9',l:'سبتمبر'},{v:'10',l:'أكتوبر'},{v:'11',l:'نوفمبر'},{v:'12',l:'ديسمبر'}
  ];

  const isReportInMonthAndYear = (reportDate, year, month) => {
    if (!reportDate) return false;
    const normalized = reportDate.replace(/\//g, '-');
    const parts = normalized.split('-');
    if (parts.length < 2) return false;
    const rYear = parts[0];
    const rMonth = parseInt(parts[1], 10).toString();
    
    const matchYear = year ? String(rYear) === String(year) : true;
    const matchMonth = month ? String(rMonth) === String(month) : true;
    
    return matchYear && matchMonth;
  };

  const getMohfezMonthlyStats = (m, year, month) => {
    const mohfezSessions = (sessions || []).filter(s => 
      normalizeArabic(s.mohfez) === normalizeArabic(m.name) && 
      !s.isPlatform
    );

    let actualSessionsCount = 0;
    let totalHours = 0.0;

    mohfezSessions.forEach(session => {
      const reports = (sessionReports || []).filter(r => 
        String(r.sessionId) === String(session.id) && 
        !r.isPlatform &&
        isReportInMonthAndYear(r.date, year, month)
      );

      actualSessionsCount += reports.length;

      reports.forEach(r => {
        const attendance = (attendances || []).find(a => 
          String(a.sessionId) === String(session.id) && 
          !a.isPlatform &&
          a.date && r.date &&
          a.date.replace(/\//g, '-') === r.date.replace(/\//g, '-')
        );

        const presentCount = attendance ? (attendance.presentCount || 0) : 0;
        
        let sessionDuration = 1.0;
        if (presentCount < 6) {
          sessionDuration = 1.0;
        } else if (presentCount === 6 || presentCount === 7) {
          sessionDuration = 1.5;
        } else {
          sessionDuration = 2.0;
        }

        // Cap by original session duration
        if (session.time_start && session.time_end) {
          const [startH, startM] = session.time_start.split(':').map(Number);
          const [endH, endM] = session.time_end.split(':').map(Number);
          const diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
          if (diffMinutes > 0) {
            const originalHours = diffMinutes / 60;
            if (sessionDuration > originalHours) {
              sessionDuration = originalHours;
            }
          }
        }

        totalHours += sessionDuration;
      });
    });

    return {
      assignedCount: mohfezSessions.length,
      actualSessionsCount,
      totalHours
    };
  };

  // Calculate counts and items for the specific branch
  const branchCoordinators = currentBranch ? coordinators.filter(c =>
    !c.isArchived &&
    normalizeArabic(c.branch) === normalizeArabic(currentBranch.name) &&
    normalizeArabic(c.admin) === normalizeArabic(currentBranch.admin) &&
    normalizeArabic(c.center) === normalizeArabic(currentBranch.center)
  ) : [];

  const branchMohfezs = currentBranch ? mohfezs.filter(m =>
    !m.isArchived &&
    normalizeArabic(m.branch) === normalizeArabic(currentBranch.name) &&
    normalizeArabic(m.admin) === normalizeArabic(currentBranch.admin) &&
    normalizeArabic(m.center) === normalizeArabic(currentBranch.center)
  ) : [];

  const branchSessions = currentBranch ? sessions.filter(s =>
    !s.isArchived &&
    normalizeArabic(s.branch) === normalizeArabic(currentBranch.name) &&
    normalizeArabic(s.admin) === normalizeArabic(currentBranch.admin) &&
    normalizeArabic(s.center) === normalizeArabic(currentBranch.center)
  ) : [];

  const branchStudents = currentBranch ? students.filter(s =>
    !s.isArchived &&
    normalizeArabic(s.branch) === normalizeArabic(currentBranch.name) &&
    normalizeArabic(s.admin) === normalizeArabic(currentBranch.admin) &&
    normalizeArabic(s.center) === normalizeArabic(currentBranch.center)
  ) : [];

  const branchReports = currentBranch ? followUpReports.filter(r =>
    normalizeArabic(r.branch) === normalizeArabic(currentBranch.name) &&
    normalizeArabic(r.admin) === normalizeArabic(currentBranch.admin) &&
    normalizeArabic(r.center) === normalizeArabic(currentBranch.center)
  ) : [];

  const branchSessionIds = currentBranch ? new Set(branchSessions.map(s => String(s.id))) : new Set();
  const branchSessionReports = currentBranch ? sessionReports.filter(r =>
    branchSessionIds.has(String(r.sessionId))
  ) : [];

  if (currentBranch) {
    return (
      <div className="management-page">
        <style>{`
          .branch-dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 15px;
          }
          .branch-info-card {
            background-color: var(--bg-card);
            border: 1px solid var(--accent-gold-dark);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          .info-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          .info-label {
            color: var(--text-secondary);
            font-size: 13px;
          }
          .info-val {
            color: var(--text-primary);
            font-weight: 600;
            font-size: 15px;
          }
          .branch-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
          }
          .stat-card-mini {
            background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%);
            border: 1px solid var(--border-subtle);
            border-radius: 10px;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
            transition: all 0.2s ease;
            cursor: pointer;
          }
          .stat-card-mini:hover, .stat-card-mini.active {
            border-color: var(--accent-gold);
            background-color: rgba(212, 175, 55, 0.05);
          }
          .stat-icon-wrapper {
            width: 45px;
            height: 45px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .stat-details {
            display: flex;
            flex-direction: column;
          }
          .stat-count {
            font-size: 18px;
            font-weight: bold;
            color: var(--text-primary);
          }
          .stat-title {
            font-size: 13px;
            color: var(--text-secondary);
          }
          .branch-tabs-container {
            display: flex;
            border-bottom: 1px solid var(--border-subtle);
            margin-bottom: 20px;
            gap: 5px;
            overflow-x: auto;
            padding-bottom: 5px;
          }
          .branch-tab-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border-radius: 8px 8px 0 0;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
            transition: all 0.2s ease;
          }
          .branch-tab-btn:hover {
            color: var(--text-primary);
            background-color: rgba(255, 255, 255, 0.02);
          }
          .branch-tab-btn.active {
            color: var(--accent-gold);
            border-bottom: 2px solid var(--accent-gold);
            background-color: rgba(212, 175, 55, 0.05);
          }
          .quick-add-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-top: 10px;
          }
          .quick-add-card {
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            transition: all 0.2s ease;
            text-decoration: none;
            color: inherit;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            background: linear-gradient(180deg, rgba(255,255,255,0.01) 0%, transparent 100%);
          }
          .quick-add-card:hover {
            border-color: var(--accent-gold);
            background-color: rgba(212, 175, 55, 0.03);
            transform: translateY(-2px);
          }
          .quick-add-icon-box {
            width: 50px;
            height: 50px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(212, 175, 55, 0.1);
            color: var(--accent-gold);
          }
          .quick-add-card h4 {
            font-size: 16px;
            margin: 0;
            color: var(--text-primary);
          }
          .quick-add-card p {
            font-size: 13px;
            color: var(--text-secondary);
            margin: 0;
          }
        `}</style>

        {/* Header */}
        <div className="branch-dashboard-header">
          <div className="title-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
              <span style={{ color: 'var(--text-muted)' }}>الفروع</span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span style={{ color: 'var(--accent-gold)' }}>{currentBranch.name}</span>
            </div>
            <h2>لوحة التحكم للفرع: {currentBranch.name}</h2>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" onClick={handleBack}>
              <ArrowRight size={16} /> عودة لقائمة الفروع
            </button>
            {hasPermission('branches', 'edit') && (
              <Link 
                to={`/branches/create?id=${currentBranch.id}&redirect=${encodeURIComponent('/branches?selectedBranchId=' + currentBranch.id)}`} 
                className="btn btn-gold-outline"
                style={{ textDecoration: 'none' }}
              >
                <Edit size={16} /> تعديل بيانات الفرع
              </Link>
            )}
          </div>
        </div>

        {/* Branch Info Card */}
        <div className="branch-info-card">
          <div className="info-item">
            <span className="info-label">الإدارة (المحافظة)</span>
            <span className="info-val">{currentBranch.admin}</span>
          </div>
          <div className="info-item">
            <span className="info-label">المركز</span>
            <span className="info-val">{currentBranch.center}</span>
          </div>
          <div className="info-item">
            <span className="info-label">أيام العمل</span>
            <span className="info-val">{(currentBranch.workDays || []).join('، ') || 'غير محدد'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">مواعيد العمل</span>
            <span className="info-val">
              {currentBranch.timeFrom && currentBranch.timeTo 
                ? `من ${currentBranch.timeFrom} إلى ${currentBranch.timeTo}`
                : 'غير محدد'}
            </span>
          </div>
          {currentBranch.decision_no && (
            <div className="info-item">
              <span className="info-label">رقم القرار</span>
              <span className="info-val">{currentBranch.decision_no}</span>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="branch-stats-grid">
          <div className={`stat-card-mini ${activeBranchTab === 'coordinators' ? 'active' : ''}`} onClick={() => setActiveBranchTab('coordinators')}>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
              <GraduationCap size={22} />
            </div>
            <div className="stat-details">
              <span className="stat-count">{branchCoordinators.length}</span>
              <span className="stat-title">منسقين</span>
            </div>
          </div>

          <div className={`stat-card-mini ${activeBranchTab === 'mohfezs' ? 'active' : ''}`} onClick={() => setActiveBranchTab('mohfezs')}>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
              <Users size={22} />
            </div>
            <div className="stat-details">
              <span className="stat-count">{branchMohfezs.length}</span>
              <span className="stat-title">محفظين</span>
            </div>
          </div>

          <div className={`stat-card-mini ${activeBranchTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveBranchTab('sessions')}>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <BookOpen size={22} />
            </div>
            <div className="stat-details">
              <span className="stat-count">{branchSessions.length}</span>
              <span className="stat-title">حلقات</span>
            </div>
          </div>

          <div className={`stat-card-mini ${activeBranchTab === 'students' ? 'active' : ''}`} onClick={() => setActiveBranchTab('students')}>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <BookOpen size={22} />
            </div>
            <div className="stat-details">
              <span className="stat-count">{branchStudents.length}</span>
              <span className="stat-title">دارسين</span>
            </div>
          </div>

          <div className={`stat-card-mini ${activeBranchTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveBranchTab('reports')}>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
              <FileText size={22} />
            </div>
            <div className="stat-details">
              <span className="stat-count">{branchReports.length + branchSessionReports.length}</span>
              <span className="stat-title">تقارير</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="branch-tabs-container">
          <button className={`branch-tab-btn ${activeBranchTab === 'coordinators' ? 'active' : ''}`} onClick={() => setActiveBranchTab('coordinators')}>
            <GraduationCap size={16} />
            <span>المنسقين ({branchCoordinators.length})</span>
          </button>
          <button className={`branch-tab-btn ${activeBranchTab === 'mohfezs' ? 'active' : ''}`} onClick={() => setActiveBranchTab('mohfezs')}>
            <Users size={16} />
            <span>المحفظين ({branchMohfezs.length})</span>
          </button>
          <button className={`branch-tab-btn ${activeBranchTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveBranchTab('sessions')}>
            <BookOpen size={16} />
            <span>الحلقات ({branchSessions.length})</span>
          </button>
          <button className={`branch-tab-btn ${activeBranchTab === 'students' ? 'active' : ''}`} onClick={() => setActiveBranchTab('students')}>
            <BookOpen size={16} />
            <span>الدارسين ({branchStudents.length})</span>
          </button>
          <button className={`branch-tab-btn ${activeBranchTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveBranchTab('reports')}>
            <FileText size={16} />
            <span>التقارير ({branchReports.length + branchSessionReports.length})</span>
          </button>
          <button className={`branch-tab-btn ${activeBranchTab === 'new' ? 'active' : ''}`} onClick={() => setActiveBranchTab('new')}>
            <PlusCircle size={16} style={{ color: 'var(--accent-gold)' }} />
            <span style={{ color: 'var(--accent-gold)' }}>إضافة جديد</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeBranchTab === 'coordinators' && (
          <div className="box-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '16px', margin: 0 }}>قائمة المنسقين للفرع ({branchCoordinators.length})</h3>
              {hasPermission('coordinators', 'add') && (
                <Link 
                  to={`/coordinators/create?admin=${currentBranch.admin}&center=${currentBranch.center}&branch=${currentBranch.name}&redirect=${encodeURIComponent('/branches?selectedBranchId=' + currentBranch.id)}`} 
                  className="btn btn-primary"
                  style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '13px' }}
                >
                  <Plus size={14} /> إضافة منسق للفرع
                </Link>
              )}
            </div>
            <div className="table-wrapper">
              <table className="management-table">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>التخصص</th>
                    <th>رقم السجل</th>
                    <th>الرقم القومي</th>
                    <th>الهاتف</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {branchCoordinators.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>لا يوجد منسقين مسجلين لهذا الفرع.</td>
                    </tr>
                  ) : (
                    branchCoordinators.map(c => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.specialization}</td>
                        <td>{c.registry_no}</td>
                        <td style={{ direction: 'ltr' }}>{c.national_id}</td>
                        <td style={{ direction: 'ltr' }}>{c.phone}</td>
                        <td className="actions-cell">
                          {hasPermission('coordinators', 'edit') && (
                            <Link to={`/coordinators/create?id=${c.id}&redirect=${encodeURIComponent('/branches?selectedBranchId=' + currentBranch.id)}`} className="action-icon edit" style={{ color: 'inherit' }}><Edit size={14} /></Link>
                          )}
                          {isAllowedToArchive && (
                            <button className="action-icon edit" title="أرشفة" onClick={() => { if (window.confirm('هل أنت متأكد من أرشفة المنسق؟')) updateCoordinator(c.id, { isArchived: true }); }} style={{ color: 'var(--accent-gold)' }}><Archive size={14} /></button>
                          )}
                          {hasPermission('coordinators', 'delete') && (
                            <button className="action-icon delete" onClick={() => { if (window.confirm('هل أنت متأكد من حذف المنسق؟')) deleteCoordinator(c.id); }}><Trash2 size={14} /></button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeBranchTab === 'mohfezs' && (
          <div className="box-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '16px', margin: 0 }}>قائمة المحفظين للفرع ({branchMohfezs.length})</h3>
              {hasPermission('mohfezs', 'add') && (
                <Link 
                  to={`/mohfez/create?admin=${currentBranch.admin}&center=${currentBranch.center}&branch=${currentBranch.name}&redirect=${encodeURIComponent('/branches?selectedBranchId=' + currentBranch.id)}`} 
                  className="btn btn-primary"
                  style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '13px' }}
                >
                  <Plus size={14} /> إضافة محفظ للفرع
                </Link>
              )}
            </div>
            <div className="table-wrapper">
              <table className="management-table">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الوظيفة</th>
                    <th>رقم السجل</th>
                    <th>الرقم القومي</th>
                    <th>الهاتف</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {branchMohfezs.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>لا يوجد محفظين مسجلين لهذا الفرع.</td>
                    </tr>
                  ) : (
                    branchMohfezs.map(m => (
                      <tr key={m.id}>
                        <td>{m.name}</td>
                        <td>{m.job || 'محفظ'}</td>
                        <td>{m.registry_no}</td>
                        <td style={{ direction: 'ltr' }}>{m.national_id}</td>
                        <td style={{ direction: 'ltr' }}>{m.phone}</td>
                        <td>
                          <span style={{ 
                            background: m.status === 'مسّكن' ? '#10b98120' : 'rgba(255,255,255,0.05)', 
                            color: m.status === 'مسّكن' ? '#10b981' : 'var(--text-secondary)',
                            padding: '3px 8px', borderRadius: '4px', fontSize: '12px'
                          }}>
                            {m.status || 'نشط'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          {hasPermission('mohfezs', 'edit') && (
                            <Link to={`/mohfez/create?id=${m.id}&redirect=${encodeURIComponent('/branches?selectedBranchId=' + currentBranch.id)}`} className="action-icon edit" style={{ color: 'inherit' }}><Edit size={14} /></Link>
                          )}
                          {isAllowedToArchive && (
                            <button className="action-icon edit" title="أرشفة" onClick={() => { if (window.confirm('هل أنت متأكد من أرشفة المحفظ؟')) updateMohfez(m.id, { isArchived: true }); }} style={{ color: 'var(--accent-gold)' }}><Archive size={14} /></button>
                          )}
                          {hasPermission('mohfezs', 'delete') && (
                            <button className="action-icon delete" onClick={() => { if (window.confirm('هل أنت متأكد من حذف المحفظ؟')) deleteMohfez(m.id); }}><Trash2 size={14} /></button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeBranchTab === 'sessions' && (
          <div className="box-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '16px', margin: 0 }}>حلقات التحفيظ للفرع ({branchSessions.length})</h3>
              {hasPermission('sessions', 'add') && (
                <Link 
                  to={`/sessions/create?admin=${currentBranch.admin}&center=${currentBranch.center}&branch=${currentBranch.name}&redirect=${encodeURIComponent('/branches?selectedBranchId=' + currentBranch.id)}`} 
                  className="btn btn-primary"
                  style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '13px' }}
                >
                  <Plus size={14} /> إضافة حلقة للفرع
                </Link>
              )}
            </div>
            <div className="table-wrapper">
              <table className="management-table">
                <thead>
                  <tr>
                    <th>رقم الحلقة</th>
                    <th>الرواق</th>
                    <th>المستوى</th>
                    <th>المحفظ</th>
                    <th>نوع الدارسين</th>
                    <th>نوع الحضور</th>
                    <th>الوقت</th>
                    <th>أيام العمل</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {branchSessions.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>لا توجد حلقات مسجلة في هذا الفرع.</td>
                    </tr>
                  ) : (
                    branchSessions.map(s => (
                      <tr key={s.id}>
                        <td>{s.session_no}</td>
                        <td>{s.rowaq}</td>
                        <td>{s.level}</td>
                        <td>{s.mohfez}</td>
                        <td>{s.student_type}</td>
                        <td>{s.attendance_type}</td>
                        <td style={{ direction: 'ltr' }}>{s.time_start} - {s.time_end}</td>
                        <td>{(s.workDays || []).join('، ')}</td>
                        <td className="actions-cell" style={{ display: 'flex', gap: '5px' }}>
                          <Link to={`/sessions/${s.id}/attendance`} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '11px', textDecoration: 'none' }}>التحضير</Link>
                          <Link to={`/sessions/${s.id}/reports`} className="btn btn-gold-outline" style={{ padding: '4px 8px', fontSize: '11px', textDecoration: 'none' }}>التقارير</Link>
                          {isAllowedToArchive && (
                            <button className="action-icon edit" title="أرشفة" onClick={() => { if (window.confirm('هل أنت متأكد من أرشفة الحلقة؟')) updateSession(s.id, { isArchived: true }); }} style={{ color: 'var(--accent-gold)' }}><Archive size={14} /></button>
                          )}
                          {hasPermission('sessions', 'edit') && (
                            <Link to={`/sessions/create?id=${s.id}&redirect=${encodeURIComponent('/branches?selectedBranchId=' + currentBranch.id)}`} className="action-icon edit" style={{ color: 'inherit' }}><Edit size={14} /></Link>
                          )}
                          {hasPermission('sessions', 'delete') && (
                            <button className="action-icon delete" onClick={() => { if (window.confirm('هل أنت متأكد من حذف الحلقة؟')) deleteSession(s.id); }}><Trash2 size={14} /></button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeBranchTab === 'students' && (
          <div className="box-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '16px', margin: 0 }}>الدارسين المسجلين بالفرع ({branchStudents.length})</h3>
              {hasPermission('students', 'add') && (
                <Link 
                  to={`/students/create?admin=${currentBranch.admin}&center=${currentBranch.center}&branch=${currentBranch.name}&redirect=${encodeURIComponent('/branches?selectedBranchId=' + currentBranch.id)}`} 
                  className="btn btn-primary"
                  style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '13px' }}
                >
                  <Plus size={14} /> إضافة دارس للفرع
                </Link>
              )}
            </div>
            <div className="table-wrapper">
              <table className="management-table">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الرقم القومي</th>
                    <th>الهاتف</th>
                    <th>رقم الحلقة</th>
                    <th>الرواق</th>
                    <th>المستوى</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {branchStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>لا يوجد دارسين مسجلين في هذا الفرع.</td>
                    </tr>
                  ) : (
                    branchStudents.map(s => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td style={{ direction: 'ltr' }}>{s.national_id}</td>
                        <td style={{ direction: 'ltr' }}>{s.phone}</td>
                        <td>حلقة {s.session_no}</td>
                        <td>{s.rowaq}</td>
                        <td>{s.level}</td>
                        <td className="actions-cell">
                          {hasPermission('students', 'edit') && (
                            <Link to={`/students/create?id=${s.id}&redirect=${encodeURIComponent('/branches?selectedBranchId=' + currentBranch.id)}`} className="action-icon edit" style={{ color: 'inherit' }}><Edit size={14} /></Link>
                          )}
                          {isAllowedToArchive && (
                            <button className="action-icon edit" title="أرشفة" onClick={() => { if (window.confirm('هل أنت متأكد من أرشفة الدارس؟')) updateStudent(s.id, { isArchived: true }); }} style={{ color: 'var(--accent-gold)' }}><Archive size={14} /></button>
                          )}
                          {hasPermission('students', 'delete') && (
                            <button className="action-icon delete" onClick={() => { if (window.confirm('هل أنت متأكد من حذف الدارس؟')) deleteStudent(s.id); }}><Trash2 size={14} /></button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeBranchTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Sub-tab selection */}
            <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <button 
                className={`btn ${reportsSubTab === 'mohfez' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '6px 15px', fontSize: '13px' }}
                onClick={() => setReportsSubTab('mohfez')}
              >
                التقرير الشهري للمحفظين
              </button>
              <button 
                className={`btn ${reportsSubTab === 'sessions' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '6px 15px', fontSize: '13px' }}
                onClick={() => setReportsSubTab('sessions')}
              >
                تقارير الحلقات اليومية
              </button>
            </div>

            {reportsSubTab === 'mohfez' && (
              <div className="box-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '15px' }}>
                  <h3 style={{ fontSize: '16px', margin: 0 }}>التقرير الشهري للمحفظين بالفرع ({branchMohfezs.length})</h3>
                  
                  {/* Month/Year selectors */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>العام:</span>
                      <select 
                        className="form-select" 
                        style={{ padding: '4px 10px', fontSize: '12px', width: '90px', backgroundColor: '#11141D', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}
                        value={reportYear} 
                        onChange={e => setReportYear(e.target.value)}
                      >
                        {[2024,2025,2026,2027,2028,2029,2030].map(y => <option key={y} value={String(y)}>{y}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>الشهر:</span>
                      <select 
                        className="form-select" 
                        style={{ padding: '4px 10px', fontSize: '12px', width: '100px', backgroundColor: '#11141D', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}
                        value={reportMonth} 
                        onChange={e => setReportMonth(e.target.value)}
                      >
                        {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="management-table">
                    <thead>
                      <tr>
                        <th>اسم المحفظ</th>
                        <th>الحلقات المسندة</th>
                        <th>الجلسات الفعلية</th>
                        <th>إجمالي الساعات المنجزة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branchMohfezs.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>لا يوجد محفظين مسجلين لهذا الفرع.</td>
                        </tr>
                      ) : (
                        branchMohfezs.map(m => {
                          const stats = getMohfezMonthlyStats(m, reportYear, reportMonth);
                          return (
                            <tr key={m.id}>
                              <td>{m.name}</td>
                              <td style={{ fontWeight: 'bold' }}>{stats.assignedCount}</td>
                              <td style={{ fontWeight: 'bold', color: '#3b82f6' }}>{stats.actualSessionsCount}</td>
                              <td style={{ fontWeight: 'bold', color: '#10b981' }}>{stats.totalHours.toFixed(1)} ساعة</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportsSubTab === 'sessions' && (
              <div className="box-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <h3 style={{ fontSize: '16px', margin: 0 }}>تقارير الحلقات اليومية للفرع ({branchSessionReports.length})</h3>
                </div>
                <div className="table-wrapper">
                  <table className="management-table">
                    <thead>
                      <tr>
                        <th>رقم الحلقة</th>
                        <th>تاريخ التقرير</th>
                        <th>الرواق</th>
                        <th>المحفظ</th>
                        <th>الحاضرين</th>
                        <th>الغائبين</th>
                        <th>الدرس الملقى</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branchSessionReports.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>لا توجد تقارير حلقات مسجلة للفرع.</td>
                        </tr>
                      ) : (
                        branchSessionReports.map(r => {
                          const sess = sessions.find(s => String(s.id) === String(r.sessionId));
                          return (
                            <tr key={r.id}>
                              <td>حلقة {sess?.session_no || r.sessionId}</td>
                              <td>{r.date}</td>
                              <td>{sess?.rowaq || '-'}</td>
                              <td>{r.mohfezName}</td>
                              <td>{r.presentCount}</td>
                              <td>{r.absentCount}</td>
                              <td>{r.lessonTopic || '-'}</td>
                              <td className="actions-cell">
                                <button className="action-icon delete" onClick={() => { if (window.confirm('هل أنت متأكد من حذف هذا التقرير؟')) deleteSessionReport(r.id); }}><Trash2 size={14} /></button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeBranchTab === 'new' && (
          <div className="box-card">
            <h3 style={{ fontSize: '16px', marginBottom: '20px', color: 'var(--text-primary)' }}>إضافة سجلات جديدة للفرع: {currentBranch.name}</h3>
            <div className="quick-add-grid">
              {hasPermission('coordinators', 'add') && (
                <Link 
                  to={`/coordinators/create?admin=${currentBranch.admin}&center=${currentBranch.center}&branch=${currentBranch.name}&redirect=${encodeURIComponent('/branches?selectedBranchId=' + currentBranch.id)}`} 
                  className="quick-add-card"
                >
                  <div className="quick-add-icon-box">
                    <GraduationCap size={24} />
                  </div>
                  <h4>منسق جديد</h4>
                  <p>إضافة منسق إداري أو علمي للفرع</p>
                </Link>
              )}
              {hasPermission('mohfezs', 'add') && (
                <Link 
                  to={`/mohfez/create?admin=${currentBranch.admin}&center=${currentBranch.center}&branch=${currentBranch.name}&redirect=${encodeURIComponent('/branches?selectedBranchId=' + currentBranch.id)}`} 
                  className="quick-add-card"
                >
                  <div className="quick-add-icon-box">
                    <Users size={24} />
                  </div>
                  <h4>محفظ جديد</h4>
                  <p>تسجيل محفظ تحفيظ جديد للفرع</p>
                </Link>
              )}
              {hasPermission('sessions', 'add') && (
                <Link 
                  to={`/sessions/create?admin=${currentBranch.admin}&center=${currentBranch.center}&branch=${currentBranch.name}&redirect=${encodeURIComponent('/branches?selectedBranchId=' + currentBranch.id)}`} 
                  className="quick-add-card"
                >
                  <div className="quick-add-icon-box">
                    <BookOpen size={24} />
                  </div>
                  <h4>حلقة تحفيظ جديدة</h4>
                  <p>إنشاء حلقة تحفيظ جديدة بالفرع</p>
                </Link>
              )}
              {hasPermission('students', 'add') && (
                <Link 
                  to={`/students/create?admin=${currentBranch.admin}&center=${currentBranch.center}&branch=${currentBranch.name}&redirect=${encodeURIComponent('/branches?selectedBranchId=' + currentBranch.id)}`} 
                  className="quick-add-card"
                >
                  <div className="quick-add-icon-box">
                    <BookOpen size={24} />
                  </div>
                  <h4>دارس جديد</h4>
                  <p>تسجيل طالب أو دارس جديد بحلقات الفرع</p>
                </Link>
              )}
              <Link 
                to="/monthlyreport" 
                className="quick-add-card"
              >
                <div className="quick-add-icon-box" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
                  <FileText size={24} />
                </div>
                <h4>زيارات المتابعة</h4>
                <p>إدارة المتابعات الشهرية والزيارات الميدانية</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="management-page">
      <div className="page-header">
        <div className="title-section">
          <h2>إدارة الفروع</h2>
          <p>إدارة وعرض قائمة الفروع المسجلة في النظام</p>
        </div>
      </div>

      {/* Search Filters */}
      <div className="search-section box-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '20px' }}>
          <div className="form-group">
            <label>اسم الفرع</label>
            <input type="text" className="form-input" placeholder="ابحث باسم الفرع" value={filterName} onChange={e => setFilterName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>الإدارة</label>
            <select className="form-select" value={filterAdmin} onChange={e => { setFilterAdmin(e.target.value); setFilterCenter(''); }} disabled={isRowaqStaff || isBranchCoordinator || isMohfez}>
              <option value="">--- اختار المحافظة ---</option>
              {governorates.map((g, i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>المركز <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>*</span></label>
            <select className="form-select" value={filterCenter} onChange={e => setFilterCenter(e.target.value)} disabled={!filterAdmin || isBranchCoordinator || isMohfez}>
              <option value="">{filterAdmin ? 'اختار المركز' : 'اختار الإدارة أولاً'}</option>
              {availableCenters.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>أيام العمل</label>
            <select className="form-select" value={filterWorkDay} onChange={e => setFilterWorkDay(e.target.value)}>
              <option value="">--- اختار اليوم ---</option>
              {workDaysList.map((d, i) => <option key={i} value={d}>{d}</option>)}
              <option value="لا يعمل">لا يعمل</option>
            </select>
          </div>
        </div>
        <div className="search-actions" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
          <button className="btn btn-primary"><Search size={16} /> بحث</button>
          <button className="btn btn-outline" onClick={() => { 
            setFilterName(''); 
            if (!isRowaqStaff && !isBranchCoordinator && !isMohfez) setFilterAdmin(''); 
            if (!isBranchCoordinator && !isMohfez) setFilterCenter(''); 
            setFilterWorkDay(''); 
          }}>إعادة تعيين</button>
        </div>
      </div>

      {/* Table controls */}
      <div className="table-controls" style={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <div className="action-buttons" style={{ flexDirection: 'row-reverse' }}>
          {hasPermission('branches', 'add') && (
            <>
              <Link to="/branches/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                <Plus size={16} /> إضافة فرع
              </Link>
              <button className="btn btn-gold-outline" onClick={() => importRef.current.click()}>
                <Upload size={16} /> استيراد
              </button>
              <input ref={importRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleImport} />
            </>
          )}
          {hasPermission('branches', 'delete') && branches.length > 0 && (
            <button className="btn btn-danger" onClick={deleteAllBranches}>
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
              <th>اسم الفرع</th>
              <th>الإدارة</th>
              <th>المركز</th>
              <th>رقم القرار</th>
              <th>المنسقين</th>
              <th>أيام العمل</th>
              <th>من</th>
              <th>إلى</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  لا توجد بيانات. قم بإضافة فرع جديد أو استيراد ملف xlsx.
                </td>
              </tr>
            ) : (
              filtered.map(b => (
                <tr key={b.id}>
                  <td>
                    <button
                      onClick={() => setSearchParams({ selectedBranchId: b.id })}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-gold)',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        padding: 0,
                        textAlign: 'right'
                      }}
                      onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.target.style.textDecoration = 'none'}
                    >
                      {b.name}
                    </button>
                  </td>
                  <td>{b.admin}</td>
                  <td>{b.center}</td>
                  <td>{b.decision_no}</td>
                  <td>
                    {(() => {
                      const branchCoords = coordinators.filter(c => 
                        !c.isArchived &&
                        normalizeArabic(c.branch) === normalizeArabic(b.name) &&
                        normalizeArabic(c.admin) === normalizeArabic(b.admin) &&
                        normalizeArabic(c.center) === normalizeArabic(b.center)
                      );
                      return branchCoords.length > 0 
                        ? branchCoords.map(c => `${c.name} (${c.specialization || ''})`).join('  ') 
                        : 'لا يوجد منسقين';
                    })()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(b.workDays || []).map((d, i) => (
                        <span key={i} style={{ background: '#3b82f620', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{b.timeFrom || '-'}</td>
                  <td>{b.timeTo || '-'}</td>
                  <td className="actions-cell">
                    <button 
                      className="action-icon edit" 
                      title="لوحة التحكم للفرع" 
                      onClick={() => setSearchParams({ selectedBranchId: b.id })}
                      style={{ color: 'var(--accent-gold)', borderColor: 'rgba(214, 175, 55, 0.3)' }}
                    >
                      <LayoutDashboard size={16} />
                    </button>
                    {isAllowedToArchive && (
                      <button className="action-icon edit" title="أرشفة" onClick={() => { if (window.confirm('هل أنت متأكد من أرشفة الفرع؟')) updateBranch(b.id, { isArchived: true }); }} style={{ color: 'var(--accent-gold)' }}><Archive size={16} /></button>
                    )}
                    {hasPermission('branches', 'edit') && (
                      <Link to={`/branches/create?id=${b.id}`} className="action-icon edit" style={{textDecoration: 'none', color: 'inherit'}}><Edit size={16}/></Link>
                    )}
                    {hasPermission('branches', 'delete') && (
                      <button className="action-icon delete" onClick={() => deleteBranch(b.id)}><Trash2 size={16}/></button>
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

export default BranchesList;
