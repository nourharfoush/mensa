import React, { createContext, useContext, useState, useEffect } from 'react';
import egyptCenters from '../data/egyptCenters';
import {
  managersAPI, coordinatorsAPI, mohfezsAPI, studentsAPI, branchesAPI, sessionsAPI, usersAPI,
  monthlyReportsAPI, followUpReportsAPI, applicantsAPI, rowaqsAPI, applicantBranchesAPI,
  sessionReportsAPI, platformTopManagementAPI, platformSupervisorsAPI, platformCoordinatorsAPI,
  platformMohfezsAPI, platformSessionsAPI, platformStudentsAPI, platformApplicantsAPI,
  platformRowaqsAPI, administrationsAPI, rolePermissionsAPI,
  shariaCoursesAPI, shariaBranchesAPI, shariaStudentsAPI, shariaTeachersAPI, shariaLivesAPI
} from '../utils/apiService';

const AppDataContext = createContext(null);

// Helper functions to manage localStorage
const getFromLocalStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

const defaultPermissions = {
  admin: {
    sessions: { view: true, add: true, edit: true, delete: true },
    mohfezs: { view: true, add: true, edit: true, delete: true },
    coordinators: { view: true, add: true, edit: true, delete: true },
    students: { view: true, add: true, edit: true, delete: true },
    reports: { view: true, add: true, edit: true, delete: true },
    branches: { view: true, add: true, edit: true, delete: true },
  },
  rowaq_admin: {
    sessions: { view: true, add: true, edit: true, delete: true },
    mohfezs: { view: true, add: true, edit: true, delete: true },
    coordinators: { view: true, add: true, edit: true, delete: true },
    students: { view: true, add: true, edit: true, delete: true },
    reports: { view: true, add: true, edit: true, delete: true },
    branches: { view: true, add: true, edit: true, delete: true },
  },
  platform_admin: {
    sessions: { view: true, add: true, edit: true, delete: true },
    mohfezs: { view: true, add: true, edit: true, delete: true },
    coordinators: { view: true, add: true, edit: true, delete: true },
    students: { view: true, add: true, edit: true, delete: true },
    reports: { view: true, add: true, edit: true, delete: true },
    branches: { view: true, add: true, edit: true, delete: true },
  },
  rowaq_manager: {
    sessions: { view: true, add: true, edit: true, delete: false },
    mohfezs: { view: true, add: true, edit: true, delete: false },
    coordinators: { view: true, add: true, edit: true, delete: false },
    students: { view: true, add: true, edit: true, delete: false },
    reports: { view: true, add: true, edit: true, delete: true },
    branches: { view: true, add: true, edit: true, delete: false },
  },
  rowaq_tech: {
    sessions: { view: true, add: true, edit: true, delete: false },
    mohfezs: { view: true, add: true, edit: true, delete: false },
    coordinators: { view: true, add: true, edit: true, delete: false },
    students: { view: true, add: true, edit: true, delete: false },
    reports: { view: true, add: true, edit: true, delete: false },
    branches: { view: true, add: true, edit: true, delete: false },
  },
  rowaq_member: {
    sessions: { view: true, add: false, edit: false, delete: false },
    mohfezs: { view: true, add: false, edit: false, delete: false },
    coordinators: { view: true, add: false, edit: false, delete: false },
    students: { view: true, add: false, edit: false, delete: false },
    reports: { view: true, add: true, edit: false, delete: false },
    branches: { view: true, add: false, edit: false, delete: false },
  },
  branch_admin_coordinator: {
    sessions: { view: true, add: true, edit: true, delete: false },
    mohfezs: { view: true, add: false, edit: false, delete: false },
    coordinators: { view: true, add: false, edit: false, delete: false },
    students: { view: true, add: true, edit: true, delete: false },
    reports: { view: true, add: true, edit: true, delete: false },
    branches: { view: true, add: false, edit: false, delete: false },
  },
  branch_scientific_coordinator: {
    sessions: { view: true, add: false, edit: false, delete: false },
    mohfezs: { view: true, add: false, edit: false, delete: false },
    coordinators: { view: true, add: false, edit: false, delete: false },
    students: { view: true, add: false, edit: false, delete: false },
    reports: { view: true, add: true, edit: false, delete: false },
    branches: { view: true, add: false, edit: false, delete: false },
  },
  mohfez: {
    sessions: { view: true, add: false, edit: false, delete: false },
    mohfezs: { view: true, add: false, edit: false, delete: false },
    coordinators: { view: true, add: false, edit: false, delete: false },
    students: { view: true, add: false, edit: false, delete: false },
    reports: { view: true, add: true, edit: false, delete: false },
    branches: { view: true, add: false, edit: false, delete: false },
  },
  platform_supervisor: {
    sessions: { view: true, add: true, edit: true, delete: false },
    mohfezs: { view: true, add: true, edit: true, delete: false },
    coordinators: { view: true, add: true, edit: true, delete: false },
    students: { view: true, add: true, edit: true, delete: false },
    reports: { view: true, add: true, edit: true, delete: true },
    branches: { view: true, add: true, edit: true, delete: false },
  },
  platform_coordinator: {
    sessions: { view: true, add: true, edit: true, delete: false },
    mohfezs: { view: true, add: false, edit: false, delete: false },
    coordinators: { view: true, add: false, edit: false, delete: false },
    students: { view: true, add: true, edit: true, delete: false },
    reports: { view: true, add: true, edit: true, delete: false },
    branches: { view: true, add: false, edit: false, delete: false },
  },
  platform_mohfez: {
    sessions: { view: true, add: false, edit: false, delete: false },
    mohfezs: { view: true, add: false, edit: false, delete: false },
    coordinators: { view: true, add: false, edit: false, delete: false },
    students: { view: true, add: false, edit: false, delete: false },
    reports: { view: true, add: true, edit: false, delete: false },
    branches: { view: true, add: false, edit: false, delete: false },
  },
  student: {
    sessions: { view: true, add: false, edit: false, delete: false },
    mohfezs: { view: false, add: false, edit: false, delete: false },
    coordinators: { view: false, add: false, edit: false, delete: false },
    students: { view: true, add: false, edit: false, delete: false },
    reports: { view: true, add: false, edit: false, delete: false },
    branches: { view: false, add: false, edit: false, delete: false },
  }
};

const normalizeStage = (stage) => {
  if (!stage) return 'التمهيدية';
  const clean = String(stage).trim();
  if (clean === 'تمهيدية') return 'التمهيدية';
  if (clean === 'متوسطة') return 'المتوسطة';
  if (clean === 'متقدمة') return 'المتقدمة';
  return clean;
};

export function AppDataProvider({ children }) {
  // Load data from localStorage or use default values
  const [managers, setManagers] = useState(() => getFromLocalStorage('managers', []));
  const [monthlyReports, setMonthlyReports] = useState(() => getFromLocalStorage('monthlyReports', []));
  const [branches, setBranches] = useState(() => getFromLocalStorage('branches', []));
  const [coordinators, setCoordinators] = useState(() => getFromLocalStorage('coordinators', []));
  const [mohfezs, setMohfezs] = useState(() => getFromLocalStorage('mohfezs', []));
  const [sessions, setSessions] = useState(() => getFromLocalStorage('sessions', []));
  const [students, setStudents] = useState(() => getFromLocalStorage('students', []));
  const [applicants, setApplicants] = useState(() => getFromLocalStorage('applicants', []));
  const [rowaqs, setRowaqs] = useState(() => getFromLocalStorage('rowaqs', []));

  const [followUpReports, setFollowUpReports] = useState(() => {
    const stored = getFromLocalStorage('followUpReports', []);
    if (stored.length > 0) return stored;

    // Auto-seed mock reports for past dates if they exist in monthlyReports
    const reports = [];
    const monthlyList = getFromLocalStorage('monthlyReports', []);

    monthlyList.forEach(m => {
      if (m.branches) {
        m.branches.forEach(b => {
          const seedDates = ['2026-05-09', '2026-05-10', '2026-05-11', '2026-05-12', '2026-05-13', '2026-05-18', '2026-05-19', '2026-05-20', '2026-05-21', '2026-05-23'];
          if (seedDates.includes(b.date)) {
            reports.push({
              id: Date.now() + Math.random(),
              monthlyReportId: m.id,
              branchVisitId: b.id,
              date: b.date,
              admin: m.admin,
              center: b.center,
              branch: b.branch,
              address: 'معهد بنين نصر الله - أبو حمص',
              rwaqs: ['رواق القرآن الكريم ( أطفال )'],
              workDays: ['الأحد', 'الثلاثاء', 'الخميس'],
              timeFrom: '14:00',
              timeTo: '18:00',
              followerName: m.member,
              followerSpecialty: m.specialty,
              scientificCommitment: 'نعم',
              scientificShortcoming: '',
              administrativeCommitment: 'نعم',
              administrativeShortcoming: '',
              absentCoordinators: 'لا يوجد',
              absentMohfezs: 'لا يوجد',
              exceedingHoursPercentage: '0%',
              multiLevelSessionsCount: '2',
              adultRwaqMohfezsCount: '3',
              adultRwaqDirectSessionsCount: '2',
              adultRwaqOnlineSessionsCount: '1',
              adultRwaqStudentsCount: '45',
              adultRwaqAttendanceCount: '40',
              childRwaqMohfezsCount: '5',
              childRwaqStudentsCount: '120',
              childRwaqAttendanceCount: '110',
              mohfezsCommitmentToCurriculum: 'الجميع ملتزم',
              mohfezClassManagement: 'أداء ممتاز لكل المحفظين',
              mohfezStudentBehavior: 'أداء ممتاز لكل المحفظين',
              tajweedNotebookActivated: 'نعم',
              teacherRecitationCommitment: 'كل المحفظين',
              dressCodeCommitment: 'كل المحفظين',
              monthlyTestsAndEvaluations: 'نعم',
              topStudentsNames: 'أحمد محمد، محمود علي',
              positives: 'التزام المحفظين والطلاب وحسن التعامل',
              negatives: 'لا توجد سلبيات تذكر',
              recommendations: 'الاستمرار على نفس المستوى المتميز',
              generalComments: 'زيارة ناجحة ومثمرة',
              isConfirmed: false,
              confirmationFile: ''
            });
          }
        });
      }
    });
    return reports;
  });
  const [users, setUsers] = useState(() => {
    const defaultAdmin = { id: 1, username: 'admin', email: 'admin', national_id: 'admin', password: '123', record_number: '123', name: 'Admin', role: 'admin', created_at: new Date().toLocaleDateString('ar-EG') };
    const defaultUsers = [defaultAdmin];
    const stored = getFromLocalStorage('users', defaultUsers);
    // توحيد بيانات المستخدمين القديمة لضمان عمل تسجيل الدخول
    const normalized = stored.map(u => ({
      ...u,
      username: u.national_id || u.email || u.username || '',
      email: u.email || u.national_id || '',
      password: u.password || u.record_number || '',
      record_number: u.record_number || u.password || '',
    }));
    // ضمان وجود مستخدم الأدمن دائماً
    const hasAdmin = normalized.some(u => u.national_id === 'admin' || u.username === 'admin');
    return hasAdmin ? normalized : [defaultAdmin, ...normalized];
  });
  const [applicantBranches, setApplicantBranches] = useState(() => getFromLocalStorage('applicantBranches', []));
  const [auditLogs, setAuditLogs] = useState(() => getFromLocalStorage('auditLogs', []));
  const [attendances, setAttendances] = useState(() => getFromLocalStorage('attendances', []));
  const [sessionReports, setSessionReports] = useState(() => getFromLocalStorage('sessionReports', []));

  // Platform Dashboard States
  const [platformTopManagement, setPlatformTopManagement] = useState(() => getFromLocalStorage('platformTopManagement', []));
  const [platformSupervisors, setPlatformSupervisors] = useState(() => getFromLocalStorage('platformSupervisors', []));
  const [platformCoordinators, setPlatformCoordinators] = useState(() => getFromLocalStorage('platformCoordinators', []));
  const [platformMohfezs, setPlatformMohfezs] = useState(() => getFromLocalStorage('platformMohfezs', []));
  const [platformSessions, setPlatformSessions] = useState(() => getFromLocalStorage('platformSessions', []));
  const [platformStudents, setPlatformStudents] = useState(() => getFromLocalStorage('platformStudents', []));
  const [platformApplicants, setPlatformApplicants] = useState(() => getFromLocalStorage('platformApplicants', []));
  const [platformRowaqs, setPlatformRowaqs] = useState(() => getFromLocalStorage('platformRowaqs', []));
  const [administrations, setAdministrations] = useState(() => {
    const defaultAdmins = Object.keys(egyptCenters).map((gov, index) => ({
      id: String(1000 + index),
      name: gov,
      manager: '-',
      centers_count: egyptCenters[gov]?.length || 0,
      created_at: new Date().toLocaleDateString('ar-EG')
    }));
    return getFromLocalStorage('administrations', defaultAdmins);
  });

  const [theme, setTheme] = useState(() => getFromLocalStorage('theme', 'dark'));
  const [rolePermissions, setRolePermissions] = useState(() => {
    const loaded = getFromLocalStorage('rolePermissions', defaultPermissions);
    if (loaded && (!loaded.rowaq_manager || !loaded.rowaq_admin || !loaded.platform_admin)) {
      return defaultPermissions;
    }
    return loaded;
  });

  // Sharia Dashboard States
  const [shariaCourses, setShariaCourses] = useState(() => {
    const raw = getFromLocalStorage('sharia_courses', []);
    return raw.map(c => ({ ...c, stage: normalizeStage(c.stage) }));
  });
  const [shariaBranches, setShariaBranches] = useState(() => getFromLocalStorage('sharia_branches', [
    { id: 'sb-1', name: 'فرع معهد تفهنا الأشراف الشرعي', governorate: 'الدقهلية', code: 'SH-DK01', address: 'معهد فتيات تفهنا الأشراف' },
    { id: 'sb-2', name: 'فرع الجامع الأزهر الرئيسي', governorate: 'الجامع الأزهر', code: 'SH-AZ01', address: 'مقر الجامع الأزهر الشريف بالقاهرة' }
  ]));
  const [shariaStudents, setShariaStudents] = useState(() => {
    const raw = getFromLocalStorage('sharia_students', []);
    return raw.map(s => ({ ...s, stage: normalizeStage(s.stage) }));
  });
  const [shariaTeachers, setShariaTeachers] = useState(() => getFromLocalStorage('sharia_teachers', []));
  const [shariaLiveLectures, setShariaLiveLectures] = useState(() => {
    const raw = getFromLocalStorage('sharia_live', [
      {
        id: 1,
        title: 'شرح كتاب التوحيد من صحيح البخاري',
        governorate: 'الجامع الأزهر',
        stage: 'التمهيدية',
        level: 'المستوى الأول',
        discipline: '—',
        teacher: 'أ.د. أحمد المعتز بالله',
        day: 'الأحد',
        timeStart: '18:00',
        timeEnd: '20:00',
        link: 'https://zoom.us/j/123456789',
        isWeekly: true,
        status: 'بث مباشر الآن'
      }
    ]);
    return raw.map(l => ({ ...l, stage: normalizeStage(l.stage) }));
  });

  const [shariaSchedules, setShariaSchedules] = useState(() => {
    const raw = getFromLocalStorage('sharia_schedules', [
      {
        id: 'sched-1',
        governorate: 'الجامع الأزهر',
        branch: 'فرع الجامع الأزهر الرئيسي',
        stage: 'التمهيدية',
        level: 'المستوى الأول',
        discipline: '—',
        day: 'الأحد',
        timeStart: '10:00',
        timeEnd: '12:00',
        teacher: 'أ.د. أحمد المعتز بالله',
        place: 'الرواق العباسي',
        isWeekly: true
      }
    ]);
    return raw.map(s => ({ ...s, stage: normalizeStage(s.stage) }));
  });

  const [shariaAttendance, setShariaAttendance] = useState(() => getFromLocalStorage('sharia_attendance', []));
  const [lectureAccessLogs, setLectureAccessLogs] = useState(() => getFromLocalStorage('lecture_access_logs', []));

  // Save permissions to localStorage
  useEffect(() => {
    saveToLocalStorage('rolePermissions', rolePermissions);
  }, [rolePermissions]);

  // Save theme to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveToLocalStorage('theme', theme);
  }, [theme]);

  // Database Persistent Synchronization
  const [dbSynced, setDbSynced] = useState(false);

  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        console.log('🔄 Syncing with backend database...');

        const syncCollection = async (api, state, setState, key, mapper = null) => {
          const remoteData = await api.getAll().catch(() => null);
          if (remoteData) {
            const localData = getFromLocalStorage(key, []);
            // Auto-migrate if remote is empty but local has records
            if (remoteData.length === 0 && localData.length > 0) {
              console.log(`🚀 Auto-migrating ${localData.length} items for ${key} to MongoDB...`);
              try {
                const sanitizedLocal = localData.map(({ _id, id, ...rest }) => rest);
                await api.bulkImport(sanitizedLocal);
                const refetched = await api.getAll().catch(() => null);
                if (refetched) {
                  let normalized = refetched.map(item => ({ ...item, id: item.id || item._id }));
                  if (mapper) normalized = normalized.map(mapper);
                  setState(normalized);
                  saveToLocalStorage(key, normalized);
                  return;
                }
              } catch (migrateErr) {
                console.error(`✗ Migration failed for ${key}:`, migrateErr);
              }
            }

            let normalizedData = remoteData.map(item => ({
              ...item,
              id: item.id || item._id
            }));
            if (mapper) normalizedData = normalizedData.map(mapper);
            setState(normalizedData);
            saveToLocalStorage(key, normalizedData);
            if (remoteData.length > 0) {
              console.log(`✓ Fetched ${normalizedData.length} items for ${key} from MongoDB`);
            }
          }
        };

        await syncCollection(managersAPI, managers, setManagers, 'managers');
        await syncCollection(coordinatorsAPI, coordinators, setCoordinators, 'coordinators');
        await syncCollection(mohfezsAPI, mohfezs, setMohfezs, 'mohfezs');
        await syncCollection(studentsAPI, students, setStudents, 'students');
        await syncCollection(branchesAPI, branches, setBranches, 'branches');
        await syncCollection(sessionsAPI, sessions, setSessions, 'sessions');
        // Sync users but always keep the default admin account
        const remoteUsers = await usersAPI.getAll().catch(() => null);
        if (remoteUsers) {
          const normalizedRemote = remoteUsers.map(item => ({ ...item, id: item.id || item._id }));
          const defaultAdmin = { id: 1, username: 'admin', email: 'admin', national_id: 'admin', password: '123', record_number: '123', name: 'Admin', role: 'admin' };
          const hasAdmin = normalizedRemote.some(u => u.national_id === 'admin' || u.username === 'admin');
          const finalUsers = hasAdmin ? normalizedRemote : [defaultAdmin, ...normalizedRemote];
          setUsers(finalUsers);
          saveToLocalStorage('users', finalUsers);
          console.log(`✓ Fetched ${finalUsers.length} users from MongoDB (admin protected)`);
        }

        await syncCollection(monthlyReportsAPI, monthlyReports, setMonthlyReports, 'monthlyReports');
        await syncCollection(followUpReportsAPI, followUpReports, setFollowUpReports, 'followUpReports');
        await syncCollection(applicantsAPI, applicants, setApplicants, 'applicants');
        await syncCollection(rowaqsAPI, rowaqs, setRowaqs, 'rowaqs');
        await syncCollection(applicantBranchesAPI, applicantBranches, setApplicantBranches, 'applicantBranches');
        await syncCollection(sessionReportsAPI, sessionReports, setSessionReports, 'sessionReports');

        await syncCollection(platformTopManagementAPI, platformTopManagement, setPlatformTopManagement, 'platformTopManagement');
        await syncCollection(platformSupervisorsAPI, platformSupervisors, setPlatformSupervisors, 'platformSupervisors');
        await syncCollection(platformCoordinatorsAPI, platformCoordinators, setPlatformCoordinators, 'platformCoordinators');
        await syncCollection(platformMohfezsAPI, platformMohfezs, setPlatformMohfezs, 'platformMohfezs');
        await syncCollection(platformSessionsAPI, platformSessions, setPlatformSessions, 'platformSessions');
        await syncCollection(platformStudentsAPI, platformStudents, setPlatformStudents, 'platformStudents');
        await syncCollection(platformApplicantsAPI, platformApplicants, setPlatformApplicants, 'platformApplicants');
        await syncCollection(platformRowaqsAPI, platformRowaqs, setPlatformRowaqs, 'platformRowaqs');

        await syncCollection(administrationsAPI, administrations, setAdministrations, 'administrations');
        await syncCollection(rolePermissionsAPI, rolePermissions, setRolePermissions, 'rolePermissions');

        // Sync Sharia Collections
        await syncCollection(shariaCoursesAPI, shariaCourses, setShariaCourses, 'sharia_courses', c => ({ ...c, stage: normalizeStage(c.stage) }));
        await syncCollection(shariaBranchesAPI, shariaBranches, setShariaBranches, 'sharia_branches');
        await syncCollection(shariaStudentsAPI, shariaStudents, setShariaStudents, 'sharia_students', s => ({ ...s, stage: normalizeStage(s.stage) }));
        await syncCollection(shariaTeachersAPI, shariaTeachers, setShariaTeachers, 'sharia_teachers');
        await syncCollection(shariaLivesAPI, shariaLiveLectures, setShariaLiveLectures, 'sharia_live', l => ({ ...l, stage: normalizeStage(l.stage) }));

        setDbSynced(true);
        console.log('✓ Database synchronization complete!');
      } catch (error) {
        console.error('✗ Backend sync error:', error);
      }
    };

    syncWithBackend();
  }, []);

  // تطبيع بيانات المستخدمين + إنشاء حسابات تلقائية من المنسقين والمحفظين والمدراء
  // يعمل كلما تغيرت بيانات المنسقين أو المحفظين أو المدراء
  useEffect(() => {
    setUsers(prev => {
      const coordinatorNids = new Set(coordinators.map(c => String(c.national_id || '').trim()).filter(Boolean));
      const mohfezNids = new Set(mohfezs.map(m => String(m.national_id || '').trim()).filter(Boolean));
      const managerNids = new Set(managers.map(mg => String(mg.national_id || '').trim()).filter(Boolean));
      const platformCoordinatorNids = new Set(platformCoordinators.map(c => String(c.national_id || '').trim()).filter(Boolean));
      const platformSupervisorNids = new Set(platformSupervisors.map(s => String(s.national_id || '').trim()).filter(Boolean));
      const platformMohfezNids = new Set(platformMohfezs.map(m => String(m.national_id || '').trim()).filter(Boolean));
      const platformAdminNids = new Set(platformTopManagement.map(t => String(t.national_id || '').trim()).filter(Boolean));
      const platformStudentPassports = new Set(platformStudents.map(s => String(s.passport_no || s.national_id || '').trim()).filter(Boolean));
      const shariaStudentNids = new Set(shariaStudents.map(s => String(s.nationalId || '').trim()).filter(Boolean));
      const shariaTeacherNids = new Set(shariaTeachers.map(t => String(t.nationalId || '').trim()).filter(Boolean));

      // 1) تصفية وتطبيع المستخدمين الحاليين
      let filteredPrev = prev.filter(u => {
        const role = u.role || '';
        const nid = String(u.national_id || u.username || '').trim();
        if (!nid) return false;

        // Keep super admin
        if (role === 'admin' || nid === 'admin') return true;

        if (role === 'branch_admin_coordinator' || role === 'branch_scientific_coordinator') {
          return coordinatorNids.has(nid);
        }
        if (role === 'mohfez') {
          return mohfezNids.has(nid);
        }
        if (role === 'rowaq_manager' || role === 'rowaq_tech' || role === 'rowaq_member') {
          return managerNids.has(nid);
        }
        if (role === 'platform_coordinator') {
          return platformCoordinatorNids.has(nid);
        }
        if (role === 'platform_supervisor') {
          return platformSupervisorNids.has(nid);
        }
        if (role === 'platform_mohfez') {
          return platformMohfezNids.has(nid);
        }
        if (role === 'platform_admin') {
          return platformAdminNids.has(nid);
        }
        if (role === 'student') {
          return platformStudentPassports.has(nid);
        }
        if (role === 'sharia_student') {
          return shariaStudentNids.has(nid);
        }
        if (role === 'sharia_teacher') {
          return shariaTeacherNids.has(nid);
        }

        return true;
      });

      let normalized = filteredPrev.map(u => {
        const isAdminRole = u.role === 'admin';
        if (isAdminRole) {
          return {
            ...u,
            username: 'admin',
            email: 'admin',
            national_id: 'admin',
            record_number: 'admin',
            password: u.password || u.record_number || '',
          };
        }

        const nid = String(u.national_id || '').trim();
        const em = String(u.email || '').trim();
        const uname = String(u.username || '').trim();
        const pw = String(u.password || '').trim();
        const rec = String(u.record_number || '').trim();
        const reg = String(u.registry_no || '').trim();

        return {
          ...u,
          username: nid || em || uname,
          email: em || nid,
          national_id: nid || em || uname,
          password: pw || rec || reg,
          record_number: rec || pw || reg,
        };
      });

      // 2) إنشاء حسابات مستخدمين من البيانات الموجودة (منسقين، محفظين، مدراء)
      const existingNationalIds = new Set(normalized.map(u => String(u.national_id || '').trim()).filter(Boolean));
      let newUsersAdded = 0;

      // من المنسقين (شئون الأروقة)
      coordinators.forEach(c => {
        const nid = String(c.national_id || '').trim();
        const regNo = String(c.registry_no || '').trim();
        if (nid && !existingNationalIds.has(nid)) {
          const role = c.specialization === 'إداري' ? 'branch_admin_coordinator' : 'branch_scientific_coordinator';
          normalized.push({
            id: Date.now() + Math.random(),
            name: c.name || '',
            email: nid,
            username: nid,
            national_id: nid,
            password: regNo,
            record_number: regNo,
            phone: c.phone || '',
            role: role,
            userAdmin: c.admin || '',
            userCenter: c.center || '',
            userBranch: c.branch || '',
            created_at: new Date().toLocaleDateString('ar-EG')
          });
          existingNationalIds.add(nid);
          newUsersAdded++;
        }
      });

      // من المحفظين (شئون الأروقة)
      mohfezs.forEach(m => {
        const nid = String(m.national_id || '').trim();
        const regNo = String(m.registry_no || '').trim();
        if (nid && !existingNationalIds.has(nid)) {
          normalized.push({
            id: Date.now() + Math.random(),
            name: m.name || '',
            email: nid,
            username: nid,
            national_id: nid,
            password: regNo,
            record_number: regNo,
            phone: m.phone || '',
            role: 'mohfez',
            userAdmin: m.admin || '',
            userCenter: m.center || '',
            userBranch: m.branch || '',
            created_at: new Date().toLocaleDateString('ar-EG')
          });
          existingNationalIds.add(nid);
          newUsersAdded++;
        }
      });

      // من المدراء/أعضاء الإدارة (شئون الأروقة)
      managers.forEach(mg => {
        const nid = String(mg.national_id || '').trim();
        const recNo = String(mg.record_no || '').trim();
        if (nid && !existingNationalIds.has(nid)) {
          let role = 'rowaq_member';
          if (mg.specialty === 'مدير الإدارة') role = 'rowaq_manager';
          else if (mg.specialty === 'العضو التقني') role = 'rowaq_tech';
          normalized.push({
            id: Date.now() + Math.random(),
            name: mg.name || '',
            email: nid,
            username: nid,
            national_id: nid,
            password: recNo,
            record_number: recNo,
            phone: mg.phone || '',
            role: role,
            userAdmin: mg.admin || '',
            created_at: new Date().toLocaleDateString('ar-EG')
          });
          existingNationalIds.add(nid);
          newUsersAdded++;
        }
      });

      // من المنصة: منسقين المنصة
      platformCoordinators.forEach(c => {
        const nid = String(c.national_id || '').trim();
        const regNo = String(c.registry_no || '').trim();
        if (nid && !existingNationalIds.has(nid)) {
          normalized.push({
            id: Date.now() + Math.random(),
            name: c.name || '', email: nid, username: nid, national_id: nid,
            password: regNo, record_number: regNo, phone: c.phone || '',
            role: 'platform_coordinator',
            created_at: new Date().toLocaleDateString('ar-EG')
          });
          existingNationalIds.add(nid);
          newUsersAdded++;
        }
      });

      // من المنصة: المشرفين
      platformSupervisors.forEach(s => {
        const nid = String(s.national_id || '').trim();
        const regNo = String(s.registry_no || '').trim();
        if (nid && !existingNationalIds.has(nid)) {
          normalized.push({
            id: Date.now() + Math.random(),
            name: s.name || '', email: nid, username: nid, national_id: nid,
            password: regNo, record_number: regNo, phone: s.phone || '',
            role: 'platform_supervisor',
            created_at: new Date().toLocaleDateString('ar-EG')
          });
          existingNationalIds.add(nid);
          newUsersAdded++;
        }
      });

      // من المنصة: المحفظين
      platformMohfezs.forEach(m => {
        const nid = String(m.national_id || '').trim();
        const regNo = String(m.registry_no || '').trim();
        if (nid && !existingNationalIds.has(nid)) {
          normalized.push({
            id: Date.now() + Math.random(),
            name: m.name || '', email: nid, username: nid, national_id: nid,
            password: regNo, record_number: regNo, phone: m.phone || '',
            role: 'platform_mohfez',
            created_at: new Date().toLocaleDateString('ar-EG')
          });
          existingNationalIds.add(nid);
          newUsersAdded++;
        }
      });

      // من المنصة: الإدارة العليا
      platformTopManagement.forEach(t => {
        const nid = String(t.national_id || '').trim();
        const regNo = String(t.registry_no || t.record_no || '').trim();
        if (nid && !existingNationalIds.has(nid)) {
          normalized.push({
            id: Date.now() + Math.random(),
            name: t.name || '', email: nid, username: nid, national_id: nid,
            password: regNo, record_number: regNo, phone: t.phone || '',
            role: 'platform_admin',
            created_at: new Date().toLocaleDateString('ar-EG')
          });
          existingNationalIds.add(nid);
          newUsersAdded++;
        }
      });

      // من المنصة: دارسين المنصة (يستخدم رقم جواز السفر كاسم مستخدم وكلمة مرور)
      platformStudents.forEach(s => {
        const passport = String(s.passport_no || s.national_id || '').trim();
        if (passport && !existingNationalIds.has(passport)) {
          normalized.push({
            id: Date.now() + Math.random(),
            name: s.name || '',
            email: passport,
            username: passport,
            national_id: passport,
            password: passport,
            record_number: passport,
            phone: s.phone || '',
            role: 'student',
            userSession: s.session_id || s.session_no || '',
            created_at: new Date().toLocaleDateString('ar-EG')
          });
          existingNationalIds.add(passport);
          newUsersAdded++;
        }
      });

      // من العلوم الشرعية: الدارسين (الطلاب)
      shariaStudents.forEach(s => {
        const nid = String(s.nationalId || '').trim();
        if (nid && !existingNationalIds.has(nid)) {
          normalized.push({
            id: Date.now() + Math.random(),
            name: s.name || '',
            email: nid,
            username: nid,
            national_id: nid,
            password: nid,
            record_number: nid,
            phone: s.phone || '',
            role: 'sharia_student',
            governorate: s.governorate || '',
            created_at: new Date().toLocaleDateString('ar-EG')
          });
          existingNationalIds.add(nid);
          newUsersAdded++;
        }
      });

      // من العلوم الشرعية: المحاضرين (المعلمين)
      shariaTeachers.forEach(t => {
        const nid = String(t.nationalId || '').trim();
        if (nid && !existingNationalIds.has(nid)) {
          normalized.push({
            id: Date.now() + Math.random(),
            name: t.name || '',
            email: nid,
            username: nid,
            national_id: nid,
            password: nid,
            record_number: nid,
            phone: t.phone || '',
            role: 'sharia_teacher',
            governorate: t.governorate || '',
            created_at: new Date().toLocaleDateString('ar-EG')
          });
          existingNationalIds.add(nid);
          newUsersAdded++;
        }
      });

      console.log('🔄 تطبيع بيانات المستخدمين:', normalized.length, 'مستخدم (تم إنشاء', newUsersAdded, 'حساب جديد)');
      normalized.forEach((u, i) => {
        console.log(`  [${i}] ${u.name}: national_id=${u.national_id}, password=${u.password}, role=${u.role}`);
      });
      saveToLocalStorage('users', normalized);
      return normalized;
    });
  }, [
    coordinators,
    mohfezs,
    managers,
    platformCoordinators,
    platformSupervisors,
    platformMohfezs,
    platformTopManagement,
    platformStudents,
    shariaStudents,
    shariaTeachers
  ]);

  // Save all data to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage('managers', managers);
  }, [managers]);

  useEffect(() => {
    saveToLocalStorage('monthlyReports', monthlyReports);
  }, [monthlyReports]);

  useEffect(() => {
    saveToLocalStorage('branches', branches);
  }, [branches]);

  useEffect(() => {
    saveToLocalStorage('followUpReports', followUpReports);
  }, [followUpReports]);

  useEffect(() => {
    saveToLocalStorage('coordinators', coordinators);
  }, [coordinators]);

  useEffect(() => {
    saveToLocalStorage('mohfezs', mohfezs);
  }, [mohfezs]);

  useEffect(() => {
    saveToLocalStorage('sessions', sessions);
  }, [sessions]);

  useEffect(() => {
    saveToLocalStorage('students', students);
  }, [students]);

  useEffect(() => {
    saveToLocalStorage('applicants', applicants);
  }, [applicants]);

  useEffect(() => {
    saveToLocalStorage('rowaqs', rowaqs);
  }, [rowaqs]);

  useEffect(() => {
    saveToLocalStorage('users', users);
  }, [users]);

  useEffect(() => {
    saveToLocalStorage('applicantBranches', applicantBranches);
  }, [applicantBranches]);

  useEffect(() => {
    saveToLocalStorage('auditLogs', auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    saveToLocalStorage('attendances', attendances);
  }, [attendances]);

  useEffect(() => {
    saveToLocalStorage('sessionReports', sessionReports);
  }, [sessionReports]);

  useEffect(() => {
    saveToLocalStorage('administrations', administrations);
  }, [administrations]);

  useEffect(() => {
    saveToLocalStorage('sharia_courses', shariaCourses);
  }, [shariaCourses]);

  useEffect(() => {
    saveToLocalStorage('sharia_branches', shariaBranches);
  }, [shariaBranches]);

  useEffect(() => {
    saveToLocalStorage('sharia_students', shariaStudents);
  }, [shariaStudents]);

  useEffect(() => {
    saveToLocalStorage('sharia_teachers', shariaTeachers);
  }, [shariaTeachers]);

  useEffect(() => {
    saveToLocalStorage('sharia_live', shariaLiveLectures);
  }, [shariaLiveLectures]);

  useEffect(() => {
    saveToLocalStorage('sharia_schedules', shariaSchedules);
  }, [shariaSchedules]);

  useEffect(() => {
    saveToLocalStorage('sharia_attendance', shariaAttendance);
  }, [shariaAttendance]);

  useEffect(() => {
    saveToLocalStorage('lecture_access_logs', lectureAccessLogs);
  }, [lectureAccessLogs]);

  useEffect(() => {
    setAdministrations(prev => {
      let changed = false;
      const next = prev.map(admin => {
        const adminManager = managers.find(m => m.admin === admin.name && m.specialty === 'مدير الإدارة');
        const managerName = adminManager ? adminManager.name : '-';
        if (admin.manager !== managerName) {
          changed = true;
          return { ...admin, manager: managerName };
        }
        return admin;
      });
      return changed ? next : prev;
    });
  }, [managers]);
  const addCenterToAdmin = (adminName, newCenter) => {
    setAdministrations(prev => prev.map(a => a.name === adminName ? { ...a, centers_count: a.centers_count + 1 } : a));
  };

  const addManager = (manager) => {
    const newManager = { ...manager, id: String(Date.now() + Math.random()) };
    setManagers(prev => [...prev, newManager]);
    managersAPI.create(newManager).catch(err => console.error(err));
  };
  const updateManager = (id, updatedManager) => {
    setManagers(prev => prev.map(m => String(m.id) === String(id) ? { ...m, ...updatedManager } : m));
    managersAPI.update(id, updatedManager).catch(err => console.error(err));
  };
  const deleteManager = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      const item = managers.find(m => String(m.id) === String(id));
      if (item && item.national_id) deleteUserByNationalId(item.national_id);
      setManagers(prev => prev.filter(m => String(m.id) !== String(id)));
      managersAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addMonthlyReport = (report) => {
    const newReport = { ...report, id: String(Date.now() + Math.random()) };
    setMonthlyReports(prev => [...prev, newReport]);
    monthlyReportsAPI.create(newReport).catch(err => console.error(err));
  };
  const updateMonthlyReport = (id, updatedReport) => {
    setMonthlyReports(prev => prev.map(r => String(r.id) === String(id) ? { ...r, ...updatedReport } : r));
    monthlyReportsAPI.update(id, updatedReport).catch(err => console.error(err));
  };
  const deleteMonthlyReport = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setMonthlyReports(prev => prev.filter(r => String(r.id) !== String(id)));
      monthlyReportsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addBranch = (branch) => {
    const newBranch = { ...branch, id: String(Date.now() + Math.random()) };
    setBranches(prev => [...prev, newBranch]);
    branchesAPI.create(newBranch).catch(err => console.error(err));
  };
  const updateBranch = (id, updatedBranch) => {
    setBranches(prev => prev.map(b => String(b.id) === String(id) ? { ...b, ...updatedBranch } : b));
    branchesAPI.update(id, updatedBranch).catch(err => console.error(err));
  };
  const deleteBranch = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setBranches(prev => prev.filter(b => String(b.id) !== String(id)));
      branchesAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addFollowUpReport = (report) => {
    let finalReport = { ...report };
    let isUpdate = false;
    setFollowUpReports(prev => {
      const existsIndex = prev.findIndex(r => String(r.monthlyReportId) === String(report.monthlyReportId) && String(r.branchVisitId) === String(report.branchVisitId));
      if (existsIndex > -1) {
        isUpdate = true;
        finalReport.id = prev[existsIndex].id;
        const next = [...prev];
        next[existsIndex] = { ...next[existsIndex], ...report };
        return next;
      }
      finalReport.id = String(Date.now() + Math.random());
      return [...prev, finalReport];
    });
    if (isUpdate) followUpReportsAPI.update(finalReport.id, finalReport).catch(err => console.error(err));
    else followUpReportsAPI.create(finalReport).catch(err => console.error(err));
  };

  const confirmFollowUpReport = (monthlyReportId, branchVisitId, fileName) => {
    let updatedReport = null;
    setFollowUpReports(prev => {
      return prev.map(r => {
        if (String(r.monthlyReportId) === String(monthlyReportId) && String(r.branchVisitId) === String(branchVisitId)) {
          updatedReport = { ...r, isConfirmed: true, confirmationFile: fileName };
          return updatedReport;
        }
        return r;
      });
    });
    if (updatedReport) followUpReportsAPI.update(updatedReport.id, updatedReport).catch(err => console.error(err));
  };

  const addCoordinator = (coordinator) => {
    const newCoordinator = { ...coordinator, id: String(Date.now() + Math.random()) };
    setCoordinators(prev => [...prev, newCoordinator]);
    coordinatorsAPI.create(newCoordinator).catch(err => console.error(err));
  };
  const updateCoordinator = (id, updatedCoordinator) => {
    setCoordinators(prev => prev.map(c => String(c.id) === String(id) ? { ...c, ...updatedCoordinator } : c));
    coordinatorsAPI.update(id, updatedCoordinator).catch(err => console.error(err));
  };
  const deleteCoordinator = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      const item = coordinators.find(c => String(c.id) === String(id));
      if (item && item.national_id) deleteUserByNationalId(item.national_id);
      setCoordinators(prev => prev.filter(c => String(c.id) !== String(id)));
      coordinatorsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addMohfez = (mohfez) => {
    const newMohfez = { ...mohfez, id: String(Date.now() + Math.random()) };
    setMohfezs(prev => [...prev, newMohfez]);
    mohfezsAPI.create(newMohfez).catch(err => console.error(err));
  };
  const updateMohfez = (id, updatedMohfez) => {
    setMohfezs(prev => prev.map(m => String(m.id) === String(id) ? { ...m, ...updatedMohfez } : m));
    mohfezsAPI.update(id, updatedMohfez).catch(err => console.error(err));
  };
  const deleteMohfez = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      const item = mohfezs.find(m => String(m.id) === String(id));
      if (item && item.national_id) deleteUserByNationalId(item.national_id);
      setMohfezs(prev => prev.filter(m => String(m.id) !== String(id)));
      mohfezsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addSession = (session) => {
    const newSession = { ...session, id: String(Date.now() + Math.random()) };
    setSessions(prev => [...prev, newSession]);
    sessionsAPI.create(newSession).catch(err => console.error(err));
  };
  const updateSession = (id, updatedSession) => {
    setSessions(prev => prev.map(s => String(s.id) === String(id) ? { ...s, ...updatedSession } : s));
    sessionsAPI.update(id, updatedSession).catch(err => console.error(err));
  };
  const deleteSession = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setSessions(prev => prev.filter(s => String(s.id) !== String(id)));
      sessionsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addStudent = (student) => {
    const newStudent = { ...student, id: String(Date.now() + Math.random()) };
    setStudents(prev => [...prev, newStudent]);
    studentsAPI.create(newStudent).catch(err => console.error(err));
  };
  const updateStudent = (id, updatedStudent) => {
    setStudents(prev => prev.map(s => String(s.id) === String(id) ? { ...s, ...updatedStudent } : s));
    studentsAPI.update(id, updatedStudent).catch(err => console.error(err));
  };
  const deleteStudent = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      const item = students.find(s => String(s.id) === String(id));
      if (item && item.national_id) deleteUserByNationalId(item.national_id);
      setStudents(prev => prev.filter(s => String(s.id) !== String(id)));
      studentsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const bulkImportStudents = async (studentList, userList) => {
    const newStudents = studentList.map(s => ({
      ...s,
      id: s.id || String(Date.now() + Math.random())
    }));
    
    try {
      await studentsAPI.bulkImport(newStudents);
    } catch (err) {
      console.error('Failed to bulk import students to DB:', err);
      alert('فشل حفظ الطلاب في قاعدة البيانات: ' + err.message);
      throw err;
    }

    setStudents(prev => [...prev, ...newStudents]);
    const savedStudents = getFromLocalStorage('students', []);
    saveToLocalStorage('students', [...savedStudents, ...newStudents]);

    if (userList && userList.length > 0) {
      const newUsers = userList.map(u => ({
        ...u,
        id: u.id || String(Date.now() + Math.random()),
        created_at: new Date().toLocaleDateString('ar-EG')
      }));
      try {
        await usersAPI.bulkImport(newUsers);
      } catch (err) {
        console.error('Failed to bulk import users to DB:', err);
        alert('تنبيه: فشل حفظ بعض حسابات الدخول للطلاب في قاعدة البيانات: ' + err.message);
      }
      setUsers(prev => {
        const uniqueUsers = [...prev];
        newUsers.forEach(nu => {
          if (!uniqueUsers.some(u => String(u.national_id).trim() === String(nu.national_id).trim())) {
            uniqueUsers.push(nu);
          }
        });
        saveToLocalStorage('users', uniqueUsers);
        return uniqueUsers;
      });
    }
  };

  const addApplicant = (applicant) => {
    const newApplicant = { ...applicant, id: String(Date.now() + Math.random()), register_date: new Date().toLocaleDateString('en-GB') };
    setApplicants(prev => [...prev, newApplicant]);
    applicantsAPI.create(newApplicant).catch(err => console.error(err));
  };
  const updateApplicant = (id, updatedApplicant) => {
    setApplicants(prev => prev.map(a => String(a.id) === String(id) ? { ...a, ...updatedApplicant } : a));
    applicantsAPI.update(id, updatedApplicant).catch(err => console.error(err));
  };
  const deleteApplicant = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setApplicants(prev => prev.filter(a => String(a.id) !== String(id)));
      applicantsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addRowaq = (rowaq) => {
    const newRowaq = { ...rowaq, id: String(Date.now() + Math.random()), levels: parseInt(rowaq.levels) || 0, created_at: new Date().toISOString().split('T')[0] };
    setRowaqs(prev => [...prev, newRowaq]);
    rowaqsAPI.create(newRowaq).catch(err => console.error(err));
  };
  const updateRowaq = (id, updatedRowaq) => {
    setRowaqs(prev => prev.map(r => String(r.id) === String(id) ? { ...r, ...updatedRowaq, levels: parseInt(updatedRowaq.levels) || 0 } : r));
    rowaqsAPI.update(id, updatedRowaq).catch(err => console.error(err));
  };
  const deleteRowaq = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setRowaqs(prev => prev.filter(r => String(r.id) !== String(id)));
      rowaqsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const deleteUser = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setUsers(prev => {
        const next = prev.filter(u => String(u.id) !== String(id));
        saveToLocalStorage('users', next);
        return next;
      });
      usersAPI.delete(id).catch(err => console.error(err));
    }
  };

  const deleteUserByNationalId = (nationalId) => {
    if (!nationalId) return;
    const nid = String(nationalId).trim();
    setUsers(prev => {
      const user = prev.find(u => String(u.national_id || u.username || '').trim() === nid);
      if (user) {
        usersAPI.delete(user.id || user._id).catch(err => console.error(err));
        const next = prev.filter(u => String(u.id) !== String(user.id));
        saveToLocalStorage('users', next);
        return next;
      }
      return prev;
    });
  };

  const normalizeUserFields = (user) => {
    const isAdminRole = user.role === 'admin';
    if (isAdminRole) {
      return {
        ...user,
        username: 'admin',
        email: 'admin',
        national_id: 'admin',
        record_number: 'admin',
        password: user.password || user.record_number || '',
      };
    }
    return {
      ...user,
      username: user.username || user.national_id || user.email || '',
      email: user.email || user.national_id || '',
      password: user.password || user.record_number || '',
      record_number: user.record_number || user.password || '',
    };
  };

  const addUser = (user) => {
    const normalizedUser = {
      ...normalizeUserFields(user),
      id: String(Date.now()),
      created_at: new Date().toLocaleDateString('ar-EG')
    };
    try {
      const stored = JSON.parse(localStorage.getItem('users') || '[]');
      const nid = String(normalizedUser.national_id || '').trim();
      if (!nid || !stored.some(u => String(u.national_id || '').trim() === nid && nid !== '')) {
        stored.push(normalizedUser);
        localStorage.setItem('users', JSON.stringify(stored));
      }
    } catch (e) { console.error(e); }
    setUsers(prev => {
      const nid = String(normalizedUser.national_id || '').trim();
      if (nid && prev.some(u => String(u.national_id || '').trim() === nid)) return prev;
      return [...prev, normalizedUser];
    });
    usersAPI.create(normalizedUser).catch(err => console.error(err));
  };

  const updateUser = (id, updatedUser) => {
    const mergeAndNormalize = (u) => {
      const merged = { ...u, ...updatedUser };
      const isAdminRole = merged.role === 'admin';
      if (isAdminRole) {
        return {
          ...merged,
          username: 'admin',
          email: 'admin',
          national_id: 'admin',
          record_number: 'admin',
          password: merged.password || merged.record_number || '',
        };
      }
      return {
        ...merged,
        username: merged.national_id || merged.email || merged.username || '',
        email: merged.email || merged.national_id || '',
        password: merged.password || merged.record_number || '',
        record_number: merged.record_number || merged.password || '',
      };
    };
    let payload = null;
    setUsers(prev => prev.map(u => {
      if (String(u.id) === String(id)) {
        payload = mergeAndNormalize(u);
        return payload;
      }
      return u;
    }));
    try {
      const stored = JSON.parse(localStorage.getItem('users') || '[]');
      const updated = stored.map(u => String(u.id) === String(id) ? mergeAndNormalize(u) : u);
      localStorage.setItem('users', JSON.stringify(updated));
    } catch (e) { console.error(e); }
    if (payload) usersAPI.update(id, payload).catch(err => console.error(err));
  };

  const addApplicantBranch = (item) => {
    const newItem = { ...item, id: String(Date.now()) };
    setApplicantBranches(prev => [...prev, newItem]);
    applicantBranchesAPI.create(newItem).catch(err => console.error(err));
  };
  const updateApplicantBranch = (id, updatedItem) => {
    setApplicantBranches(prev => prev.map(b => String(b.id) === String(id) ? { ...b, ...updatedItem } : b));
    applicantBranchesAPI.update(id, updatedItem).catch(err => console.error(err));
  };
  const deleteApplicantBranch = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setApplicantBranches(prev => prev.filter(b => String(b.id) !== String(id)));
      applicantBranchesAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addAttendance = (attendance) => {
    const newAttendance = { ...attendance, id: String(Date.now()) };
    setAttendances(prev => [...prev, newAttendance]);
  };
  const deleteAttendance = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setAttendances(prev => prev.filter(a => String(a.id) !== String(id)));
    }
  };

  const addSessionReport = (report) => {
    const newReport = { ...report, id: String(Date.now()) };
    setSessionReports(prev => [...prev, newReport]);
    sessionReportsAPI.create(newReport).catch(err => console.error(err));
  };
  const deleteSessionReport = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setSessionReports(prev => prev.filter(r => String(r.id) !== String(id)));
      sessionReportsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addPlatformTopManagement = (item) => {
    const newItem = { ...item, id: String(Date.now()) };
    setPlatformTopManagement(prev => [...prev, newItem]);
    platformTopManagementAPI.create(newItem).catch(err => console.error(err));
  };
  const updatePlatformTopManagement = (id, updatedItem) => {
    setPlatformTopManagement(prev => prev.map(m => String(m.id) === String(id) ? { ...m, ...updatedItem } : m));
    platformTopManagementAPI.update(id, updatedItem).catch(err => console.error(err));
  };
  const deletePlatformTopManagement = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      const item = platformTopManagement.find(m => String(m.id) === String(id));
      if (item && item.national_id) deleteUserByNationalId(item.national_id);
      setPlatformTopManagement(prev => prev.filter(m => String(m.id) !== String(id)));
      platformTopManagementAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addPlatformSupervisor = (item) => {
    const newItem = { ...item, id: String(Date.now()) };
    setPlatformSupervisors(prev => [...prev, newItem]);
    platformSupervisorsAPI.create(newItem).catch(err => console.error(err));
  };
  const updatePlatformSupervisor = (id, updatedItem) => {
    setPlatformSupervisors(prev => prev.map(m => String(m.id) === String(id) ? { ...m, ...updatedItem } : m));
    platformSupervisorsAPI.update(id, updatedItem).catch(err => console.error(err));
  };
  const deletePlatformSupervisor = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      const item = platformSupervisors.find(m => String(m.id) === String(id));
      if (item && item.national_id) deleteUserByNationalId(item.national_id);
      setPlatformSupervisors(prev => prev.filter(m => String(m.id) !== String(id)));
      platformSupervisorsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addPlatformCoordinator = (item) => {
    const newItem = { ...item, id: String(Date.now()) };
    setPlatformCoordinators(prev => [...prev, newItem]);
    platformCoordinatorsAPI.create(newItem).catch(err => console.error(err));
  };
  const updatePlatformCoordinator = (id, updatedItem) => {
    setPlatformCoordinators(prev => prev.map(m => String(m.id) === String(id) ? { ...m, ...updatedItem } : m));
    platformCoordinatorsAPI.update(id, updatedItem).catch(err => console.error(err));
  };
  const deletePlatformCoordinator = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      const item = platformCoordinators.find(m => String(m.id) === String(id));
      if (item && item.national_id) deleteUserByNationalId(item.national_id);
      setPlatformCoordinators(prev => prev.filter(m => String(m.id) !== String(id)));
      platformCoordinatorsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addPlatformMohfez = (item) => {
    const newItem = { ...item, id: String(Date.now()) };
    setPlatformMohfezs(prev => [...prev, newItem]);
    platformMohfezsAPI.create(newItem).catch(err => console.error(err));
  };
  const updatePlatformMohfez = (id, updatedItem) => {
    setPlatformMohfezs(prev => prev.map(m => String(m.id) === String(id) ? { ...m, ...updatedItem } : m));
    platformMohfezsAPI.update(id, updatedItem).catch(err => console.error(err));
  };
  const deletePlatformMohfez = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      const item = platformMohfezs.find(m => String(m.id) === String(id));
      if (item && item.national_id) deleteUserByNationalId(item.national_id);
      setPlatformMohfezs(prev => prev.filter(m => String(m.id) !== String(id)));
      platformMohfezsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addPlatformSession = (item) => {
    const newItem = { ...item, id: String(Date.now()) };
    setPlatformSessions(prev => [...prev, newItem]);
    platformSessionsAPI.create(newItem).catch(err => console.error(err));
  };
  const updatePlatformSession = (id, updatedItem) => {
    setPlatformSessions(prev => prev.map(m => String(m.id) === String(id) ? { ...m, ...updatedItem } : m));
    platformSessionsAPI.update(id, updatedItem).catch(err => console.error(err));
  };
  const deletePlatformSession = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setPlatformSessions(prev => prev.filter(m => String(m.id) !== String(id)));
      platformSessionsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addPlatformStudent = (item) => {
    const newItem = { ...item, id: String(Date.now()) };
    setPlatformStudents(prev => [...prev, newItem]);
    platformStudentsAPI.create(newItem).catch(err => console.error(err));
  };
  const updatePlatformStudent = (id, updatedItem) => {
    setPlatformStudents(prev => prev.map(m => String(m.id) === String(id) ? { ...m, ...updatedItem } : m));
    platformStudentsAPI.update(id, updatedItem).catch(err => console.error(err));
  };
  const deletePlatformStudent = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      const item = platformStudents.find(m => String(m.id) === String(id));
      if (item) deleteUserByNationalId(item.passport_no || item.national_id);
      setPlatformStudents(prev => prev.filter(m => String(m.id) !== String(id)));
      platformStudentsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const bulkImportPlatformStudents = async (studentList, userList) => {
    const newStudents = studentList.map(s => ({
      ...s,
      id: s.id || String(Date.now() + Math.random())
    }));
    
    try {
      await platformStudentsAPI.bulkImport(newStudents);
    } catch (err) {
      console.error('Failed platform students bulk import:', err);
      alert('فشل حفظ دارسي المنصة في قاعدة البيانات: ' + err.message);
      throw err;
    }

    setPlatformStudents(prev => [...prev, ...newStudents]);
    const saved = getFromLocalStorage('platformStudents', []);
    saveToLocalStorage('platformStudents', [...saved, ...newStudents]);

    if (userList && userList.length > 0) {
      const newUsers = userList.map(u => ({
        ...u,
        id: u.id || String(Date.now() + Math.random()),
        created_at: new Date().toLocaleDateString('ar-EG')
      }));
      try {
        await usersAPI.bulkImport(newUsers);
      } catch (err) {
        console.error('Failed bulk import users:', err);
        alert('تنبيه: فشل حفظ بعض حسابات الدخول لدارسي المنصة في قاعدة البيانات: ' + err.message);
      }
      setUsers(prev => {
        const uniqueUsers = [...prev];
        newUsers.forEach(nu => {
          if (!uniqueUsers.some(u => String(u.national_id).trim() === String(nu.national_id).trim())) {
            uniqueUsers.push(nu);
          }
        });
        saveToLocalStorage('users', uniqueUsers);
        return uniqueUsers;
      });
    }
  };

  const addPlatformApplicant = (item) => {
    const newItem = { ...item, id: String(Date.now()) };
    setPlatformApplicants(prev => [...prev, newItem]);
    platformApplicantsAPI.create(newItem).catch(err => console.error(err));
  };
  const updatePlatformApplicant = (id, updatedItem) => {
    setPlatformApplicants(prev => prev.map(m => String(m.id) === String(id) ? { ...m, ...updatedItem } : m));
    platformApplicantsAPI.update(id, updatedItem).catch(err => console.error(err));
  };
  const deletePlatformApplicant = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setPlatformApplicants(prev => prev.filter(m => String(m.id) !== String(id)));
      platformApplicantsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addPlatformRowaq = (item) => {
    const newItem = { ...item, id: String(Date.now()), levels: item.levels || 0, created_at: new Date().toISOString().split('T')[0] };
    setPlatformRowaqs(prev => [...prev, newItem]);
    platformRowaqsAPI.create(newItem).catch(err => console.error(err));
  };
  const updatePlatformRowaq = (id, updatedItem) => {
    setPlatformRowaqs(prev => prev.map(m => String(m.id) === String(id) ? { ...m, ...updatedItem } : m));
    platformRowaqsAPI.update(id, updatedItem).catch(err => console.error(err));
  };
  const deletePlatformRowaq = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setPlatformRowaqs(prev => prev.filter(m => String(m.id) !== String(id)));
      platformRowaqsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const verifyDeleteAllPassword = () => {
    const password = prompt('الرجاء إدخال كلمة المرور لتأكيد حذف الجميع:');
    if (password === '4219') {
      return true;
    }
    if (password !== null) {
      alert('كلمة المرور غير صحيحة!');
    }
    return false;
  };

  const deleteAllStudents = () => {
    if (!verifyDeleteAllPassword()) return;
    if (window.confirm('هل أنت متأكد من حذف جميع الطلاب؟ هذه العملية لا يمكن التراجع عنها.')) {
      setStudents([]);
      studentsAPI.deleteAll().catch(err => console.error(err));
    }
  };

  const deleteAllMohfezs = () => {
    if (!verifyDeleteAllPassword()) return;
    if (window.confirm('هل أنت متأكد من حذف جميع المحفظين؟ هذه العملية لا يمكن التراجع عنها.')) {
      setMohfezs([]);
      mohfezsAPI.deleteAll().catch(err => console.error(err));
    }
  };

  const deleteAllCoordinators = () => {
    if (!verifyDeleteAllPassword()) return;
    if (window.confirm('هل أنت متأكد من حذف جميع المنسقين؟ هذه العملية لا يمكن التراجع عنها.')) {
      setCoordinators([]);
      coordinatorsAPI.deleteAll().catch(err => console.error(err));
    }
  };

  const deleteAllBranches = () => {
    if (!verifyDeleteAllPassword()) return;
    if (window.confirm('هل أنت متأكد من حذف جميع الفروع؟ هذه العملية لا يمكن التراجع عنها.')) {
      setBranches([]);
      branchesAPI.deleteAll().catch(err => console.error(err));
    }
  };

  const deleteAllSessions = () => {
    if (!verifyDeleteAllPassword()) return;
    if (window.confirm('هل أنت متأكد من حذف جميع الحلقات؟ هذه العملية لا يمكن التراجع عنها.')) {
      setSessions([]);
      sessionsAPI.deleteAll().catch(err => console.error(err));
    }
  };

  const deleteAllManagers = () => {
    if (!verifyDeleteAllPassword()) return;
    if (window.confirm('هل أنت متأكد من حذف جميع المشرفين والمدراء؟ هذه العملية لا يمكن التراجع عنها.')) {
      setManagers([]);
      managersAPI.deleteAll().catch(err => console.error(err));
    }
  };

  const deleteAllApplicants = () => {
    if (!verifyDeleteAllPassword()) return;
    if (window.confirm('هل أنت متأكد من حذف جميع طلبات التقديم؟ هذه العملية لا يمكن التراجع عنها.')) {
      setApplicants([]);
      applicantsAPI.deleteAll().catch(err => console.error(err));
    }
  };

  const deleteAllPlatformTopManagement = () => {
    if (!verifyDeleteAllPassword()) return;
    if (window.confirm('هل أنت متأكد من حذف جميع أعضاء الإدارة العليا للمنصة؟ هذه العملية لا يمكن التراجع عنها.')) {
      setPlatformTopManagement([]);
      platformTopManagementAPI.deleteAll().catch(err => console.error(err));
    }
  };

  const deleteAllPlatformSupervisors = () => {
    if (!verifyDeleteAllPassword()) return;
    if (window.confirm('هل أنت متأكد من حذف جميع مشرفي المنصة؟ هذه العملية لا يمكن التراجع عنها.')) {
      setPlatformSupervisors([]);
      platformSupervisorsAPI.deleteAll().catch(err => console.error(err));
    }
  };

  const deleteAllPlatformCoordinators = () => {
    if (!verifyDeleteAllPassword()) return;
    if (window.confirm('هل أنت متأكد من حذف جميع منسقي المنصة؟ هذه العملية لا يمكن التراجع عنها.')) {
      setPlatformCoordinators([]);
      platformCoordinatorsAPI.deleteAll().catch(err => console.error(err));
    }
  };

  const deleteAllPlatformMohfezs = () => {
    if (!verifyDeleteAllPassword()) return;
    if (window.confirm('هل أنت متأكد من حذف جميع محفظي المنصة؟ هذه العملية لا يمكن التراجع عنها.')) {
      setPlatformMohfezs([]);
      platformMohfezsAPI.deleteAll().catch(err => console.error(err));
    }
  };

  const deleteAllPlatformSessions = () => {
    if (!verifyDeleteAllPassword()) return;
    if (window.confirm('هل أنت متأكد من حذف جميع حلقات المنصة؟ هذه العملية لا يمكن التراجع عنها.')) {
      setPlatformSessions([]);
      platformSessionsAPI.deleteAll().catch(err => console.error(err));
    }
  };

  const deleteAllPlatformStudents = () => {
    if (!verifyDeleteAllPassword()) return;
    if (window.confirm('هل أنت متأكد من حذف جميع دارسي المنصة؟ هذه العملية لا يمكن التراجع عنها.')) {
      setPlatformStudents([]);
      platformStudentsAPI.deleteAll().catch(err => console.error(err));
    }
  };

  const deleteAllPlatformApplicants = () => {
    if (!verifyDeleteAllPassword()) return;
    if (window.confirm('هل أنت متأكد من حذف جميع طلبات تقديم المنصة؟ هذه العملية لا يمكن التراجع عنها.')) {
      setPlatformApplicants([]);
      platformApplicantsAPI.deleteAll().catch(err => console.error(err));
    }
  };

  // --- Sharia CRUD Operations ---
  const addShariaCourse = (course) => {
    const newCourse = { ...course, id: String(Date.now() + Math.random()) };
    setShariaCourses(prev => [...prev, newCourse]);
    shariaCoursesAPI.create(newCourse).catch(err => console.error(err));
  };
  const updateShariaCourse = (id, updatedCourse) => {
    setShariaCourses(prev => prev.map(c => String(c.id) === String(id) ? { ...c, ...updatedCourse } : c));
    shariaCoursesAPI.update(id, updatedCourse).catch(err => console.error(err));
  };
  const deleteShariaCourse = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setShariaCourses(prev => prev.filter(c => String(c.id) !== String(id)));
      shariaCoursesAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addShariaBranch = (branch) => {
    const newBranch = { ...branch, id: String(Date.now() + Math.random()) };
    setShariaBranches(prev => [...prev, newBranch]);
    shariaBranchesAPI.create(newBranch).catch(err => console.error(err));
  };
  const updateShariaBranch = (id, updatedBranch) => {
    setShariaBranches(prev => prev.map(b => String(b.id) === String(id) ? { ...b, ...updatedBranch } : b));
    shariaBranchesAPI.update(id, updatedBranch).catch(err => console.error(err));
  };
  const deleteShariaBranch = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setShariaBranches(prev => prev.filter(b => String(b.id) !== String(id)));
      shariaBranchesAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addShariaStudent = (student) => {
    const newStudent = { ...student, id: String(Date.now() + Math.random()) };
    setShariaStudents(prev => [...prev, newStudent]);
    shariaStudentsAPI.create(newStudent).catch(err => console.error(err));
  };
  const updateShariaStudent = async (id, updatedStudent) => {
    const previousStudents = [...shariaStudents];
    setShariaStudents(prev => prev.map(s => String(s.id) === String(id) ? { ...s, ...updatedStudent } : s));
    try {
      await shariaStudentsAPI.update(id, updatedStudent);
    } catch (err) {
      console.error('Failed to update sharia student on backend:', err);
      alert('فشل حفظ التعديلات في قاعدة البيانات: ' + (err.message || 'خطأ غير معروف'));
      setShariaStudents(previousStudents);
    }
  };
  const deleteShariaStudent = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      const item = shariaStudents.find(s => String(s.id) === String(id));
      if (item && item.nationalId) deleteUserByNationalId(item.nationalId);
      setShariaStudents(prev => prev.filter(s => String(s.id) !== String(id)));
      shariaStudentsAPI.delete(id).catch(err => console.error(err));
    }
  };

  const bulkImportShariaStudents = async (studentList) => {
    const newStudents = studentList.map(s => ({
      ...s,
      id: s.id || String(Date.now() + Math.random())
    }));
    try {
      await shariaStudentsAPI.bulkImport(newStudents);
    } catch (err) {
      console.error('Failed to bulk import sharia students to DB:', err);
      alert('فشل حفظ الطلاب في قاعدة البيانات: ' + err.message);
      throw err;
    }
    setShariaStudents(prev => [...prev, ...newStudents]);
    const saved = getFromLocalStorage('sharia_students', []);
    saveToLocalStorage('sharia_students', [...saved, ...newStudents]);
  };

  const addShariaTeacher = (teacher) => {
    const newTeacher = { ...teacher, id: String(Date.now() + Math.random()) };
    setShariaTeachers(prev => [...prev, newTeacher]);
    shariaTeachersAPI.create(newTeacher).catch(err => console.error(err));
  };
  const updateShariaTeacher = async (id, updatedTeacher) => {
    const previousTeachers = [...shariaTeachers];
    setShariaTeachers(prev => prev.map(t => String(t.id) === String(id) ? { ...t, ...updatedTeacher } : t));
    try {
      await shariaTeachersAPI.update(id, updatedTeacher);
    } catch (err) {
      console.error('Failed to update sharia teacher on backend:', err);
      alert('فشل حفظ التعديلات في قاعدة البيانات: ' + (err.message || 'خطأ غير معروف'));
      setShariaTeachers(previousTeachers);
    }
  };
  const deleteShariaTeacher = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      const item = shariaTeachers.find(t => String(t.id) === String(id));
      if (item && item.nationalId) deleteUserByNationalId(item.nationalId);
      setShariaTeachers(prev => prev.filter(t => String(t.id) !== String(id)));
      shariaTeachersAPI.delete(id).catch(err => console.error(err));
    }
  };
  const bulkImportShariaTeachers = async (teacherList) => {
    const newTeachers = teacherList.map(t => ({
      ...t,
      id: t.id || String(Date.now() + Math.random())
    }));
    try {
      await shariaTeachersAPI.bulkImport(newTeachers);
    } catch (err) {
      console.error('Failed to bulk import sharia teachers to DB:', err);
      alert('فشل حفظ المحاضرين في قاعدة البيانات: ' + err.message);
      throw err;
    }
    setShariaTeachers(prev => [...prev, ...newTeachers]);
    const saved = getFromLocalStorage('sharia_teachers', []);
    saveToLocalStorage('sharia_teachers', [...saved, ...newTeachers]);
  };

  const addShariaLive = (live) => {
    const newLive = { ...live, id: String(Date.now() + Math.random()) };
    setShariaLiveLectures(prev => [...prev, newLive]);
    shariaLivesAPI.create(newLive).catch(err => console.error(err));
  };
  const updateShariaLive = (id, updatedLive) => {
    setShariaLiveLectures(prev => prev.map(l => String(l.id) === String(id) ? { ...l, ...updatedLive } : l));
    shariaLivesAPI.update(id, updatedLive).catch(err => console.error(err));
  };
  const deleteShariaLive = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setShariaLiveLectures(prev => prev.filter(l => String(l.id) !== String(id)));
      shariaLivesAPI.delete(id).catch(err => console.error(err));
    }
  };

  const addShariaSchedule = (schedule) => {
    const newSchedule = { ...schedule, id: String(Date.now() + Math.random()) };
    setShariaSchedules(prev => [...prev, newSchedule]);
  };
  const updateShariaSchedule = (id, updatedSchedule) => {
    setShariaSchedules(prev => prev.map(s => String(s.id) === String(id) ? { ...s, ...updatedSchedule } : s));
  };
  const deleteShariaSchedule = (id) => {
    if (window.confirm('هل أنت متأكد من عملية الحذف؟')) {
      setShariaSchedules(prev => prev.filter(s => String(s.id) !== String(id)));
    }
  };

  const addShariaAttendance = (record) => {
    const newRecord = { ...record, id: String(Date.now() + Math.random()) };
    setShariaAttendance(prev => [...prev, newRecord]);
  };

  const addLectureAccessLog = (log) => {
    const newLog = { ...log, id: String(Date.now() + Math.random()), timestamp: new Date().toISOString() };
    setLectureAccessLogs(prev => {
      const exists = prev.some(l => l.studentId === log.studentId && l.lectureId === log.lectureId);
      if (exists) return prev;
      return [...prev, newLog];
    });
  };

  const updateRolePermissions = (newPermissions) => {
    setRolePermissions(newPermissions);
  };

  const hasPermission = (module, action) => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
      const role = currentUser ? currentUser.role : 'admin';
      const rolePerms = rolePermissions[role] || defaultPermissions[role] || defaultPermissions.student;
      return rolePerms && rolePerms[module] ? !!rolePerms[module][action] : false;
    } catch {
      return true;
    }
  };
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <AppDataContext.Provider value={{
      managers, addManager, updateManager, deleteManager, deleteAllManagers,
      monthlyReports, addMonthlyReport, updateMonthlyReport, deleteMonthlyReport,
      branches, addBranch, updateBranch, deleteBranch, deleteAllBranches,
      coordinators, addCoordinator, updateCoordinator, deleteCoordinator, deleteAllCoordinators,
      mohfezs, addMohfez, updateMohfez, deleteMohfez, deleteAllMohfezs,
      sessions, addSession, updateSession, deleteSession, deleteAllSessions,
      students, addStudent, updateStudent, deleteStudent, deleteAllStudents, bulkImportStudents,
      followUpReports, addFollowUpReport, confirmFollowUpReport,
      applicants, addApplicant, updateApplicant, deleteApplicant, deleteAllApplicants,
      administrations, addCenterToAdmin,
      rowaqs, addRowaq, updateRowaq, deleteRowaq,
      users, deleteUser, addUser, updateUser,
      applicantBranches, addApplicantBranch, updateApplicantBranch, deleteApplicantBranch,
      auditLogs,
      attendances, addAttendance, deleteAttendance,
      sessionReports, addSessionReport, deleteSessionReport,

      platformTopManagement, addPlatformTopManagement, updatePlatformTopManagement, deletePlatformTopManagement, deleteAllPlatformTopManagement,
      platformSupervisors, addPlatformSupervisor, updatePlatformSupervisor, deletePlatformSupervisor, deleteAllPlatformSupervisors,
      platformCoordinators, addPlatformCoordinator, updatePlatformCoordinator, deletePlatformCoordinator, deleteAllPlatformCoordinators,
      platformMohfezs, addPlatformMohfez, updatePlatformMohfez, deletePlatformMohfez, deleteAllPlatformMohfezs,
      platformSessions, addPlatformSession, updatePlatformSession, deletePlatformSession, deleteAllPlatformSessions,
      platformStudents, addPlatformStudent, updatePlatformStudent, deletePlatformStudent, deleteAllPlatformStudents, bulkImportPlatformStudents,
      platformApplicants, addPlatformApplicant, updatePlatformApplicant, deletePlatformApplicant, deleteAllPlatformApplicants,
      platformRowaqs, addPlatformRowaq, updatePlatformRowaq, deletePlatformRowaq,

      shariaCourses, addShariaCourse, updateShariaCourse, deleteShariaCourse,
      shariaBranches, addShariaBranch, updateShariaBranch, deleteShariaBranch,
      shariaStudents, addShariaStudent, updateShariaStudent, deleteShariaStudent, bulkImportShariaStudents,
      shariaTeachers, addShariaTeacher, updateShariaTeacher, deleteShariaTeacher, bulkImportShariaTeachers,
      shariaLiveLectures, addShariaLive, updateShariaLive, deleteShariaLive,
      shariaSchedules, addShariaSchedule, updateShariaSchedule, deleteShariaSchedule,
      shariaAttendance, addShariaAttendance,
      lectureAccessLogs, addLectureAccessLog,

      theme, toggleTheme,
      rolePermissions, updateRolePermissions, hasPermission,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
