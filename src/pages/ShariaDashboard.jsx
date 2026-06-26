import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  BookOpen, GraduationCap, Users, Calendar, Award, Shield, MapPin, 
  Layers, FileText, Newspaper, Radio, Video, Plus, Search, Filter, 
  Trash, Edit, Check, X, ChevronLeft, ChevronRight, Play, ExternalLink,
  Download, Upload
} from 'lucide-react';
import { exportToXLSX, importFromXLSX, exportMultiSheetToXLSX } from '../utils/xlsxHelper';
import Footer from '../components/Footer';
import { useAppData } from '../context/AppDataContext';
import JitsiMeeting from '../components/JitsiMeeting';

// All Egyptian governorates + Al-Azhar Mosque
const GOVERNORATES = [
  'الجامع الأزهر', 'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 
  'البحر الأحمر', 'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 
  'المنوفية', 'المنيا', 'القليوبية', 'الوادي الجديد', 'الشرقية', 
  'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا', 'شمال سيناء', 'سوهاج'
];

const getDisciplineKey = (arabicVal) => {
  if (!arabicVal) return '—';
  if (arabicVal === 'فقه وأصوله' || arabicVal === 'fiqh') return 'fiqh';
  if (arabicVal === 'تفسير وحديث' || arabicVal === 'tafsir') return 'tafsir';
  if (arabicVal === 'عقيدة' || arabicVal === 'aqeedah') return 'aqeedah';
  if (arabicVal === 'لغة عربية' || arabicVal === 'arabic') return 'arabic';
  if (arabicVal === 'عامة' || arabicVal === 'general') return 'general';
  return arabicVal;
};

const normalizeArabic = (str) => {
  if (!str) return '';
  return str
    .trim()
    .replace(/[أإآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ِ|ُ|َ|ً|ٌ|ٍ|ّ|ْ/g, ''); // Remove diacritics
};


function ShariaDashboard() {
  const {
    managers = [], addManager, deleteManager, addUser, updateUser, users = [], branches = [],
    shariaCourses = [], addShariaCourse, updateShariaCourse, deleteShariaCourse,
    shariaBranches = [], addShariaBranch, updateShariaBranch, deleteShariaBranch,
    shariaStudents = [], addShariaStudent, updateShariaStudent, deleteShariaStudent, bulkImportShariaStudents,
    shariaTeachers = [], addShariaTeacher, updateShariaTeacher, deleteShariaTeacher, bulkImportShariaTeachers,
    shariaLiveLectures = [], addShariaLive, updateShariaLive, deleteShariaLive,
    shariaSchedules = [], addShariaSchedule, updateShariaSchedule, deleteShariaSchedule,
    shariaAttendance = [], addShariaAttendance,
    lectureAccessLogs = [], addLectureAccessLog, updateLectureAccessDuration
  } = useAppData();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const userRole = currentUser ? currentUser.role : '';
  const isShariaStudent = userRole === 'sharia_student';
  const isShariaTeacher = userRole === 'sharia_teacher' || 
    (userRole === 'mohfez' && shariaTeachers.some(t => String(t.nationalId || '').trim() === String(currentUser?.national_id || currentUser?.username || '').trim()));
  const userAdminGov = currentUser ? (currentUser.userAdmin || currentUser.governorate) : '';
  const isSuperAdmin = userRole === 'admin';
  const isGovOfficial = !isSuperAdmin && userAdminGov && userAdminGov !== 'الجامع الأزهر';

  const importAdminsRef = useRef(null);
  const importTeachersRef = useRef(null);
  const importStudentsRef = useRef(null);
  const importCoursesRef = useRef(null);
  const importLiveRef = useRef(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(null); // 'admin', 'externalAdmin', 'course', 'student', 'exam', 'result', 'news', 'live'
  const [showOnlyActiveLives, setShowOnlyActiveLives] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);
  
  // Governorate filter selection (Students & Live Lectures & Attendance vary per governorate)
  const [selectedGov, setSelectedGov] = useState(() => {
    if (isGovOfficial) return userAdminGov;
    return 'الكل';
  });
  const [selectedBranch, setSelectedBranch] = useState('الكل');
  const [selectedLiveStage, setSelectedLiveStage] = useState('الكل');
  const [selectedLiveLevel, setSelectedLiveLevel] = useState('الكل');
  const [selectedLiveDiscipline, setSelectedLiveDiscipline] = useState('الكل');

  useEffect(() => {
    const targetTab = tabParam || 'overview';
    if ((isShariaStudent || isShariaTeacher) && ['admins', 'externalAdmins', 'students', 'teachers'].includes(targetTab)) {
      setActiveTab('overview');
    } else {
      setActiveTab(targetTab);
    }
  }, [tabParam, isShariaStudent, isShariaTeacher]);

  const courses = shariaCourses;
  const students = shariaStudents;
  const teachers = shariaTeachers;
  const liveLectures = shariaLiveLectures;

  const targetSpecialties = [
    'مدير الإدارة',
    'العضو التقني',
    'العضو الإداري للعلوم الشرعية والعربية',
    'العضو العلمي للعلوم الشرعية والعربية',
    'العضو الإداري، علوم شرعية وعربية',
    'العضو العلمي، علوم شرعية وعربية',
    'العضو الإداري علوم شرعية وعربية',
    'العضو العلمي علوم شرعية وعربية'
  ];

  // Derive admins from Rowaq managers assigned to 'الجامع الأزهر'
  const admins = managers.filter(m => {
    const gov = m.admin || m.governorate;
    const spec = m.specialty || m.specialization;
    return gov === 'الجامع الأزهر' && targetSpecialties.includes(spec);
  }).map(m => ({
    ...m,
    governorate: m.admin || m.governorate,
    specialty: (m.specialty === 'العضو الإداري، علوم شرعية وعربية' || m.specialty === 'العضو الإداري للعلوم الشرعية والعربية' || m.specialty === 'العضو الإداري علوم شرعية وعربية') ? 'العضو الإداري علوم شرعية وعربية' :
               (m.specialty === 'العضو العلمي، علوم شرعية وعربية' || m.specialty === 'العضو العلمي للعلوم الشرعية والعربية' || m.specialty === 'العضو العلمي علوم شرعية وعربية') ? 'العضو العلمي علوم شرعية وعربية' :
               m.specialty,
    status: m.status || 'نشط'
  }));

  // Derive externalAdmins from Rowaq managers assigned to other governorates
  const externalAdmins = managers.filter(m => {
    const gov = m.admin || m.governorate;
    const spec = m.specialty || m.specialization;
    return gov && gov !== 'الجامع الأزهر' && targetSpecialties.includes(spec);
  }).map(m => ({
    ...m,
    governorate: m.admin || m.governorate,
    specialty: (m.specialty === 'العضو الإداري، علوم شرعية وعربية' || m.specialty === 'العضو الإداري للعلوم الشرعية والعربية' || m.specialty === 'العضو الإداري علوم شرعية وعربية') ? 'العضو الإداري علوم شرعية وعربية' :
               (m.specialty === 'العضو العلمي، علوم شرعية وعربية' || m.specialty === 'العضو العلمي للعلوم الشرعية والعربية' || m.specialty === 'العضو العلمي علوم شرعية وعربية') ? 'العضو العلمي علوم شرعية وعربية' :
               m.specialty,
    status: m.status || 'نشط'
  }));
  const adminMember = managers.find(m => {
    const gov = m.admin || m.governorate;
    const spec = m.specialty || m.specialization || '';
    return gov === selectedGov && (
      spec.includes('العضو الإداري') || 
      spec.includes('العضو الاداري') || 
      spec === 'العضو الإداري للعلوم الشرعية والعربية' ||
      spec === 'العضو الإداري، علوم شرعية وعربية' ||
      spec === 'العضو الإداري علوم شرعية وعربية'
    );
  });

  const scientificMember = managers.find(m => {
    const gov = m.admin || m.governorate;
    const spec = m.specialty || m.specialization || '';
    return gov === selectedGov && (
      spec.includes('العضو العلمي') || 
      spec.includes('العضو العلمى') || 
      spec === 'العضو العلمي للعلوم الشرعية والعربية' ||
      spec === 'العضو العلمي، علوم شرعية وعربية' ||
      spec === 'العضو العلمي علوم شرعية وعربية'
    );
  });
  const [selectedCourseStage, setSelectedCourseStage] = useState('التمهيدية');
  const [selectedCourseLevel, setSelectedCourseLevel] = useState('المستوى الأول');
  const [selectedCourseDiscipline, setSelectedCourseDiscipline] = useState('fiqh');

  const loggedInStudent = isShariaStudent 
    ? students.find(s => String(s.nationalId || '').trim() === String(currentUser?.national_id || '').trim())
    : null;

  useEffect(() => {
    if (isShariaStudent && loggedInStudent) {
      setSelectedCourseStage(loggedInStudent.stage || 'التمهيدية');
      setSelectedCourseLevel(loggedInStudent.level || 'المستوى الأول');
      setSelectedCourseDiscipline(loggedInStudent.discipline || 'fiqh');
      setSelectedGov(loggedInStudent.governorate || 'الجامع الأزهر');
    }
  }, [isShariaStudent, loggedInStudent]);

  const [editingStudent, setEditingStudent] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingShariaBranch, setEditingShariaBranch] = useState(null);
  const [editingLive, setEditingLive] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [news, setNews] = useState([]);


  // --- NEW ITEM FORM STATES ---
  const [adminForm, setAdminForm] = useState({ 
    name: '', email: '', phone: '', national_id: '', specialty: 'مدير الإدارة',
    record_no: '', job_title: '', workplace: '', job_grade: '',
    qualification: '', decision_no: '', admin: 'الجامع الأزهر', address: '', status: 'نشط'
  });
  const [externalAdminForm, setExternalAdminForm] = useState({ 
    name: '', email: '', phone: '', national_id: '', specialty: 'مدير الإدارة',
    record_no: '', job_title: '', workplace: '', job_grade: '',
    qualification: '', decision_no: '', governorate: 'الجامع الأزهر', address: '', status: 'نشط', branchCount: 1
  });
  const [courseForm, setCourseForm] = useState({ stage: 'التمهيدية', level: 'المستوى الأول', discipline: 'fiqh', name: '', teacher: '', hours: 20, pdfs: [] });
  const [studentForm, setStudentForm] = useState({ 
    name: '', 
    nationalId: '', 
    governorate: 'الجامع الأزهر', 
    branch: '',
    stage: 'التمهيدية', 
    level: 'المستوى الأول', 
    discipline: '—', 
    fiqhSchool: 'شافعي', 
    gender: 'ذكر', 
    studyType: 'مباشر',
    code: '',
    seatNumber: ''
  });
  const [examForm, setExamForm] = useState({ name: '', level: 'تمهيدية - المستوى الأول', date: '', duration: '90 دقيقة', totalQuestions: 40, status: 'مجدول' });
  const [resultForm, setResultForm] = useState({ studentName: '', examName: '', score: 85, grade: 'جيد جداً', status: 'ناجح', governorate: 'الجامع الأزهر' });
  const [newsForm, setNewsForm] = useState({ title: '', content: '', date: new Date().toISOString().split('T')[0], category: 'إعلان عام', status: 'منشور' });
  const [liveForm, setLiveForm] = useState(() => {
    try {
      const saved = localStorage.getItem('lastLiveForm');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          title: '',
          link: ''
        };
      }
    } catch (e) {
      console.error("Error reading lastLiveForm from localStorage:", e);
    }
    return {
      title: '',
      governorate: 'الجامع الأزهر',
      stage: 'التمهيدية',
      level: 'المستوى الأول',
      discipline: '—',
      teacher: '',
      day: 'الأحد',
      timeStart: '',
      timeEnd: '',
      link: '',
      streamType: 'embedded',
      isWeekly: true,
      status: 'مجدول'
    };
  });
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [editTeacherSearchQuery, setEditTeacherSearchQuery] = useState('');
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    nationalId: '',
    phone: '',
    jobGrade: '',
    university: '',
    college: '',
    department: '',
    governorate: 'الجامع الأزهر',
    branches: []
  });
  const [shariaBranchForm, setShariaBranchForm] = useState({ name: '', governorate: 'الجامع الأزهر', code: '', address: '' });
  const [scheduleForm, setScheduleForm] = useState({
    governorate: 'الجامع الأزهر',
    branch: '',
    stage: 'التمهيدية',
    level: 'المستوى الأول',
    discipline: '—',
    day: 'السبت',
    timeStart: '',
    timeEnd: '',
    teacher: '',
    place: '',
    isWeekly: true
  });

  const [attForm, setAttForm] = useState({
    courseName: '',
    date: new Date().toISOString().split('T')[0],
    liveId: ''
  });

  // --- HANDLERS FOR ADDING ITEMS ---
  const handleAddAdmin = (e) => {
    e.preventDefault();
    const finalForm = {
      ...adminForm,
      username: adminForm.national_id,
      password: adminForm.record_no
    };
    addManager(finalForm);
    setShowAddModal(null);
    setAdminForm({ 
      name: '', email: '', phone: '', national_id: '', specialty: 'مدير الإدارة',
      record_no: '', job_title: '', workplace: '', job_grade: '',
      qualification: '', decision_no: '', admin: 'الجامع الأزهر', address: '', status: 'نشط'
    });
  };

  const handleAddExternalAdmin = (e) => {
    e.preventDefault();
    const finalForm = {
      ...externalAdminForm,
      admin: externalAdminForm.governorate, // Align with main Rowaq admin field
      username: externalAdminForm.national_id,
      password: externalAdminForm.record_no
    };
    addManager(finalForm);
    setShowAddModal(null);
    setExternalAdminForm({ 
      name: '', email: '', phone: '', national_id: '', specialty: 'مدير الإدارة',
      record_no: '', job_title: '', workplace: '', job_grade: '',
      qualification: '', decision_no: '', governorate: 'الجامع الأزهر', address: '', status: 'نشط', branchCount: 1
    });
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    const formattedCourse = {
      stage: courseForm.stage,
      level: courseForm.level,
      discipline: courseForm.stage === 'المتقدمة' ? courseForm.discipline : '—',
      name: courseForm.name,
      teacher: '',
      studentsCount: 0,
      hours: 20,
      pdfs: courseForm.pdfs || []
    };
    addShariaCourse(formattedCourse);
    setShowAddModal(null);
    setCourseForm({ stage: 'التمهيدية', level: 'المستوى الأول', discipline: 'fiqh', name: '', teacher: '', hours: 20, pdfs: [] });
  };

  const handleFileChange = (e, isEdit = false) => {
    const files = Array.from(e.target.files);
    const allowedExtensions = ['.pdf', '.zip', '.rar', '.7z', '.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const validFiles = files.filter(file => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      const isImage = file.type.startsWith('image/');
      const isZip = file.type === 'application/zip' || 
                    file.type === 'application/x-zip-compressed' || 
                    file.type === 'application/x-rar-compressed' || 
                    file.type === 'application/x-7z-compressed' ||
                    file.type.includes('zip') || 
                    file.type.includes('rar') || 
                    file.type.includes('7z');
      const isPdf = file.type === 'application/pdf';
      return isPdf || isImage || isZip || allowedExtensions.includes(ext);
    });
    
    if (validFiles.length === 0) {
      if (files.length > 0) {
        alert('يرجى اختيار ملفات مدعومة فقط (PDF، صور، أو ملفات مضغوطة zip/rar/7z)');
      }
      return;
    }
    
    let loadedPdfs = [];
    let count = 0;
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        loadedPdfs.push({
          name: file.name,
          data: event.target.result
        });
        
        count++;
        if (count === validFiles.length) {
          if (isEdit) {
            setEditingCourse(prev => ({
              ...prev,
              pdfs: [...(prev.pdfs || []), ...loadedPdfs]
            }));
          } else {
            setCourseForm(prev => ({
              ...prev,
              pdfs: [...(prev.pdfs || []), ...loadedPdfs]
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (studentForm.phone && studentForm.phone.length !== 11) {
      alert('رقم الجوال يجب أن يكون مكوناً من 11 رقماً');
      return;
    }
    addShariaStudent(studentForm);
    
    // Auto-create user account
    if (studentForm.nationalId) {
      const studentUser = {
        name: studentForm.name,
        national_id: studentForm.nationalId,
        username: studentForm.nationalId,
        password: studentForm.nationalId,
        email: studentForm.nationalId,
        role: 'sharia_student',
        phone: studentForm.phone || '',
        governorate: studentForm.governorate || '',
        created_at: new Date().toLocaleDateString('ar-EG')
      };
      addUser(studentUser);
    }
    
    setShowAddModal(null);
    setStudentForm({ 
      name: '', 
      nationalId: '', 
      governorate: 'الجامع الأزهر', 
      branch: '',
      stage: 'التمهيدية', 
      level: 'المستوى الأول', 
      discipline: '—', 
      fiqhSchool: 'شافعي', 
      gender: 'ذكر', 
      studyType: 'مباشر',
      code: '',
      seatNumber: ''
    });
  };

  const handleEditStudent = (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (editingStudent.phone && editingStudent.phone.length !== 11) {
      alert('رقم الجوال يجب أن يكون مكوناً من 11 رقماً');
      return;
    }
    
    const originalStudent = students.find(s => s.id === editingStudent.id);
    const oldNationalId = originalStudent ? originalStudent.nationalId : null;
    const newNationalId = editingStudent.nationalId;
    
    updateShariaStudent(editingStudent.id, editingStudent);
    
    if (newNationalId) {
      const targetOld = oldNationalId ? String(oldNationalId).trim() : '';
      const associatedUser = users.find(u => {
        const uNid = String(u.national_id || '').trim();
        const uUsername = String(u.username || '').trim();
        const uEmail = String(u.email || '').trim();
        return (targetOld !== '' && (uNid === targetOld || uUsername === targetOld || uEmail === targetOld));
      });

      if (associatedUser) {
        updateUser(associatedUser.id, {
          national_id: newNationalId,
          username: newNationalId,
          password: newNationalId,
          email: newNationalId
        });
      } else {
        const studentUser = {
          name: editingStudent.name,
          national_id: newNationalId,
          username: newNationalId,
          password: newNationalId,
          email: newNationalId,
          role: 'sharia_student',
          phone: editingStudent.phone || '',
          governorate: editingStudent.governorate || '',
          created_at: new Date().toLocaleDateString('ar-EG')
        };
        addUser(studentUser);
      }
    }
    
    setEditingStudent(null);
  };

  const handleAddExam = (e) => {
    e.preventDefault();
    setExams([...exams, { ...examForm, id: Date.now() }]);
    setShowAddModal(null);
    setExamForm({ name: '', level: 'تمهيدية - المستوى الأول', date: '', duration: '90 دقيقة', totalQuestions: 40, status: 'مجدول' });
  };

  const handleAddResult = (e) => {
    e.preventDefault();
    setResults([...results, { ...resultForm, id: Date.now(), score: Number(resultForm.score) }]);
    setShowAddModal(null);
    setResultForm({ studentName: '', examName: '', score: 85, grade: 'جيد جداً', status: 'ناجح', governorate: 'الجامع الأزهر' });
  };

  const handleAddNews = (e) => {
    e.preventDefault();
    setNews([...news, { ...newsForm, id: Date.now() }]);
    setShowAddModal(null);
    setNewsForm({ title: '', content: '', date: new Date().toISOString().split('T')[0], category: 'إعلان عام', status: 'منشور' });
  };

  const checkLiveConflict = (newLive, excludeId = null) => {
    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const cleanDay = (d) => String(d || '').replace('أ', 'ا').replace('إ', 'ا');

    const newStart = timeToMinutes(newLive.timeStart);
    const newEnd = timeToMinutes(newLive.timeEnd);

    for (const l of liveLectures) {
      if (excludeId && l.id === excludeId) continue;
      
      // Check if same day
      if (cleanDay(l.day) !== cleanDay(newLive.day)) continue;

      // Check if time ranges overlap
      const lStart = timeToMinutes(l.timeStart);
      const lEnd = timeToMinutes(l.timeEnd);
      const isOverlap = newStart < lEnd && lStart < newEnd;
      if (!isOverlap) continue;

      // Conflict Type A: Same teacher
      if (l.teacher === newLive.teacher && newLive.teacher !== '') {
        return `تعارض في جدول المحاضر: المحاضر "${newLive.teacher}" لديه محاضرة أخرى في هذا الوقت ("${l.title}")`;
      }

      // Conflict Type B: Same level (stage + level + discipline)
      const sameStage = l.stage === newLive.stage;
      const sameLevel = l.level === newLive.level;
      const sameDiscipline = l.stage !== 'المتقدمة' || l.discipline === newLive.discipline;
      if (sameStage && sameLevel && sameDiscipline) {
        return `تعارض في جدول المستوى: هذا المستوى لديه محاضرة أخرى مجدولة في نفس الوقت ("${l.title}")`;
      }
    }
    return null;
  };

  const handleAddLive = (e) => {
    e.preventDefault();
    const conflictError = checkLiveConflict(liveForm);
    if (conflictError) {
      alert(conflictError);
      return;
    }
    addShariaLive(liveForm);
    setShowAddModal(null);
    // Save to localStorage (without title and link)
    try {
      localStorage.setItem('lastLiveForm', JSON.stringify({
        ...liveForm,
        title: '',
        link: ''
      }));
    } catch (err) {
      console.error("Error saving lastLiveForm to localStorage:", err);
    }
    // Keep last added fields for easy scheduling, only clearing title and link
    setLiveForm(prev => ({
      ...prev,
      title: '',
      link: ''
    }));
  };

  const handleAddTeacher = (e) => {
    e.preventDefault();
    if (teacherForm.phone && teacherForm.phone.length !== 11) {
      alert('رقم الهاتف يجب أن يكون مكوناً من 11 رقماً');
      return;
    }
    const finalForm = {
      ...teacherForm,
      branch: (teacherForm.branches || []).join('، ')
    };
    addShariaTeacher(finalForm);
    setShowAddModal(null);
    setTeacherForm({
      name: '',
      nationalId: '',
      phone: '',
      jobGrade: '',
      university: '',
      college: '',
      department: '',
      governorate: 'الجامع الأزهر',
      branches: []
    });
  };

  const handleEditTeacher = (e) => {
    e.preventDefault();
    if (!editingTeacher) return;
    if (editingTeacher.phone && editingTeacher.phone.length !== 11) {
      alert('رقم الهاتف يجب أن يكون مكوناً من 11 رقماً');
      return;
    }
    updateShariaTeacher(editingTeacher.id, editingTeacher);
    setEditingTeacher(null);
  };

  const handleEditCourse = (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    updateShariaCourse(editingCourse.id, {
      ...editingCourse,
      discipline: editingCourse.stage === 'المتقدمة' ? editingCourse.discipline : '—',
      hours: 20
    });
    setEditingCourse(null);
  };

  const handleAddShariaBranch = (e) => {
    e.preventDefault();
    addShariaBranch(shariaBranchForm);
    setShowAddModal(null);
    setShariaBranchForm({ name: '', governorate: 'الجامع الأزهر', code: '', address: '' });
  };

  const handleEditShariaBranch = (e) => {
    e.preventDefault();
    if (!editingShariaBranch) return;
    updateShariaBranch(editingShariaBranch.id, editingShariaBranch);
    setEditingShariaBranch(null);
  };

  const handleEditLive = (e) => {
    e.preventDefault();
    if (!editingLive) return;
    const conflictError = checkLiveConflict(editingLive, editingLive.id);
    if (conflictError) {
      alert(conflictError);
      return;
    }
    updateShariaLive(editingLive.id, editingLive);
    setEditingLive(null);
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();
    addShariaSchedule(scheduleForm);
    setShowAddModal(null);
    setScheduleForm({
      governorate: selectedGov === 'الكل' ? 'الجامع الأزهر' : selectedGov,
      branch: '',
      stage: 'التمهيدية',
      level: 'المستوى الأول',
      discipline: '—',
      day: 'السبت',
      timeStart: '',
      timeEnd: '',
      teacher: '',
      place: '',
      isWeekly: true
    });
  };

  const handleEditSchedule = (e) => {
    e.preventDefault();
    if (!editingSchedule) return;
    updateShariaSchedule(editingSchedule.id, editingSchedule);
    setEditingSchedule(null);
  };

  // --- ACTIONS ---
  const handleDelete = (id, listName) => {
    if (listName === 'admins') deleteManager(id);
    if (listName === 'externalAdmins') deleteManager(id);
    if (listName === 'shariaBranches') deleteShariaBranch(id);
    if (listName === 'schedules') deleteShariaSchedule(id);
    if (listName === 'courses' || listName === 'preparatory' || listName === 'intermediate' || listName === 'advanced') deleteShariaCourse(id);
    if (listName === 'students') deleteShariaStudent(id);
    if (listName === 'exams') {
      if (confirm('هل أنت متأكد من رغبتك في حذف هذا السجل؟')) {
        setExams(exams.filter(x => x.id !== id));
      }
    }
    if (listName === 'results') {
      if (confirm('هل أنت متأكد من رغبتك في حذف هذا السجل؟')) {
        setResults(results.filter(x => x.id !== id));
      }
    }
    if (listName === 'news') {
      if (confirm('هل أنت متأكد من رغبتك في حذف هذا السجل؟')) {
        setNews(news.filter(x => x.id !== id));
      }
    }
    if (listName === 'live') deleteShariaLive(id);
    if (listName === 'teachers') deleteShariaTeacher(id);
  };

  // --- IMPORT / EXPORT EXCEL ---
  const handleImportAdmins = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await importFromXLSX(file);
      const validRows = rows.filter(row => row['الاسم'] && row['الاسم'].toString().trim() !== '');

      if (validRows.length === 0) {
        alert('الملف فارغ أو يحتوي على صفوف فارغة فقط');
        e.target.value = '';
        return;
      }

      const duplicates = [];
      validRows.forEach((row, index) => {
        const natId = (row['الرقم القومي'] || row['الرقم القومى'] || '').toString().trim();
        if (natId) {
          const existsInState = managers.some(m => String(m.national_id).trim() === natId);
          if (existsInState) {
            duplicates.push(`الرقم القومي (${natId}) في الصف ${index + 2} موجود بالفعل في النظام`);
          }
        }
      });

      if (duplicates.length > 0) {
        alert(`فشل الاستيراد لوجود قيم مكررة:\n${duplicates.slice(0, 10).join('\n')}${duplicates.length > 10 ? '\n...وغيرها' : ''}`);
        e.target.value = '';
        return;
      }

      validRows.forEach(row => {
        const natId = (row['الرقم القومي'] || row['الرقم القومى'] || '').toString().trim();
        const recNo = (row['رقم السجل'] || '').toString().trim();
        
        const finalForm = {
          name: row['الاسم'] || '',
          email: row['البريد الإلكتروني'] || row['البريد الالكتروني'] || natId || '',
          phone: row['الهاتف'] || row['رقم الهاتف'] || '',
          national_id: natId,
          specialty: row['التخصص'] || row['التخصص / المسمى'] || 'مدير الإدارة',
          record_no: recNo,
          job_title: row['المسمى الوظيفي'] || row['الوظيفة'] || '',
          workplace: row['جهة العمل'] || '',
          job_grade: row['الدرجة الوظيفية'] || '',
          qualification: row['المؤهل'] || '',
          decision_no: row['رقم القرار'] || '',
          admin: 'الجامع الأزهر',
          address: row['العنوان'] || '',
          status: row['الحالة'] || 'نشط',
          username: natId,
          password: recNo || natId
        };
        addManager(finalForm);

        let userRole = 'rowaq_member';
        if (finalForm.specialty === 'مدير الإدارة') userRole = 'rowaq_manager';
        else if (finalForm.specialty === 'العضو التقني') userRole = 'rowaq_tech';
        
        const adminUser = {
          name: finalForm.name,
          email: finalForm.national_id,
          username: finalForm.national_id,
          national_id: finalForm.national_id,
          password: finalForm.record_no || finalForm.national_id,
          record_number: finalForm.record_no || finalForm.national_id,
          phone: finalForm.phone || '',
          role: userRole,
          userAdmin: finalForm.admin || '',
          created_at: new Date().toLocaleDateString('ar-EG')
        };
        addUser(adminUser);
      });
      alert('تم استيراد أعضاء الإدارة بنجاح وتوليد حساباتهم');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في استيراد الملف');
    }
    e.target.value = '';
  };

  const handleImportTeachers = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await importFromXLSX(file);
      const validRows = rows.filter(row => row['الاسم'] && row['الاسم'].toString().trim() !== '');

      if (validRows.length === 0) {
        alert('الملف فارغ أو يحتوي على صفوف فارغة فقط');
        e.target.value = '';
        return;
      }

      const duplicates = [];
      validRows.forEach((row, index) => {
        const natId = (row['الرقم القومي'] || row['الرقم القومى'] || '').toString().trim();
        if (natId) {
          const existsInState = teachers.some(t => String(t.nationalId).trim() === natId);
          if (existsInState) {
            duplicates.push(`الرقم القومي (${natId}) في الصف ${index + 2} موجود بالفعل في النظام`);
          }
        }
      });

      if (duplicates.length > 0) {
        alert(`فشل الاستيراد لوجود قيم مكررة:\n${duplicates.slice(0, 10).join('\n')}${duplicates.length > 10 ? '\n...وغيرها' : ''}`);
        e.target.value = '';
        return;
      }

      const newTeachers = [];
      validRows.forEach(row => {
        const natId = (row['الرقم القومي'] || row['الرقم القومى'] || '').toString().trim();
        
        let gov = (row['المحافظة'] || '').toString().trim();
        const branchesVal = (row['الفروع'] || row['الفرع'] || '').toString().trim();
        
        // If governorate is empty or 'الكل'/'جميع المحافظات', try to extract from branch name
        if (!gov || gov === 'الكل' || gov === 'جميع المحافظات') {
          const matchedGov = GOVERNORATES.find(g => branchesVal.includes(g));
          if (matchedGov) {
            gov = matchedGov;
          }
        }
        
        if (!gov) {
          gov = selectedGov === 'الكل' ? 'الجامع الأزهر' : selectedGov;
        }

        const finalForm = {
          name: row['الاسم'] || '',
          nationalId: natId,
          phone: row['الهاتف'] || row['رقم الهاتف'] || '',
          jobGrade: row['الدرجة الوظيفية'] || '',
          university: row['الجامعة'] || '',
          college: row['الكلية'] || '',
          department: row['القسم'] || '',
          governorate: gov,
          branch: branchesVal
        };
        newTeachers.push(finalForm);
      });
      await bulkImportShariaTeachers(newTeachers);
      alert('تم استيراد المحاضرين بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في استيراد الملف');
    }
    e.target.value = '';
  };

  const handleImportStudents = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await importFromXLSX(file);
      const validRows = rows.filter(row => row['الاسم'] && row['الاسم'].toString().trim() !== '');

      if (validRows.length === 0) {
        alert('الملف فارغ أو يحتوي على صفوف فارغة فقط');
        e.target.value = '';
        return;
      }

      const duplicates = [];
      validRows.forEach((row, index) => {
        const natId = (row['الرقم القومي'] || row['الرقم القومى'] || '').toString().trim();
        if (natId) {
          const existsInState = students.some(s => String(s.nationalId).trim() === natId);
          if (existsInState) {
            duplicates.push(`الرقم القومي (${natId}) في الصف ${index + 2} موجود بالفعل في النظام`);
          }
        }
      });

      if (duplicates.length > 0) {
        alert(`فشل الاستيراد لوجود قيم مكررة:\n${duplicates.slice(0, 10).join('\n')}${duplicates.length > 10 ? '\n...وغيرها' : ''}`);
        e.target.value = '';
        return;
      }

      const newStudents = [];
      validRows.forEach(row => {
        const natId = (row['الرقم القومي'] || row['الرقم القومى'] || '').toString().trim();
        const govVal = row['المحافظة'] || (selectedGov === 'الكل' ? 'الجامع الأزهر' : selectedGov);
        
        const finalForm = {
          name: row['الاسم'] || '',
          nationalId: natId,
          governorate: govVal,
          branch: row['الفرع'] || '',
          stage: row['المرحلة'] || 'التمهيدية',
          level: row['المستوى'] || 'المستوى الأول',
          discipline: row['التخصص'] || '—',
          fiqhSchool: row['المذهب الفقهي'] || row['المذهب'] || 'شافعي',
          gender: row['الجنس'] || row['النوع'] || 'ذكر',
          studyType: row['نوع الدراسة'] || 'مباشر',
          code: row['الكود'] || row['كود الطالب'] || '',
          seatNumber: row['رقم الجلوس'] || '',
          phone: row['الهاتف'] || row['رقم الهاتف'] || ''
        };
        newStudents.push(finalForm);
      });
      await bulkImportShariaStudents(newStudents);
      alert('تم استيراد الدارسين بنجاح وتوليد حساباتهم');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في استيراد الملف');
    }
    e.target.value = '';
  };

  const handleExportAdmins = () => {
    let exportData = admins.map(a => ({
      'الاسم': a.name || '',
      'الرقم القومي': a.national_id || '',
      'رقم السجل': a.record_no || '',
      'التخصص / المسمى': a.specialty || '',
      'الهاتف': a.phone || '',
      'الوظيفة': a.job_title || '',
      'جهة العمل': a.workplace || '',
      'الحالة': a.status || 'نشط'
    }));

    if (exportData.length === 0) {
      exportData = [{
        'الاسم': '',
        'الرقم القومي': '',
        'رقم السجل': '',
        'التخصص / المسمى': '',
        'الهاتف': '',
        'الوظيفة': '',
        'جهة العمل': '',
        'الحالة': ''
      }];
    }

    const helperData = [
      ...targetSpecialties.map(spec => ({ 'التخصص المعتمد': spec, 'حالة الحساب المعتمدة': 'نشط' })),
      { 'التخصص المعتمد': '', 'حالة الحساب المعتمدة': 'غير نشط' }
    ];

    exportMultiSheetToXLSX([
      { data: exportData, sheetName: 'الإدارة العليا' },
      { data: helperData, sheetName: 'المصطلحات المعتمدة' }
    ], 'الإدارة_العليا_العلوم_الشرعية');
  };

  const handleExportTeachers = () => {
    let exportData = getFilteredTeachers().map(t => ({
      'الاسم': t.name || '',
      'الرقم القومي': t.nationalId || '',
      'الهاتف': t.phone || '',
      'الدرجة الوظيفية': t.jobGrade || '',
      'الجامعة': t.university || '',
      'الكلية': t.college || '',
      'القسم': t.department || '',
      'المحافظة': t.governorate || '',
      'الفروع': t.branch || ''
    }));

    if (exportData.length === 0) {
      exportData = [{
        'الاسم': '',
        'الرقم القومي': '',
        'الهاتف': '',
        'الدرجة الوظيفية': '',
        'الجامعة': '',
        'الكلية': '',
        'القسم': '',
        'المحافظة': '',
        'الفروع': ''
      }];
    }

    const helperData = GOVERNORATES.map(gov => ({
      'المحافظة المعتمدة': gov
    }));

    exportMultiSheetToXLSX([
      { data: exportData, sheetName: 'أعضاء هيئة التدريس' },
      { data: helperData, sheetName: 'المحافظات المعتمدة' }
    ], 'أعضاء_هيئة_التدريس_العلوم_الشرعية');
  };

  const handleExportStudents = () => {
    let exportData = getFilteredStudents().map(s => ({
      'الاسم': s.name || '',
      'الرقم القومي': s.nationalId || '',
      'المحافظة': s.governorate || '',
      'الفرع': s.branch || '',
      'المرحلة': s.stage || '',
      'المستوى': s.level || '',
      'التخصص': s.discipline || '',
      'المذهب الفقهي': s.fiqhSchool || '',
      'الجنس': s.gender || '',
      'نوع الدراسة': s.studyType || '',
      'الكود': s.code || '',
      'رقم الجلوس': s.seatNumber || '',
      'الهاتف': s.phone || ''
    }));

    if (exportData.length === 0) {
      exportData = [{
        'الاسم': '',
        'الرقم القومي': '',
        'المحافظة': '',
        'الفرع': '',
        'المرحلة': '',
        'المستوى': '',
        'التخصص': '',
        'المذهب الفقهي': '',
        'الجنس': '',
        'نوع الدراسة': '',
        'الكود': '',
        'رقم الجلوس': '',
        'الهاتف': ''
      }];
    }

    const maxLen = Math.max(GOVERNORATES.length, 6);
    const helperData = [];
    for (let i = 0; i < maxLen; i++) {
      helperData.push({
        'المحافظة المعتمدة': GOVERNORATES[i] || '',
        'المرحلة المعتمدة': ['التمهيدية', 'المتوسطة', 'المتقدمة'][i] || '',
        'المستوى المعتمد': ['المستوى الأول', 'المستوى الثاني', 'المستوى الثالث', 'المستوى الرابع'][i] || '',
        'التخصص المعتمد': ['فقه وأصوله', 'تفسير وحديث', 'عقيدة', 'لغة عربية', 'عامة', '—'][i] || '',
        'المذهب المعتمد': ['شافعي', 'حنفي', 'مالكي', 'حنبلي'][i] || '',
        'الجنس المعتمد': ['ذكر', 'أنثى'][i] || '',
        'نوع الدراسة المعتمد': ['مباشر', 'عن بعد'][i] || ''
      });
    }

    exportMultiSheetToXLSX([
      { data: exportData, sheetName: 'الدارسين' },
      { data: helperData, sheetName: 'المصطلحات المعتمدة' }
    ], 'الدارسين_العلوم_الشرعية');
  };

  const handleImportCourses = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await importFromXLSX(file);
      const validRows = rows.filter(row => row['اسم المقرر'] || row['اسم المادة']);

      if (validRows.length === 0) {
        alert('الملف فارغ أو يحتوي على صفوف فارغة فقط');
        e.target.value = '';
        return;
      }

      validRows.forEach(row => {
        const stageVal = row['المرحلة'] || 'التمهيدية';
        const disciplineVal = stageVal === 'المتقدمة' ? getDisciplineKey(row['التخصص'] || 'fiqh') : '—';
        
        const formattedCourse = {
          stage: stageVal,
          level: row['المستوى'] || 'المستوى الأول',
          discipline: disciplineVal,
          name: row['اسم المقرر'] || row['اسم المادة'] || '',
          teacher: row['المحاضر'] || row['المعلم'] || '',
          studentsCount: Number(row['عدد الطلاب']) || 0,
          hours: Number(row['الساعات المعبرة']) || Number(row['الساعات']) || 20
        };
        addShariaCourse(formattedCourse);
      });
      alert('تم استيراد المقررات الدراسية بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في استيراد الملف');
    }
    e.target.value = '';
  };

  const handleExportCourses = () => {
    let exportData = courses.map(c => ({
      'المرحلة': c.stage || '',
      'المستوى': c.level || '',
      'التخصص': c.discipline || '',
      'اسم المقرر': c.name || '',
      'المحاضر': c.teacher || '',
      'عدد الطلاب': c.studentsCount || 0,
      'الساعات': c.hours || 20
    }));

    if (exportData.length === 0) {
      exportData = [{
        'المرحلة': '',
        'المستوى': '',
        'التخصص': '',
        'اسم المقرر': '',
        'المحاضر': '',
        'عدد الطلاب': 0,
        'الساعات': 20
      }];
    }

    const maxLen = Math.max(GOVERNORATES.length, 6);
    const helperData = [];
    for (let i = 0; i < maxLen; i++) {
      helperData.push({
        'المرحلة المعتمدة': ['التمهيدية', 'المتوسطة', 'المتقدمة'][i] || '',
        'المستوى المعتمد': ['المستوى الأول', 'المستوى الثاني', 'المستوى الثالث', 'المستوى الرابع'][i] || '',
        'التخصص المعتمد': ['فقه وأصوله', 'تفسير وحديث', 'عقيدة', 'لغة عربية', 'عامة', '—'][i] || ''
      });
    }

    exportMultiSheetToXLSX([
      { data: exportData, sheetName: 'المقررات والمواد' },
      { data: helperData, sheetName: 'المصطلحات المعتمدة' }
    ], 'المقررات_الدراسية_العلوم_الشرعية');
  };

  const handleImportLive = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await importFromXLSX(file);
      const validRows = rows.filter(row => row['عنوان البث'] || row['اسم المادة']);

      if (validRows.length === 0) {
        alert('الملف فارغ أو يحتوي على صفوف فارغة فقط');
        e.target.value = '';
        return;
      }

      let importedCount = 0;
      let conflictCount = 0;

      validRows.forEach(row => {
        const stageVal = row['المرحلة'] || 'التمهيدية';
        const disciplineVal = stageVal === 'المتقدمة' ? getDisciplineKey(row['التخصص'] || 'fiqh') : '—';
        
        const liveItem = {
          title: row['عنوان البث'] || row['اسم المادة'] || '',
          governorate: row['المحافظة'] || 'الجامع الأزهر',
          stage: stageVal,
          level: row['المستوى'] || 'المستوى الأول',
          discipline: disciplineVal,
          teacher: row['المحاضر'] || '',
          day: row['اليوم'] || 'الأحد',
          timeStart: row['وقت البدء'] || '',
          timeEnd: row['وقت الانتهاء'] || '',
          link: row['رابط البث'] || row['رابط Zoom'] || '',
          isWeekly: row['يتجدد أسبوعياً'] === 'نعم' || row['يتجدد اسبوعيا'] === 'نعم' || true,
          status: row['حالة البث'] || 'مجدول'
        };

        const conflict = checkLiveConflict(liveItem);
        if (conflict) {
          conflictCount++;
        } else {
          addShariaLive(liveItem);
          importedCount++;
        }
      });

      if (conflictCount > 0) {
        alert(`تم استيراد ${importedCount} محاضرة بنجاح. وتم تخطي ${conflictCount} محاضرة لوجود تعارض في مواعيد المحاضر أو الصف الدراسي.`);
      } else {
        alert('تم استيراد محاضرات البث المباشر بنجاح');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في استيراد الملف');
    }
    e.target.value = '';
  };

  const handleExportLive = () => {
    const filteredLive = getFilteredLiveLectures();
    let exportData = filteredLive.map(l => ({
      'عنوان البث': l.title || '',
      'المحافظة': l.governorate || '',
      'المرحلة': l.stage || '',
      'المستوى': l.level || '',
      'التخصص': l.discipline || '',
      'المحاضر': l.teacher || '',
      'اليوم': l.day || '',
      'وقت البدء': l.timeStart || '',
      'وقت الانتهاء': l.timeEnd || '',
      'رابط البث': l.link || '',
      'يتجدد أسبوعياً': l.isWeekly ? 'نعم' : 'لا',
      'حالة البث': l.status || 'مجدول'
    }));

    if (exportData.length === 0) {
      exportData = [{
        'عنوان البث': '',
        'المحافظة': '',
        'المرحلة': '',
        'المستوى': '',
        'التخصص': '',
        'المحاضر': '',
        'اليوم': '',
        'وقت البدء': '',
        'وقت الانتهاء': '',
        'رابط البث': '',
        'يتجدد أسبوعياً': '',
        'حالة البث': ''
      }];
    }

    const maxLen = Math.max(GOVERNORATES.length, 7);
    const helperData = [];
    for (let i = 0; i < maxLen; i++) {
      helperData.push({
        'المحافظة المعتمدة': GOVERNORATES[i] || '',
        'المرحلة المعتمدة': ['التمهيدية', 'المتوسطة', 'المتقدمة'][i] || '',
        'المستوى المعتمد': ['المستوى الأول', 'المستوى الثاني', 'المستوى الثالث', 'المستوى الرابع'][i] || '',
        'التخصص المعتمد': ['فقه وأصوله', 'تفسير وحديث', 'عقيدة', 'لغة عربية', 'عامة', '—'][i] || '',
        'اليوم المعتمد': ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'][i] || '',
        'يتجدد أسبوعياً المعتمد': ['نعم', 'لا'][i] || '',
        'حالة البث المعتمدة': ['بث مباشر الآن', 'مجدول', 'منتهي'][i] || ''
      });
    }

    exportMultiSheetToXLSX([
      { data: exportData, sheetName: 'البث المباشر والمحاضرات' },
      { data: helperData, sheetName: 'المصطلحات المعتمدة' }
    ], 'البث_المباشر_العلوم_الشرعية');
  };

  // --- FILTERED DATA FOR ACTIVE GOVERNORATE ---
  const getFilteredStudents = () => {
    return students.filter(s => 
      (selectedGov === 'الكل' || s.governorate === selectedGov) &&
      (selectedBranch === 'الكل' || s.branch === selectedBranch) &&
      (s.name.includes(searchTerm) || s.nationalId.includes(searchTerm) || (s.code && s.code.includes(searchTerm)))
    );
  };

  const getFilteredTeachers = () => {
    return teachers.filter(t => {
      // 1. Governorate match
      let matchGov = false;
      if (selectedGov === 'الكل') {
        matchGov = true;
      } else {
        const teacherGov = t.governorate || '';
        const teacherBranchStr = t.branch || '';
        const teacherBranches = Array.isArray(t.branches) ? t.branches : (teacherBranchStr ? teacherBranchStr.split(/,|،/).map(b => b.trim()) : []);
        
        // Check if any of the branches or the branch string itself contains the selected governorate name
        const branchContainsGov = teacherBranches.some(bName => bName.includes(selectedGov)) || teacherBranchStr.includes(selectedGov);
        
        matchGov = (teacherGov === selectedGov) || 
                   (teacherGov === 'جميع المحافظات' && !teacherBranchStr) || 
                   (teacherGov === 'الكل' && !teacherBranchStr) || 
                   branchContainsGov;
      }

      // 2. Branch match
      const matchBranch = selectedBranch === 'الكل' || 
                          (t.branch && t.branch.split(/,|،/).map(b => b.trim()).includes(selectedBranch)) ||
                          (Array.isArray(t.branches) && t.branches.includes(selectedBranch));

      // 3. Search term match
      const matchSearch = t.name.includes(searchTerm) || 
                          t.department.includes(searchTerm) || 
                          t.university.includes(searchTerm);

      return matchGov && matchBranch && matchSearch;
    });
  };

  const getFilteredLiveLectures = () => {
    let filtered = liveLectures;
    if (isShariaStudent && loggedInStudent) {
      filtered = filtered.filter(l => {
        const matchGov = l.governorate === loggedInStudent.governorate || l.governorate === 'جميع المحافظات';
        const lectureStage = l.stage || '';
        const hasStage = lectureStage.includes(loggedInStudent.stage);
        
        const lectureLevel = l.level || '';
        const hasLevel = lectureLevel.includes(loggedInStudent.level) || 
                         (loggedInStudent.level === 'المستوى الأول' && (lectureLevel.includes('الأول') || lectureLevel.includes('اول'))) ||
                         (loggedInStudent.level === 'المستوى الثاني' && (lectureLevel.includes('الثاني') || lectureLevel.includes('ثاني'))) ||
                         (loggedInStudent.level === 'المستوى الثالث' && (lectureLevel.includes('الثالث') || lectureLevel.includes('ثالث'))) ||
                         (loggedInStudent.level === 'المستوى الرابع' && (lectureLevel.includes('الرابع') || lectureLevel.includes('رابع')));

        const matchDiscipline = loggedInStudent.stage !== 'المتقدمة' || 
                                !l.discipline || 
                                l.discipline === '—' || 
                                getDisciplineKey(l.discipline) === getDisciplineKey(loggedInStudent.discipline);

        return matchGov && hasStage && hasLevel && matchDiscipline;
      });
    } else if (isShariaTeacher) {
      filtered = filtered.filter(l => 
        currentUser?.name && normalizeArabic(l.teacher) === normalizeArabic(currentUser.name)
      );
      if (selectedLiveStage !== 'الكل') {
        filtered = filtered.filter(l => l.stage === selectedLiveStage);
        if (selectedLiveStage === 'المتقدمة' && selectedLiveDiscipline !== 'الكل') {
          filtered = filtered.filter(l => getDisciplineKey(l.discipline) === selectedLiveDiscipline);
        }
      }
      if (selectedLiveLevel !== 'الكل') {
        filtered = filtered.filter(l => l.level === selectedLiveLevel);
      }
    } else {
      filtered = filtered.filter(l => 
        (selectedGov === 'الكل' || l.governorate === selectedGov || l.governorate === 'جميع المحافظات')
      );
      if (selectedLiveStage !== 'الكل') {
        filtered = filtered.filter(l => l.stage === selectedLiveStage);
        if (selectedLiveStage === 'المتقدمة' && selectedLiveDiscipline !== 'الكل') {
          filtered = filtered.filter(l => getDisciplineKey(l.discipline) === selectedLiveDiscipline);
        }
      }
      if (selectedLiveLevel !== 'الكل') {
        filtered = filtered.filter(l => l.level === selectedLiveLevel);
      }
    }
    if (showOnlyActiveLives) {
      filtered = filtered.filter(isLectureActiveNow);
    }
    return filtered;
  };

  const getFilteredResults = () => {
    if (isShariaStudent && loggedInStudent) {
      return results.filter(r => 
        String(r.studentName || '').trim() === String(loggedInStudent.name || '').trim()
      );
    }
    return results.filter(r => 
      (selectedGov === 'الكل' || r.governorate === selectedGov) &&
      (selectedBranch === 'الكل' || r.branch === selectedBranch)
    );
  };

  const getFilteredExams = () => {
    if (isShariaStudent && loggedInStudent) {
      return exams.filter(e => {
        const examLevel = e.level || '';
        const hasStage = examLevel.includes(loggedInStudent.stage);
        const hasLevel = examLevel.includes(loggedInStudent.level) || 
                         (loggedInStudent.level === 'المستوى الأول' && (examLevel.includes('الأول') || examLevel.includes('اول'))) ||
                         (loggedInStudent.level === 'المستوى الثاني' && (examLevel.includes('الثاني') || examLevel.includes('ثاني'))) ||
                         (loggedInStudent.level === 'المستوى الثالث' && (examLevel.includes('الثالث') || examLevel.includes('ثالث'))) ||
                         (loggedInStudent.level === 'المستوى الرابع' && (examLevel.includes('الرابع') || examLevel.includes('رابع')));
        return hasStage && hasLevel;
      });
    }
    return exams;
  };

  // --- COUNTING HELPER ---
  const getTotalStudents = () => getFilteredStudents().length;
  const getTotalTeachers = () => {
    const teachers = new Set(courses.map(c => c.teacher));
    return teachers.size;
  };
  const getTotalCourses = () => courses.length;

  const isLectureActiveNow = (l) => {
    if (l.status === 'بث مباشر الآن') return true;
    const dayNamesMap = {
      0: 'الأحد', 1: 'الإثنين', 2: 'الثلاثاء', 3: 'الأربعاء', 4: 'الخميس', 5: 'الجمعة', 6: 'السبت'
    };
    const currentDayName = dayNamesMap[new Date().getDay()];
    const cleanDay = (d) => String(d || '').replace('أ', 'ا').replace('إ', 'ا');
    
    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const isTodayWorkday = cleanDay(l.day) === cleanDay(currentDayName);
    if (!isTodayWorkday) return false;
    if (!l.timeStart || !l.timeEnd) return false;
    
    const startMin = timeToMinutes(l.timeStart);
    const endMin = timeToMinutes(l.timeEnd);
    return currentMinutes >= startMin && currentMinutes <= endMin;
  };

  const getActiveLiveCount = () => {
    return getFilteredLiveLectures().filter(isLectureActiveNow).length;
  };

  const dynamicStats = isShariaStudent
    ? [
        { id: 4, title: 'البثوث بالموقع المختار', value: getFilteredLiveLectures().length, iconColor: '#3b82f6', iconType: 'book-open', tab: 'live' }
      ]
    : [
        { id: 3, title: 'الدارسين بالموقع المختار', value: getTotalStudents(), iconColor: '#f97316', iconType: 'users', tab: 'students' },
        { id: 5, title: 'أعضاء هيئة التدريس بالموقع', value: getFilteredTeachers().length, iconColor: '#f59e0b', iconType: 'users', tab: 'teachers' },
        { id: 4, title: 'البثوث بالموقع المختار', value: getFilteredLiveLectures().length, iconColor: '#3b82f6', iconType: 'book-open', tab: 'live' }
      ];

  const allSectionGridItems = [
    { key: 'admins', name: 'الادارة العليا الادمن', desc: 'إدارة مدراء الرواق ومستشاري المواد وصلاحياتهم العلمية والإدارية.', icon: Shield, color: '#a855f7' },
    { key: 'externalAdmins', name: 'مسؤولو الادارات الخارجية', desc: 'متابعة مسؤولي الأروقة الخارجية ومنسقي المحافظات وعدد فروعهم.', icon: MapPin, color: '#3b82f6' },
    { key: 'teachers', name: 'أعضاء هيئة التدريس', desc: 'إدارة وتتبع المحاضرين والأساتذة، وتحديث درجاتهم الوظيفية وجامعاتهم وأقسامهم التخصصية.', icon: Users, color: '#f59e0b' },
    { key: 'courses', name: 'المقررات والمواد الدراسية', desc: 'عرض وإدارة المقررات والمواد الدراسية والتحكم في إضافة المواد حسب المرحلة والمستوى الدراسي.', icon: BookOpen, color: '#10b981' },
    { key: 'shariaBranches', name: 'فروع العلوم الشرعية', desc: 'عرض وإدارة فروع قطاع العلوم الشرعية والعربية بمختلف المحافظات.', icon: Layers, color: '#eab308' },
    { key: 'students', name: 'قسم الدارسين', desc: 'متابعة شؤون الطلاب المسجلين بالمحافظة ومستوياتهم ونسب حضورهم وجداولهم.', icon: Users, color: '#ec4899' },
    { key: 'live', name: 'قسم البث المباشر والمحاضرات', desc: 'جدولة البثوث التفاعلية ومواعيد المحاضرات الاونلاين الخاصة بطلاب المحافظة.', icon: Radio, color: '#ef4444' },
    { key: 'schedules', name: 'جدول المحاضرات الحضورية', desc: 'جدولة وإدارة المحاضرات الأسبوعية الحضورية وتوزيعها بالفروع والمحافظات.', icon: Calendar, color: '#6366f1' },
    { key: 'exams', name: 'قسم الاختبارات والامتحانات', desc: 'تنظيم وجدولة الامتحانات، وتصميم أوراق الاختبارات الفترية والنهائية.', icon: FileText, color: '#14b8a6' },
    { key: 'results', name: 'قسم النتائج والتقديرات', desc: 'إصدار نتائج المحافظة وعرض درجات الدارسين ونسب النجاح والرسوب.', icon: Award, color: '#06b6d4' },
  ];

  if (isShariaStudent) {
    allSectionGridItems.push({
      key: 'registerAttendance',
      name: 'تسجيل حضور المحاضرات',
      desc: 'تسجيل وإثبات حضورك للمحاضرات التفاعلية بعد انتهائها.',
      icon: Check,
      color: '#10b981'
    });
  }

  const sectionGridItems = isShariaStudent
    ? allSectionGridItems.filter(item => !['admins', 'externalAdmins', 'students', 'teachers'].includes(item.key))
    : isShariaTeacher
    ? allSectionGridItems.filter(item => !['admins', 'externalAdmins', 'students', 'teachers', 'shariaBranches'].includes(item.key))
    : allSectionGridItems;

  return (
    <div className="dashboard-page" style={{ direction: 'rtl', padding: '10px 0' }}>
      
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-sidebar) 0%, var(--bg-card) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <div>
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'inline-block',
            marginBottom: '12px'
          }}>
            بوابة التعليم الأزهري التخصصي المعتمد
          </span>
          <h1 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '10px', fontWeight: 'bold' }}>
            بوابة العلوم الشرعية والعربية بالجامع الأزهر
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', maxWidth: '750px', margin: 0 }}>
            لوحة الإشراف المتخصصة لقطاع العلوم الشرعية والعربية. تتيح لك هذه المنصة التفاعلية إدارة الهيكل التنظيمي للمحافظات، والتحكم ببرامج تمهيدي، متوسط، ومتقدم، وتتبع الدارسين، وجدولة الامتحانات، وإعلان النتائج، وإطلاق المحاضرات المباشرة.
          </p>
        </div>
        
        <div style={{
          background: 'rgba(214, 175, 55, 0.05)',
          border: '1px solid rgba(214, 175, 55, 0.2)',
          borderRadius: '12px',
          padding: '16px 24px',
          textAlign: 'center'
        }}>
          <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>حالة الفصل الدراسي الحالي</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>دفعة يونيو 2026</div>
          <div style={{ color: '#10b981', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
            <span className="pulse-indicator" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            نشط وتفاعلي
          </div>
        </div>
      </div>

      {/* Governorate Filter Panel (Important: Students, live stream times, and tables are governorate specific) */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(214, 175, 55, 0.15)',
        borderRadius: '12px',
        padding: '16px 24px',
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '15px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(214, 175, 55, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)'
          }}>
            <MapPin size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 'bold' }}>تصفية الموقع (الجامع الأزهر والمحافظات)</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>تتغير جداول الدارسين والامتحانات والبث المباشر وأوقات المحاضرات حسب الموقع المختار</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          {isShariaStudent ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>الموقع النشط حالياً:</span>
              <span style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'rgba(214, 175, 55, 0.08)',
                color: 'var(--accent-gold)',
                fontSize: '13px',
                fontWeight: 'bold',
                minWidth: '220px',
                textAlign: 'center'
              }}>
                {selectedGov} (محدد تلقائياً)
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>الموقع النشط حالياً:</span>
              <select
                value={selectedGov}
                onChange={(e) => {
                  setSelectedGov(e.target.value);
                  setSelectedBranch('الكل');
                }}
                disabled={isGovOfficial}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: isGovOfficial ? 'not-allowed' : 'pointer',
                  opacity: isGovOfficial ? 0.7 : 1,
                  outline: 'none',
                  minWidth: '220px'
                }}
              >
                {isGovOfficial ? (
                  <option value={userAdminGov}>{userAdminGov}</option>
                ) : (
                  <>
                    <option value="الكل">الكل (جميع المحافظات والجامع الأزهر)</option>
                    <option value="جميع المحافظات">جميع المحافظات</option>
                    {GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </>
                )}
              </select>
              {isGovOfficial && (
                <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                  (محدد تلقائياً لمحافظتك)
                </span>
              )}
            </div>
          )}

          {selectedGov !== 'الكل' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>الفرع:</span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '220px'
                }}
              >
                <option value="الكل">الكل (جميع فروع المحافظة)</option>
                {shariaBranches.filter(b => b.governorate === selectedGov).map(b => (
                  <option key={b.id || b._id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '25px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <button 
          onClick={() => { setActiveTab('overview'); setSearchTerm(''); setShowOnlyActiveLives(false); }}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            border: activeTab === 'overview' ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
            backgroundColor: activeTab === 'overview' ? 'rgba(214, 175, 55, 0.15)' : 'var(--bg-card)',
            color: activeTab === 'overview' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s'
          }}
        >
          الرئيسية
        </button>
        {sectionGridItems.map(item => (
          <button 
            key={item.key}
            onClick={() => { setActiveTab(item.key); setSearchTerm(''); setShowOnlyActiveLives(false); }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              border: activeTab === item.key ? `1px solid ${item.color}` : '1px solid var(--border-subtle)',
              backgroundColor: activeTab === item.key ? `${item.color}15` : 'var(--bg-card)',
              color: activeTab === item.key ? item.color : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 0. TAB: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div>
          {isShariaStudent && (
            <div style={{
              background: 'linear-gradient(135deg, var(--bg-sidebar) 0%, rgba(99, 102, 241, 0.1) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '25px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
            }}>
              <h3 style={{ fontSize: '16px', color: '#818cf8', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} />
                مسؤولو الدعم والتواصل بمحافظة ({selectedGov}) للعلوم الشرعية والعربية
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '15px' }}>
                في حال مواجهة أي مشكلة في الدراسة أو التسجيل أو الحلقات، يرجى التواصل مع مسؤولي المحافظة المعتمدين:
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {/* Administrative Member */}
                <div style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    padding: '10px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Shield size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>العضو الإداري للعلوم الشرعية والعربية</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '2px' }}>
                      {adminMember ? adminMember.name : 'جاري التعيين...'}
                    </div>
                    {adminMember?.phone && (
                      <div style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 'bold', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>الهاتف:</span>
                        <a href={`tel:${adminMember.phone}`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>{adminMember.phone}</a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scientific Member */}
                <div style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    padding: '10px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>العضو العلمي للعلوم الشرعية والعربية</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '2px' }}>
                      {scientificMember ? scientificMember.name : 'جاري التعيين...'}
                    </div>
                    {scientificMember?.phone && (
                      <div style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 'bold', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>الهاتف:</span>
                        <a href={`tel:${scientificMember.phone}`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>{scientificMember.phone}</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Real-time active lectures card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(214,175,55,0.08), rgba(239,68,68,0.08))',
            border: '1px solid rgba(214, 175, 55, 0.25)',
            borderRadius: '16px',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '25px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                padding: '14px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <Video size={26} />
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px #ef4444'
                }} className="pulse-indicator"></span>
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--text-primary)', fontWeight: 'bold' }}>المحاضرات الجارية حالياً في الوقت الفعلي</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>تحديث تلقائي مستند إلى أوقات البث وجداول المحاضرات المسجلة</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', fontFamily: 'inherit' }}>{getActiveLiveCount()}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '6px' }}>محاضرة نشطة الآن</span>
              </div>
              <button 
                onClick={() => { setActiveTab('live'); setShowOnlyActiveLives(true); }}
                className="btn btn-primary" 
                style={{ 
                  backgroundColor: '#ef4444',
                  border: 'none',
                  color: 'white',
                  textDecoration: 'none', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13px',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.2)'
                }}
              >
                متابعة المحاضرات الجارية
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {dynamicStats.map(stat => (
              <div 
                key={stat.id}
                onClick={() => { setActiveTab(stat.tab); setShowOnlyActiveLives(false); }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = stat.iconColor}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{stat.title}</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stat.value}</div>
                </div>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: `${stat.iconColor}15`,
                  color: stat.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {stat.id === 1 && <BookOpen size={22} />}
                  {stat.id === 2 && <GraduationCap size={22} />}
                  {stat.id === 3 && <Users size={22} />}
                  {stat.id === 4 && <Radio size={22} />}
                </div>
              </div>
            ))}
          </div>

          {/* Section Selection Cards Grid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
              أقسام لوحة التحكم بالعلوم الشرعية والعربية
            </h2>
            <div style={{
              background: 'rgba(214, 175, 55, 0.1)',
              color: 'var(--accent-gold)',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              الموقع النشط: {selectedGov === 'الكل' ? 'الكل (جميع المواقع)' : selectedGov}
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {sectionGridItems.map(item => {
              const IconComp = item.icon;
              return (
                <div 
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = item.color;
                    e.currentTarget.style.boxShadow = `0 10px 20px ${item.color}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: `${item.color}12`,
                      color: item.color
                    }}>
                      <IconComp size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '8px' }}>
                        {item.name}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TAB: ADMINS (الادارة العليا) */}
      {/* ========================================================================= */}
      {activeTab === 'admins' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="#a855f7" />
              أعضاء الإدارة العليا ومستشاري المواد (الادمن)
            </h2>
            {!isShariaStudent && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => importAdminsRef.current.click()}
                  style={{
                    backgroundColor: 'rgba(214, 175, 55, 0.1)',
                    border: '1px solid rgba(214, 175, 55, 0.3)',
                    color: 'var(--accent-gold)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px'
                  }}
                >
                  <Upload size={16} />
                  استيراد
                </button>
                <input ref={importAdminsRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleImportAdmins} />
                
                <button 
                  onClick={handleExportAdmins}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px'
                  }}
                >
                  <Download size={16} />
                  تصدير
                </button>
              </div>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الاسم</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الرقم القومي</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>رقم السجل</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>التخصص / المسمى</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>رقم الهاتف</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>جهة العمل / الوظيفة</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '14px 10px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{admin.name}</td>
                    <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{admin.national_id || '—'}</td>
                    <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{admin.record_no || '—'}</td>
                    <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{admin.specialty || '—'}</td>
                    <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{admin.phone}</td>
                    <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{(admin.job_title || '—') + ' / ' + (admin.workplace || '—')}</td>
                    <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>{admin.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: EXTERNAL ADMINS (مسؤولي الإدارات الخارجية) */}
      {/* ========================================================================= */}
      {activeTab === 'externalAdmins' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="#3b82f6" />
              مسؤولو الإدارات الخارجية ومنسقو أروقة المحافظات
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الاسم</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الرقم القومي</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>رقم السجل</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>التخصص / المسمى</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>رقم الهاتف</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الموقع / المحافظة</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>جهة العمل / الوظيفة</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {externalAdmins.filter(ea => selectedGov === 'الكل' || ea.governorate === selectedGov).map(admin => (
                  <tr key={admin.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '14px 10px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{admin.name}</td>
                    <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{admin.national_id || '—'}</td>
                    <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{admin.record_no || '—'}</td>
                    <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{admin.specialty || '—'}</td>
                    <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{admin.phone}</td>
                    <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} color="#3b82f6" />
                        {admin.governorate}
                      </span>
                    </td>
                    <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{(admin.job_title || '—') + ' / ' + (admin.workplace || '—')}</td>
                    <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>{admin.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: TEACHERS (أعضاء هيئة التدريس) */}
      {/* ========================================================================= */}
      {activeTab === 'teachers' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#f59e0b" />
                أعضاء هيئة التدريس والمحاضرين لـ [ {selectedGov === 'الكل' ? 'جميع المواقع والجامع الأزهر' : selectedGov} ]
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>تصفية أعضاء هيئة التدريس وبياناتهم الأكاديمية والوظيفية حسب الموقع الجغرافي النشط</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="بحث بالاسم، القسم، أو الجامعة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '8px 36px 8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    width: '200px'
                  }}
                />
                <Search size={14} color="var(--text-secondary)" style={{ position: 'absolute', right: '12px', top: '11px' }} />
              </div>
              
              {!isShariaStudent && (
                <>
                  <button 
                    onClick={() => importTeachersRef.current.click()}
                    style={{
                      backgroundColor: 'rgba(214, 175, 55, 0.1)',
                      border: '1px solid rgba(214, 175, 55, 0.3)',
                      color: 'var(--accent-gold)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px'
                    }}
                  >
                    <Upload size={16} />
                    استيراد
                  </button>
                  <input ref={importTeachersRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleImportTeachers} />
                </>
              )}

              <button 
                onClick={handleExportTeachers}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px'
                }}
              >
                <Download size={16} />
                تصدير
              </button>

              {!isShariaStudent && (
                <button 
                  onClick={() => {
                    setTeacherForm({ ...teacherForm, governorate: selectedGov === 'الكل' ? 'الجامع الأزهر' : selectedGov });
                    setShowAddModal('teacher');
                  }}
                  style={{
                    backgroundColor: '#f59e0b',
                    border: 'none',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px'
                  }}
                >
                  <Plus size={16} />
                  تسجيل عضو هيئة تدريس جديد
                </button>
              )}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الاسم (المحاضر)</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الرقم القومي</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>رقم الهاتف</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الإدارة (الموقع)</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الدرجة الوظيفية</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الجامعة</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الكلية</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>القسم</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredTeachers().length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                      لا يوجد أعضاء هيئة تدريس مسجلين في {selectedGov === 'الكل' ? 'أي موقع' : selectedGov} حالياً.
                    </td>
                  </tr>
                ) : (
                  getFilteredTeachers().map(teacher => (
                    <tr key={teacher.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '14px 10px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{teacher.name}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{teacher.nationalId}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{teacher.phone}</td>
                       <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {teacher.governorate} {((Array.isArray(teacher.branches) && teacher.branches.length > 0) || teacher.branch) && (
                          <span style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>
                            ({Array.isArray(teacher.branches) ? teacher.branches.join('، ') : teacher.branch})
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{teacher.jobGrade}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{teacher.university}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{teacher.college || '—'}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{teacher.department}</td>
                      <td style={{ padding: '14px 10px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                        <button 
                          onClick={() => setEditingTeacher(teacher)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', padding: '4px' }}
                          title="تعديل"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(teacher.id, 'teachers')}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                          title="حذف"
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: COURSES & SUBJECTS (المقررات والمواد الدراسية) */}
      {/* ========================================================================= */}
      {activeTab === 'courses' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="#10b981" />
                المقررات والمواد الدراسية للعلوم الشرعية والعربية
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>قم باختيار المستوى الدراسي لتصفية المواد الدراسية أو إضافة مادة جديدة له</p>
            </div>
            
            {!isShariaStudent && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => importCoursesRef.current.click()}
                  style={{
                    backgroundColor: 'rgba(214, 175, 55, 0.1)',
                    border: '1px solid rgba(214, 175, 55, 0.3)',
                    color: 'var(--accent-gold)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px'
                  }}
                >
                  <Upload size={16} />
                  استيراد
                </button>
                <input ref={importCoursesRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleImportCourses} />
                
                <button 
                  onClick={handleExportCourses}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px'
                  }}
                >
                  <Download size={16} />
                  تصدير
                </button>
              </div>
            )}
          </div>

          {/* Level Selector Widget */}
          <div style={{
            background: 'var(--bg-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '25px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {isShariaStudent ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                  مرحلتك ومستواك الدراسي الحالي: <strong style={{ color: 'var(--accent-gold)' }}>
                    المرحلة {selectedCourseStage} {selectedCourseStage === 'المتقدمة' && `(${[
                      { id: 'fiqh', name: 'فقه وأصوله' },
                      { id: 'tafsir', name: 'تفسير وحديث' },
                      { id: 'aqeedah', name: 'عقيدة' },
                      { id: 'arabic', name: 'لغة عربية' },
                      { id: 'general', name: 'عامة' }
                    ].find(d => d.id === selectedCourseDiscipline)?.name})`} - {selectedCourseLevel}
                  </strong>
                </div>
                <div style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  تم تصفية المقررات تلقائياً لمرحلتك
                </div>
              </div>
            ) : (
              <>
                {/* Stage Selector Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)', minWidth: '100px' }}>المرحلة الدراسية:</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'التمهيدية', label: 'المرحلة التمهيدية' },
                      { key: 'المتوسطة', label: 'المرحلة المتوسطة' },
                      { key: 'المتقدمة', label: 'المرحلة المتقدمة' }
                    ].map(stage => (
                      <button
                        key={stage.key}
                        onClick={() => {
                          setSelectedCourseStage(stage.key);
                          // Reset level if moving to prep/intermediate from level 3/4
                          if ((stage.key === 'التمهيدية' || stage.key === 'المتوسطة') && 
                              (selectedCourseLevel === 'المستوى الثالث' || selectedCourseLevel === 'المستوى الرابع')) {
                            setSelectedCourseLevel('المستوى الأول');
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: selectedCourseStage === stage.key ? 'var(--accent-gold)' : 'var(--border-subtle)',
                          backgroundColor: selectedCourseStage === stage.key ? 'rgba(214, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          color: selectedCourseStage === stage.key ? 'var(--accent-gold)' : 'var(--text-secondary)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '13px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {stage.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specialization/Discipline Row - Only visible for Advanced Stage */}
                {selectedCourseStage === 'المتقدمة' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', borderTop: '1px dashed var(--border-subtle)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)', minWidth: '100px' }}>التخصص الدراسي:</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'fiqh', name: 'فقه وأصوله' },
                        { id: 'tafsir', name: 'تفسير وحديث' },
                        { id: 'aqeedah', name: 'عقيدة' },
                        { id: 'arabic', name: 'لغة عربية' },
                        { id: 'general', name: 'عامة' }
                      ].map(disc => (
                        <button
                          key={disc.id}
                          onClick={() => setSelectedCourseDiscipline(disc.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: selectedCourseDiscipline === disc.id ? '#f97316' : 'var(--border-subtle)',
                            backgroundColor: selectedCourseDiscipline === disc.id ? 'rgba(249, 115, 22, 0.12)' : 'transparent',
                            color: selectedCourseDiscipline === disc.id ? '#f97316' : 'var(--text-secondary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '12px',
                            transition: 'all 0.2s'
                          }}
                        >
                          {disc.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Level Selector Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', borderTop: '1px dashed var(--border-subtle)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)', minWidth: '100px' }}>المستوى الدراسي:</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(selectedCourseStage === 'المتقدمة'
                      ? ['المستوى الأول', 'المستوى الثاني', 'المستوى الثالث', 'المستوى الرابع']
                      : ['المستوى الأول', 'المستوى الثاني']
                    ).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setSelectedCourseLevel(lvl)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: selectedCourseLevel === lvl ? 'var(--accent-gold)' : 'var(--border-subtle)',
                          backgroundColor: selectedCourseLevel === lvl ? 'rgba(214, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          color: selectedCourseLevel === lvl ? 'var(--accent-gold)' : 'var(--text-secondary)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '13px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Level Summary and Action Button */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '15px',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '16px',
                  marginTop: '4px'
                }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                    المستوى المحدد حالياً: <strong style={{ color: 'var(--accent-gold)' }}>
                      المرحلة {selectedCourseStage} {selectedCourseStage === 'المتقدمة' && `(${[
                        { id: 'fiqh', name: 'فقه وأصوله' },
                        { id: 'tafsir', name: 'تفسير وحديث' },
                        { id: 'aqeedah', name: 'عقيدة' },
                        { id: 'arabic', name: 'لغة عربية' },
                        { id: 'general', name: 'عامة' }
                      ].find(d => d.id === selectedCourseDiscipline)?.name})`} - {selectedCourseLevel}
                    </strong>
                  </div>
                  
                  {!isShariaStudent && (
                    <button
                      onClick={() => {
                        setCourseForm({
                          stage: selectedCourseStage,
                          level: selectedCourseLevel,
                          discipline: selectedCourseStage === 'المتقدمة' ? selectedCourseDiscipline : 'fiqh',
                          name: '',
                          teacher: '',
                          hours: 20
                        });
                        setShowAddModal('course');
                      }}
                      style={{
                        backgroundColor: '#10b981',
                        border: 'none',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#059669'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#10b981'; }}
                    >
                      <Plus size={18} />
                      إضافة مادة جديدة للمستوى المحدد
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Courses List */}
          <div>
            <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '16px' }}>
              المقررات الدراسية المتاحة:
            </h3>
            
            {(() => {
              const filteredList = courses.filter(c => 
                c.stage === selectedCourseStage &&
                c.level === selectedCourseLevel &&
                (selectedCourseStage !== 'المتقدمة' || c.discipline === selectedCourseDiscipline)
              );

              if (filteredList.length === 0) {
                return (
                  <div style={{
                    background: 'var(--bg-main)',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '40px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '14px'
                  }}>
                    لا توجد مواد دراسية مضافة لهذا المستوى بعد. اضغط على "إضافة مادة جديدة للمستوى المحدد" للبدء.
                  </div>
                );
              }

              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  {filteredList.map(course => (
                    <div
                      key={course.id}
                      style={{
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '20px',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-gold)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      {!isShariaStudent && (
                        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setEditingCourse(course)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--accent-gold)',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="تعديل المادة"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(course.id, 'courses')}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="حذف المادة"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {course.stage}
                        </span>
                        <span style={{
                          backgroundColor: 'rgba(214, 175, 55, 0.1)',
                          color: 'var(--accent-gold)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {course.level}
                        </span>
                      </div>

                      <h4 style={{
                        fontSize: '15px',
                        color: 'var(--text-primary)',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        maxWidth: '85%',
                        lineHeight: '1.5'
                      }}>
                        {course.name}
                      </h4>

                      {course.pdfs && course.pdfs.length > 0 && (
                        <div style={{
                          marginTop: '12px',
                          marginBottom: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          borderTop: '1px dashed var(--border-subtle)',
                          paddingTop: '10px'
                        }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>المقررات والملفات الدراسية:</span>
                          {course.pdfs.map((pdf, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = pdf.data;
                                link.download = pdf.name;
                                link.click();
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '6px',
                                padding: '6px 10px',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                fontSize: '12px',
                                textAlign: 'right',
                                width: '100%',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                            >
                              <Download size={14} style={{ color: 'var(--accent-gold)' }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                {pdf.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}



                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '12px',
                        color: 'var(--text-muted)'
                      }}>
                        {course.hours > 0 ? (
                          <span>الساعات المعتمدة: <strong>{course.hours} ساعة</strong></span>
                        ) : (
                          <span>مقرر دراسي معتمد</span>
                        )}
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>{course.studentsCount} دارس مسجل</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: SHARIA_BRANCHES (فروع العلوم الشرعية) */}
      {/* ========================================================================= */}
      {activeTab === 'shariaBranches' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} color="#eab308" />
                فروع دراسة العلوم الشرعية والعربية لـ [ {selectedGov === 'الكل' ? 'جميع الإدارات والمواقع' : selectedGov} ]
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>إدارة وتتبع مقرات وفروع الدراسة الشرعية المعتمدة وتفاصيلها الجغرافية.</p>
            </div>
            {!isShariaStudent && (
              <button 
                onClick={() => {
                  setShariaBranchForm({ name: '', governorate: selectedGov === 'الكل' ? 'الجامع الأزهر' : selectedGov, code: '', address: '' });
                  setShowAddModal('shariaBranch');
                }}
                className="btn btn-primary" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                <Plus size={16} />
                إضافة فرع دراسي جديد
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>رمز الفرع</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>اسم الفرع الشرعي</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الموقع / المحافظة</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>العنوان تفصيلياً</th>
                  {!isShariaStudent && <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>إجراءات</th>}
                </tr>
              </thead>
              <tbody>
                {shariaBranches.filter(b => selectedGov === 'الكل' || b.governorate === selectedGov).length === 0 ? (
                  <tr>
                    <td colSpan={isShariaStudent ? 4 : 5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                      لا توجد فروع علوم شرعية مسجلة حالياً في {selectedGov === 'الكل' ? 'أي موقع' : selectedGov}.
                    </td>
                  </tr>
                ) : (
                  shariaBranches.filter(b => selectedGov === 'الكل' || b.governorate === selectedGov).map(branch => (
                    <tr key={branch.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: '#10b981', fontWeight: 'bold' }}>{branch.code || '—'}</td>
                      <td style={{ padding: '14px 10px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{branch.name}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{branch.governorate}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-muted)' }}>{branch.address || '—'}</td>
                      {!isShariaStudent && (
                        <td style={{ padding: '14px 10px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                          <button 
                            onClick={() => setEditingShariaBranch(branch)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', padding: '4px' }}
                            title="تعديل"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(branch.id, 'shariaBranches')}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            title="حذف"
                          >
                            <Trash size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB: STUDENTS (قسم الدارسين) */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#ec4899" />
                سجلات وجداول حضور الدارسين لـ [ {selectedGov === 'الكل' ? 'جميع المواقع والجامع الأزهر' : selectedGov} ]
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>يتم تصفية الدارسين وجداول حضورهم ونوع دراستهم (مباشر / عن بعد) حسب الموقع الجغرافي النشط</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="بحث بالاسم، الرقم القومي، أو الكود..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '8px 36px 8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    width: '200px'
                  }}
                />
                <Search size={14} color="var(--text-secondary)" style={{ position: 'absolute', right: '12px', top: '11px' }} />
              </div>
              
              {!isShariaStudent && (
                <>
                  <button 
                    onClick={() => importStudentsRef.current.click()}
                    style={{
                      backgroundColor: 'rgba(214, 175, 55, 0.1)',
                      border: '1px solid rgba(214, 175, 55, 0.3)',
                      color: 'var(--accent-gold)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px'
                    }}
                  >
                    <Upload size={16} />
                    استيراد
                  </button>
                  <input ref={importStudentsRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleImportStudents} />
                </>
              )}

              <button 
                onClick={handleExportStudents}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px'
                }}
              >
                <Download size={16} />
                تصدير
              </button>

              {!isShariaStudent && (
                <button 
                  onClick={() => {
                    setStudentForm({ ...studentForm, governorate: selectedGov === 'الكل' ? 'الجامع الأزهر' : selectedGov });
                    setShowAddModal('student');
                  }}
                  style={{
                    backgroundColor: '#ec4899',
                    border: 'none',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px'
                  }}
                >
                  <Plus size={16} />
                  تسجيل دارس جديد
                </button>
              )}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الاسم</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>كود الطالب</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>رقم الجلوس</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الرقم القومي</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الإدارة (الموقع)</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>النوع</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>نوع الدراسة</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>المرحلة</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>المستوى</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>التخصص</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>المذهب الفقهي</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>المحاضرات المحضورة</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredStudents().length === 0 ? (
                  <tr>
                    <td colSpan="13" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                      لا يوجد دارسين مسجلين في {selectedGov === 'الكل' ? 'أي موقع' : selectedGov} حالياً.
                    </td>
                  </tr>
                ) : (
                  getFilteredStudents().map(student => (
                    <tr key={student.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '14px 10px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{student.name}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: '#10b981', fontWeight: 'bold' }}>{student.code || '—'}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{student.seatNumber || '—'}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{student.nationalId}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {student.governorate} {student.branch && <span style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>({student.branch})</span>}
                      </td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{student.gender}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px' }}>
                        <span style={{
                          background: student.studyType === 'مباشر' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                          color: student.studyType === 'مباشر' ? '#10b981' : '#3b82f6',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>{student.studyType}</span>
                      </td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{student.stage}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{student.level}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{student.discipline}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px' }}>
                        <span style={{
                          background: 'rgba(214, 175, 55, 0.1)',
                          color: 'var(--accent-gold)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>{student.fiqhSchool}</span>
                      </td>
                      <td style={{ padding: '14px 10px', fontSize: '14px', fontWeight: 'bold', color: '#10b981', textAlign: 'center' }}>
                        <div>{shariaAttendance.filter(att => String(att.studentId) === String(student.id)).length} محاضرات</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal', marginTop: '4px' }}>
                          (بث: {
                            lectureAccessLogs
                              .filter(log => log.studentId === student.id)
                              .reduce((total, log) => total + (log.durationMinutes || 0), 0)
                          } دقيقة)
                        </div>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                        <button 
                          onClick={() => setEditingStudent(student)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', padding: '4px' }}
                          title="تعديل"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id, 'students')}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                          title="حذف"
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB: EXAMS (قسم الاختبارات والامتحانات) */}
      {/* ========================================================================= */}
      {activeTab === 'exams' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="#14b8a6" />
              قسم الاختبارات وجدول الامتحانات المعتمدة (عالمي وثابت)
            </h2>
            {!isShariaStudent && (
              <button 
                onClick={() => setShowAddModal('exam')}
                style={{
                  backgroundColor: '#14b8a6',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px'
                }}
              >
                <Plus size={16} />
                جدولة امتحان جديد
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>اسم الاختبار</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>المستوى المستهدف</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>تاريخ الاختبار</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>مدة الامتحان</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>عدد الأسئلة</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>الحالة</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredExams().length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                      لا توجد امتحانات مجدولة لمستواك الدراسي حالياً.
                    </td>
                  </tr>
                ) : (
                  getFilteredExams().map(exam => (
                    <tr key={exam.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '14px 10px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{exam.name}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{exam.level}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{exam.date}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{exam.duration}</td>
                      <td style={{ padding: '14px 10px', textAlign: 'center', fontSize: '13px', color: 'var(--text-primary)' }}>{exam.totalQuestions} سؤال</td>
                      <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                        <span style={{
                          background: exam.status === 'نشط' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(214, 175, 55, 0.15)',
                          color: exam.status === 'نشط' ? '#10b981' : 'var(--accent-gold)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>{exam.status}</span>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                        {!isShariaStudent && (
                          <button 
                            onClick={() => handleDelete(exam.id, 'exams')}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            title="حذف"
                          >
                            <Trash size={16} />
                          </button>
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

      {/* ========================================================================= */}
      {/* 8. TAB: RESULTS (قسم النتائج) */}
      {/* ========================================================================= */}
      {activeTab === 'results' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#06b6d4" />
                قسم نتائج وتقديرات دارسي [ {selectedGov === 'الكل' ? 'جميع المواقع والجامع الأزهر' : selectedGov} ]
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>تصفية درجات الطلاب ورصد أرقام الجلوس والرموز بناء على الموقع المختار بالفلتر</p>
            </div>
            {!isShariaStudent && (
              <button 
                onClick={() => {
                  setResultForm({ ...resultForm, governorate: selectedGov === 'الكل' ? 'الجامع الأزهر' : selectedGov });
                  setShowAddModal('result');
                }}
                style={{
                  backgroundColor: '#06b6d4',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px'
                }}
              >
                <Plus size={16} />
                إدخال تقدير جديد
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>اسم الدارس</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>الموقع / المحافظة</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>اسم الامتحان والمقرر</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>الدرجة</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>التقدير العام</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>حالة النجاح</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredResults().length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                      لا توجد نتائج مسجلة لطلاب {selectedGov === 'الكل' ? 'أي موقع' : selectedGov} حالياً.
                    </td>
                  </tr>
                ) : (
                  getFilteredResults().map(res => (
                    <tr key={res.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '14px 10px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{res.studentName}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                        {res.governorate} {res.branch && <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>({res.branch})</span>}
                      </td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>{res.examName}</td>
                      <td style={{ padding: '14px 10px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{res.score} / 100</td>
                      <td style={{ padding: '14px 10px', textAlign: 'center', fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{res.grade}</td>
                      <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>{res.status}</span>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                        {!isShariaStudent && (
                          <button 
                            onClick={() => handleDelete(res.id, 'results')}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            title="حذف"
                          >
                            <Trash size={16} />
                          </button>
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

      {/* ========================================================================= */}
      {/* 9. TAB: NEWS (قسم الأخبار والإعلانات) */}
      {/* ========================================================================= */}
      {activeTab === 'news' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Newspaper size={20} color="#84cc16" />
              أحدث الأخبار والإعلانات لدارسي العلوم الشرعية (عامة لجميع الفروع)
            </h2>
            {!isShariaStudent && (
              <button 
                onClick={() => setShowAddModal('news')}
                style={{
                  backgroundColor: '#84cc16',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px'
                }}
              >
                <Plus size={16} />
                نشر خبر أو إعلان
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {news.map(n => (
              <div 
                key={n.id} 
                style={{ 
                  background: 'var(--bg-main)', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: '10px', 
                  padding: '20px', 
                  position: 'relative' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{
                    background: 'rgba(132, 204, 22, 0.15)',
                    color: '#84cc16',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>{n.category}</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{n.date}</span>
                    {!isShariaStudent && (
                      <button 
                        onClick={() => handleDelete(n.id, 'news')}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '8px' }}>{n.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. TAB: LIVE STREAMS (قسم البث المباشر) */}
      {/* ========================================================================= */}
      {activeTab === 'live' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={20} color="#ef4444" />
                البث المباشر والمحاضرات الرقمية لـ [ {selectedGov === 'الكل' ? 'جميع المواقع والجامع الأزهر' : selectedGov} ]
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>تتغير جداول ومواعيد المحاضرات الأونلاين للدارسين عن بعد من محافظة لأخرى ومن محافظة للجامع الأزهر</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowOnlyActiveLives(!showOnlyActiveLives)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: showOnlyActiveLives ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                  backgroundColor: showOnlyActiveLives ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-main)',
                  color: showOnlyActiveLives ? '#ef4444' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <span className={showOnlyActiveLives ? 'pulse-indicator' : ''} style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  display: 'inline-block'
                }}></span>
                {showOnlyActiveLives ? 'عرض جميع المحاضرات' : 'المحاضرات الجارية الآن فقط'}
              </button>

              {!isShariaStudent && !isShariaTeacher && (
                <>
                  <button 
                    onClick={() => importLiveRef.current.click()}
                    style={{
                      backgroundColor: 'rgba(214, 175, 55, 0.1)',
                      border: '1px solid rgba(214, 175, 55, 0.3)',
                      color: 'var(--accent-gold)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px'
                    }}
                  >
                    <Upload size={16} />
                    استيراد
                  </button>
                  <input ref={importLiveRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleImportLive} />
                </>
              )}

              <button 
                onClick={handleExportLive}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px'
                }}
              >
                <Download size={16} />
                تصدير
              </button>

              {!isShariaStudent && !isShariaTeacher && (
                <button 
                  onClick={() => {
                    setLiveForm({ ...liveForm, governorate: selectedGov === 'الكل' ? 'الجامع الأزهر' : selectedGov });
                    setShowAddModal('live');
                  }}
                  style={{
                    backgroundColor: '#ef4444',
                    border: 'none',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px'
                  }}
                >
                  <Plus size={16} />
                  جدولة بث مباشر
                </button>
              )}
            </div>
          </div>

          {/* Filters for Stage and Level */}
          {!isShariaStudent && (
            <div style={{
              display: 'flex',
              gap: '15px',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-main)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>تصفية المحاضرات:</span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>المحافظة:</label>
                <select
                  value={selectedGov}
                  onChange={(e) => {
                    setSelectedGov(e.target.value);
                    setSelectedBranch('الكل');
                  }}
                  disabled={isGovOfficial}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    cursor: isGovOfficial ? 'not-allowed' : 'pointer',
                    outline: 'none'
                  }}
                >
                  {isGovOfficial ? (
                    <option value={userAdminGov}>{userAdminGov}</option>
                  ) : (
                    <>
                      <option value="الكل">كل المحافظات</option>
                      {GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>المرحلة:</label>
                <select
                  value={selectedLiveStage}
                  onChange={(e) => {
                    setSelectedLiveStage(e.target.value);
                    if (e.target.value !== 'المتقدمة') {
                      setSelectedLiveDiscipline('الكل');
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="الكل">كل المراحل</option>
                  <option value="التمهيدية">التمهيدية</option>
                  <option value="المتوسطة">المتوسطة</option>
                  <option value="المتقدمة">المتقدمة</option>
                </select>
              </div>

              {selectedLiveStage === 'المتقدمة' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>التخصص:</label>
                  <select
                    value={selectedLiveDiscipline}
                    onChange={(e) => setSelectedLiveDiscipline(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="الكل">كل التخصصات</option>
                    <option value="fiqh">الفقه وأصوله</option>
                    <option value="tafsir">التفسير والحديث</option>
                    <option value="aqeedah">العقيدة الإسلامية</option>
                    <option value="arabic">اللغة العربية وآدابها</option>
                    <option value="general">عامة</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>المستوى:</label>
                <select
                  value={selectedLiveLevel}
                  onChange={(e) => setSelectedLiveLevel(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="الكل">كل المستويات</option>
                  <option value="المستوى الأول">المستوى الأول</option>
                  <option value="المستوى الثاني">المستوى الثاني</option>
                  <option value="المستوى الثالث">المستوى الثالث</option>
                  <option value="المستوى الرابع">المستوى الرابع</option>
                </select>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {getFilteredLiveLectures().length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                padding: '30px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '14px',
                border: '1px dashed var(--border-subtle)',
                borderRadius: '12px'
              }}>
                لا توجد محاضرات مجدولة أونلاين لـ {selectedGov === 'الكل' ? 'أي موقع' : selectedGov} حالياً.
              </div>
            ) : (
              getFilteredLiveLectures().map(live => {
                const formattedSchedule = live.day 
                  ? `${live.day} (من ${live.timeStart} إلى ${live.timeEnd})` 
                  : live.scheduleTime;

                const isActive = isLectureActiveNow(live);
                const displayStatus = isActive ? 'بث مباشر الآن' : live.status;

                return (
                  <div 
                    key={live.id}
                    style={{
                      background: 'var(--bg-main)',
                      border: isActive ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isActive ? '0 0 15px rgba(239, 68, 68, 0.15)' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', width: '100%' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{
                            backgroundColor: isActive ? '#ef4444' : 'rgba(255,255,255,0.05)',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            {isActive && <span className="pulse-indicator" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'white', display: 'inline-block' }}></span>}
                            {displayStatus}
                          </span>
                          <span style={{
                            backgroundColor: 'rgba(214, 175, 55, 0.1)',
                            color: 'var(--accent-gold)',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            {live.governorate}
                          </span>
                          {live.isWeekly && (
                            <span style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              color: '#10b981',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}>
                              يتجدد أسبوعياً
                            </span>
                          )}
                        </div>
                        {!isShariaStudent && !isShariaTeacher && (
                          <div style={{ display: 'flex', gap: '8px', marginRight: 'auto', alignItems: 'center' }}>
                            <button 
                              onClick={() => setEditingLive(live)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', padding: '4px' }}
                              title="تعديل"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(live.id, 'live')}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                              title="حذف"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '10px', lineHeight: '1.6' }}>{live.title}</h3>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>المحاضر: <strong style={{ color: 'var(--text-primary)' }}>{live.teacher}</strong></div>
                      
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                        <span style={{ fontSize: '11px', backgroundColor: 'var(--border-subtle)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px' }}>
                          المرحلة: {live.stage}
                        </span>
                        <span style={{ fontSize: '11px', backgroundColor: 'var(--border-subtle)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px' }}>
                          المستوى: {live.level || 'الأول'}
                        </span>
                        {live.stage === 'المتقدمة' && live.discipline && live.discipline !== '—' && (
                          <span style={{ fontSize: '11px', backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316', padding: '2px 8px', borderRadius: '4px' }}>
                            التخصص: {live.discipline}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-subtle)'
                    }}>
                      <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{formattedSchedule}</span>
                      <button 
                        onClick={() => {
                          if (isShariaStudent && loggedInStudent && isActive) {
                            addLectureAccessLog({
                              studentId: loggedInStudent.id,
                              lectureId: String(live.id)
                            });
                          }
                          if (live.streamType === 'external') {
                            window.open(live.link, '_blank');
                          } else {
                            setActiveMeeting(live);
                          }
                        }}
                        style={{
                          backgroundColor: isActive ? '#ef4444' : 'var(--border-subtle)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {isActive ? <Play size={12} /> : (live.streamType === 'external' ? <ExternalLink size={12} /> : <Play size={12} />)}
                        دخول المحاضرة
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. TAB: SCHEDULES (جدول المحاضرات الحضورية بالفروع) */}
      {/* ========================================================================= */}
      {activeTab === 'schedules' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color="#6366f1" />
                جدول المحاضرات الحضورية بالفروع لـ [ {selectedGov === 'الكل' ? 'جميع المحافظات' : selectedGov} ] {selectedBranch !== 'الكل' && ` - فرع [ ${selectedBranch} ]`}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>عرض وتخطيط الجداول الدراسية الأسبوعية والمحاضرات الحضورية بالفروع المختلفة</p>
            </div>
            
            {!isShariaStudent && !isShariaTeacher && (
              <button 
                onClick={() => {
                  const firstBranch = shariaBranches.find(b => selectedGov === 'الكل' || b.governorate === selectedGov)?.name || '';
                  setScheduleForm({
                    ...scheduleForm,
                    governorate: selectedGov === 'الكل' ? 'الجامع الأزهر' : selectedGov,
                    branch: firstBranch,
                    stage: 'التمهيدية',
                    level: 'المستوى الأول',
                    discipline: '—',
                    day: 'السبت',
                    timeStart: '14:00',
                    timeEnd: '16:00',
                    teacher: '',
                    place: '',
                    isWeekly: true
                  });
                  setShowAddModal('schedule');
                }}
                style={{
                  backgroundColor: '#6366f1',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px'
                }}
              >
                <Plus size={16} />
                إضافة جدول محاضرة
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 10px', fontSize: '13px' }}>المحافظة / الفرع</th>
                  <th style={{ padding: '12px 10px', fontSize: '13px' }}>المرحلة والمستوى</th>
                  <th style={{ padding: '12px 10px', fontSize: '13px' }}>التخصص</th>
                  <th style={{ padding: '12px 10px', fontSize: '13px' }}>المحاضر</th>
                  <th style={{ padding: '12px 10px', fontSize: '13px' }}>الموعد والتوقيت</th>
                  <th style={{ padding: '12px 10px', fontSize: '13px' }}>مكان المحاضرة</th>
                  <th style={{ padding: '12px 10px', fontSize: '13px', textAlign: 'center' }}>التكرار</th>
                  {!isShariaStudent && !isShariaTeacher && <th style={{ padding: '12px 10px', fontSize: '13px', textAlign: 'center' }}>الإجراءات</th>}
                </tr>
              </thead>
              <tbody>
                {shariaSchedules.filter(s => {
                  const matchGov = selectedGov === 'الكل' || s.governorate === selectedGov;
                  const matchBranch = selectedBranch === 'الكل' || s.branch === selectedBranch;
                  if (!matchGov || !matchBranch) return false;
                  if (isShariaTeacher) {
                    return currentUser?.name && normalizeArabic(s.teacher) === normalizeArabic(currentUser.name);
                  }
                  return true;
                }).length === 0 ? (
                  <tr>
                    <td colSpan={(isShariaStudent || isShariaTeacher) ? 7 : 8} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                      لا توجد محاضرات حضورية مجدولة حالياً.
                    </td>
                  </tr>
                ) : (
                  shariaSchedules.filter(s => {
                    const matchGov = selectedGov === 'الكل' || s.governorate === selectedGov;
                    const matchBranch = selectedBranch === 'الكل' || s.branch === selectedBranch;
                    if (!matchGov || !matchBranch) return false;
                    if (isShariaTeacher) {
                      return currentUser?.name && normalizeArabic(s.teacher) === normalizeArabic(currentUser.name);
                    }
                    return true;
                  }).map(sched => (
                    <tr key={sched.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '14px' }}>{sched.branch}</div>
                        <div style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>{sched.governorate}</div>
                      </td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <div>{sched.stage}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sched.level}</div>
                      </td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-primary)' }}>
                        <div>{sched.stage === 'المتقدمة' && sched.discipline ? getDisciplineKey(sched.discipline) : 'عامة'}</div>
                      </td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {sched.teacher}
                      </td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{sched.day}</span>
                        <div style={{ fontSize: '11px', direction: 'ltr', textAlign: 'right' }}>
                          {sched.timeStart} - {sched.timeEnd}
                        </div>
                      </td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {sched.place || '—'}
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                        {sched.isWeekly ? (
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            يتجدد أسبوعياً
                          </span>
                        ) : (
                          <span style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-muted)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px'
                          }}>
                            مرة واحدة
                          </span>
                        )}
                      </td>
                      {!isShariaStudent && !isShariaTeacher && (
                        <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button 
                              onClick={() => setEditingSchedule(sched)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', padding: '4px' }}
                              title="تعديل"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(sched.id, 'schedules')}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                              title="حذف"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. TAB: REGISTER ATTENDANCE (تسجيل حضور المحاضرات للدارسين) */}
      {/* ========================================================================= */}
      {activeTab === 'registerAttendance' && isShariaStudent && loggedInStudent && (() => {
        const studentCourses = courses.filter(c => 
          c.stage === loggedInStudent.stage && 
          c.level === loggedInStudent.level &&
          (loggedInStudent.stage !== 'المتقدمة' || c.discipline === loggedInStudent.discipline)
        );

        const getArabicDayOfWeek = (dateString) => {
          if (!dateString) return '';
          const [y, m, d] = dateString.split('-').map(Number);
          const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
          const dayIndex = new Date(y, m - 1, d).getDay();
          return days[dayIndex];
        };

        const selectedDay = getArabicDayOfWeek(attForm.date);

        const matchingLives = shariaLiveLectures.filter(live => 
          live.stage === loggedInStudent.stage &&
          live.level === loggedInStudent.level &&
          live.day === selectedDay &&
          (attForm.courseName ? live.title.includes(attForm.courseName) || attForm.courseName.includes(live.title) : true)
        );

        const handleRegisterAttendanceSubmit = (e) => {
          e.preventDefault();
          if (!attForm.courseName) {
            alert('يرجى اختيار المادة الدراسية');
            return;
          }
          if (!attForm.liveId) {
            alert('يرجى اختيار المحاضرة والمحاضر');
            return;
          }

          const selectedLive = shariaLiveLectures.find(l => String(l.id) === String(attForm.liveId));
          if (!selectedLive) {
            alert('المحاضرة المحددة غير موجودة');
            return;
          }

          const hasPressedLink = lectureAccessLogs.some(log => 
            log.studentId === loggedInStudent.id && 
            String(log.lectureId) === String(selectedLive.id)
          );

          if (!hasPressedLink) {
            alert('عذراً، لا يمكنك تسجيل الحضور لأنك لم تقم بالضغط على رابط دخول المحاضرة في وقتها المحدد.');
            return;
          }

          const [y, m, d] = attForm.date.split('-').map(Number);
          const [endHour, endMin] = selectedLive.timeEnd.split(':').map(Number);
          const lectureEndTime = new Date(y, m - 1, d, endHour, endMin, 0);
          const now = new Date();

          if (now < lectureEndTime) {
            alert('عذراً، لا يمكن تسجيل الحضور إلا بعد انتهاء وقت المحاضرة.');
            return;
          }

          const limitTime = new Date(lectureEndTime.getTime() + 24 * 60 * 60 * 1000);
          if (now > limitTime) {
            alert('عذراً، انتهت المهلة المحددة لتسجيل الحضور لهذه المحاضرة (24 ساعة من نهاية المحاضرة).');
            return;
          }

          const alreadyRegistered = shariaAttendance.some(att => 
            att.studentId === loggedInStudent.id && 
            String(att.lectureId) === String(selectedLive.id) &&
            att.date === attForm.date
          );

          if (alreadyRegistered) {
            alert('لقد قمت بتسجيل حضور هذه المحاضرة بالفعل مسبقاً.');
            return;
          }

          addShariaAttendance({
            studentId: loggedInStudent.id,
            studentName: loggedInStudent.name,
            courseName: attForm.courseName,
            lectureId: selectedLive.id,
            lectureTitle: selectedLive.title,
            teacher: selectedLive.teacher,
            date: attForm.date,
            timestamp: new Date().toISOString()
          });

          alert('✅ تم تسجيل حضورك للمحاضرة بنجاح.');
          setAttForm(prev => ({ ...prev, liveId: '' }));
        };

        const myHistory = shariaAttendance.filter(att => att.studentId === loggedInStudent.id);

        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
            
            {/* Form Card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--accent-gold)', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                تسجيل حضور محاضرة اليوم
              </h3>

              <form onSubmit={handleRegisterAttendanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={labelStyle}>المادة / المقرر الدراسي</label>
                  <select 
                    value={attForm.courseName}
                    onChange={(e) => setAttForm({ ...attForm, courseName: e.target.value, liveId: '' })}
                    style={selectStyle}
                    required
                  >
                    <option value="">-- اختر المادة --</option>
                    {studentCourses.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>التاريخ</label>
                  <input 
                    type="date"
                    value={attForm.date}
                    onChange={(e) => setAttForm({ ...attForm, date: e.target.value, liveId: '' })}
                    style={inputStyle}
                    required
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    يوافق يوم: <strong style={{ color: 'var(--accent-gold)' }}>{selectedDay || '—'}</strong>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>المحاضرة والمحاضر المجدول</label>
                  <select 
                    value={attForm.liveId}
                    onChange={(e) => setAttForm({ ...attForm, liveId: e.target.value })}
                    style={selectStyle}
                    required
                    disabled={!attForm.courseName}
                  >
                    <option value="">-- اختر المحاضرة المجدولة --</option>
                    {matchingLives.map(live => (
                      <option key={live.id} value={live.id}>
                        {live.teacher} - {live.title} ({live.timeStart} - {live.timeEnd})
                      </option>
                    ))}
                  </select>
                  {attForm.courseName && matchingLives.length === 0 && (
                    <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '5px' }}>
                      لا توجد محاضرات مجدولة أونلاين لهذا المقرر في يوم {selectedDay}.
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    marginTop: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Check size={16} />
                  تسجيل الحضور
                </button>
              </form>
            </div>

            {/* History Card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                سجل حضورك المعتمد
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '10px 5px', color: 'var(--text-secondary)' }}>المادة</th>
                      <th style={{ padding: '10px 5px', color: 'var(--text-secondary)' }}>المحاضر</th>
                      <th style={{ padding: '10px 5px', color: 'var(--text-secondary)' }}>التاريخ</th>
                      <th style={{ padding: '10px 5px', color: 'var(--text-secondary)', textAlign: 'center' }}>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myHistory.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          لم تقم بتسجيل حضور أي محاضرات بعد.
                        </td>
                      </tr>
                    ) : (
                      myHistory.map(h => (
                        <tr key={h.id} style={{ borderBottom: '1px dotted var(--border-subtle)' }}>
                          <td style={{ padding: '10px 5px', color: 'var(--text-primary)' }}>{h.courseName}</td>
                          <td style={{ padding: '10px 5px', color: 'var(--text-secondary)' }}>{h.teacher}</td>
                          <td style={{ padding: '10px 5px', color: 'var(--text-muted)' }}>{h.date}</td>
                          <td style={{ padding: '10px 5px', textAlign: 'center' }}>
                            <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                              حاضر
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* --- ALL POPUP MODALS / FORM VIEWS --- */}
      {/* ========================================================================= */}

      {/* Modal 3: Add Course */}
      {showAddModal === 'course' && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 'bold' }}>إضافة مقرر دراسي جديد ({courseForm.stage})</h2>
              <button onClick={() => setShowAddModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddCourse}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                
                {/* Stage Selection */}
                <div>
                  <label style={labelStyle}>المرحلة الدراسية</label>
                  <select 
                    value={courseForm.stage} 
                    onChange={(e) => {
                      const stageVal = e.target.value;
                      setCourseForm({ 
                        ...courseForm, 
                        stage: stageVal,
                        level: (stageVal !== 'المتقدمة' && (courseForm.level === 'المستوى الثالث' || courseForm.level === 'المستوى الرابع')) 
                          ? 'المستوى الأول' 
                          : courseForm.level,
                        discipline: stageVal === 'المتقدمة' ? 'fiqh' : '—'
                      });
                    }} 
                    style={selectStyle}
                  >
                    <option value="التمهيدية">المرحلة التمهيدية</option>
                    <option value="المتوسطة">المرحلة المتوسطة</option>
                    <option value="المتقدمة">المرحلة المتقدمة</option>
                  </select>
                </div>

                {/* Specialization / Discipline Selection - Only for Advanced Stage */}
                {courseForm.stage === 'المتقدمة' && (
                  <div>
                    <label style={labelStyle}>التخصص الدراسي</label>
                    <select 
                      value={courseForm.discipline} 
                      onChange={(e) => setCourseForm({ ...courseForm, discipline: e.target.value })} 
                      style={selectStyle}
                    >
                      <option value="fiqh">فقه وأصوله</option>
                      <option value="tafsir">تفسير وحديث</option>
                      <option value="aqeedah">عقيدة</option>
                      <option value="arabic">لغة عربية</option>
                      <option value="general">عامة</option>
                    </select>
                  </div>
                )}

                {/* Level Selection */}
                <div>
                  <label style={labelStyle}>المستوى الدراسي</label>
                  <select 
                    value={courseForm.level} 
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })} 
                    style={selectStyle}
                  >
                    <option value="المستوى الأول">المستوى الأول</option>
                    <option value="المستوى الثاني">المستوى الثاني</option>
                    {courseForm.stage === 'المتقدمة' && (
                      <>
                        <option value="المستوى الثالث">المستوى الثالث</option>
                        <option value="المستوى الرابع">المستوى الرابع</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Course Name */}
                <div>
                  <label style={labelStyle}>اسم المادة</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="مثال: شرح متن قطر الندى" 
                    value={courseForm.name} 
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} 
                    style={inputStyle} 
                  />
                </div>

                {/* PDF/Files Upload */}
                <div>
                  <label style={labelStyle}>المرفقات (ملفات PDF، صور، ملفات مضغوطة)</label>
                  <input 
                    type="file" 
                    accept=".pdf,image/*,.zip,.rar,.7z" 
                    multiple 
                    onChange={(e) => handleFileChange(e, false)} 
                    style={{ ...inputStyle, padding: '6px 10px' }} 
                  />
                  {courseForm.pdfs && courseForm.pdfs.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {courseForm.pdfs.map((pdf, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '13px'
                        }}>
                          <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                            {pdf.name}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setCourseForm(prev => ({ ...prev, pdfs: prev.pdfs.filter((_, i) => i !== index) }))}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>


                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={() => setShowAddModal(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold' }}>حفظ المادة</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Add Student */}
      {showAddModal === 'student' && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 'bold' }}>تسجيل طالب / دارس جديد بموقع [ {studentForm.governorate} ]</h2>
              <button onClick={() => setShowAddModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddStudent}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>اسم الطالب بالكامل</label>
                    <input type="text" required value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الإدارة (الموقع / المحافظة)</label>
                    <select value={studentForm.governorate} onChange={(e) => setStudentForm({ ...studentForm, governorate: e.target.value, branch: '' })} style={selectStyle} disabled={isGovOfficial}>
                      {GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الفرع التعليمي</label>
                    <select required value={studentForm.branch} onChange={(e) => setStudentForm({ ...studentForm, branch: e.target.value })} style={selectStyle}>
                      <option value="">اختر الفرع...</option>
                      {shariaBranches.filter(b => b.governorate === studentForm.governorate).map(b => (
                        <option key={b.id || b._id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الرقم القومي (14 رقم)</label>
                    <input type="text" required maxLength="14" value={studentForm.nationalId} onChange={(e) => setStudentForm({ ...studentForm, nationalId: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>رقم الجوال</label>
                    <input type="text" required maxLength={11} value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value.replace(/\D/g, '') })} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>النوع</label>
                    <select value={studentForm.gender} onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })} style={selectStyle}>
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>نوع الدراسة</label>
                    <select value={studentForm.studyType} onChange={(e) => setStudentForm({ ...studentForm, studyType: e.target.value })} style={selectStyle}>
                      <option value="مباشر">مباشر (حضوري)</option>
                      <option value="عن بعد">عن بعد (رقمي)</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>المذهب الفقهي</label>
                    <select value={studentForm.fiqhSchool} onChange={(e) => setStudentForm({ ...studentForm, fiqhSchool: e.target.value })} style={selectStyle}>
                      <option value="شافعي">شافعي</option>
                      <option value="مالكي">مالكي</option>
                      <option value="حنفي">حنفي</option>
                      <option value="حنبلي">حنبلي</option>
                    </select>
                  </div>
                </div>

                {studentForm.stage === 'المتقدمة' ? (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>المرحلة</label>
                      <select 
                        value={studentForm.stage} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setStudentForm({
                            ...studentForm,
                            stage: val,
                            discipline: val === 'المتقدمة' ? 'فقه وأصوله' : '—',
                            level: 'المستوى الأول'
                          });
                        }} 
                        style={selectStyle}
                      >
                        <option value="التمهيدية">التمهيدية</option>
                        <option value="المتوسطة">المتوسطة</option>
                        <option value="المتقدمة">المتقدمة</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>التخصص</label>
                      <select 
                        value={studentForm.discipline} 
                        onChange={(e) => setStudentForm({ ...studentForm, discipline: e.target.value })} 
                        style={selectStyle}
                      >
                        <option value="فقه وأصوله">فقه وأصوله</option>
                        <option value="تفسير وحديث">تفسير وحديث</option>
                        <option value="عقيدة">عقيدة</option>
                        <option value="لغة عربية">لغة عربية</option>
                        <option value="عامة">عامة</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>المستوى</label>
                      <select 
                        value={studentForm.level} 
                        onChange={(e) => setStudentForm({ ...studentForm, level: e.target.value })} 
                        style={selectStyle}
                      >
                        <option value="المستوى الأول">المستوى الأول</option>
                        <option value="المستوى الثاني">المستوى الثاني</option>
                        <option value="المستوى الثالث">المستوى الثالث</option>
                        <option value="المستوى الرابع">المستوى الرابع</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>المرحلة</label>
                      <select 
                        value={studentForm.stage} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setStudentForm({
                            ...studentForm,
                            stage: val,
                            discipline: val === 'المتقدمة' ? 'فقه وأصوله' : '—',
                            level: 'المستوى الأول'
                          });
                        }} 
                        style={selectStyle}
                      >
                        <option value="التمهيدية">التمهيدية</option>
                        <option value="المتوسطة">المتوسطة</option>
                        <option value="المتقدمة">المتقدمة</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>المستوى</label>
                      <select 
                        value={studentForm.level} 
                        onChange={(e) => setStudentForm({ ...studentForm, level: e.target.value })} 
                        style={selectStyle}
                      >
                        <option value="المستوى الأول">المستوى الأول</option>
                        <option value="المستوى الثاني">المستوى الثاني</option>
                      </select>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>كود الطالب (اختياري - للضبط مستقبلاً)</label>
                    <input type="text" placeholder="مثال: SH-10045" value={studentForm.code} onChange={(e) => setStudentForm({ ...studentForm, code: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>رقم الجلوس (اختياري - للامتحانات)</label>
                    <input type="text" placeholder="مثال: GL-9014" value={studentForm.seatNumber} onChange={(e) => setStudentForm({ ...studentForm, seatNumber: e.target.value })} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={() => setShowAddModal(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold', backgroundColor: '#ec4899', border: 'none', color: 'white' }}>حفظ بيانات الطالب</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4-Edit: Edit Student */}
      {editingStudent && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 'bold' }}>تعديل بيانات الدارس بموقع [ {editingStudent.governorate} ]</h2>
              <button onClick={() => setEditingStudent(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <form onSubmit={handleEditStudent}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>اسم الطالب بالكامل</label>
                    <input type="text" required value={editingStudent.name} onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الإدارة (الموقع / المحافظة)</label>
                    <select value={editingStudent.governorate} onChange={(e) => setEditingStudent({ ...editingStudent, governorate: e.target.value, branch: '' })} style={selectStyle} disabled={isGovOfficial}>
                      {GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الفرع التعليمي</label>
                    <select required value={editingStudent.branch || ''} onChange={(e) => setEditingStudent({ ...editingStudent, branch: e.target.value })} style={selectStyle}>
                      <option value="">اختر الفرع...</option>
                      {shariaBranches.filter(b => b.governorate === editingStudent.governorate).map(b => (
                        <option key={b.id || b._id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الرقم القومي (14 رقم)</label>
                    <input type="text" required maxLength="14" value={editingStudent.nationalId} onChange={(e) => setEditingStudent({ ...editingStudent, nationalId: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>رقم الجوال</label>
                    <input type="text" required maxLength={11} value={editingStudent.phone || ''} onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value.replace(/\D/g, '') })} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>النوع</label>
                    <select value={editingStudent.gender} onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value })} style={selectStyle}>
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>نوع الدراسة</label>
                    <select value={editingStudent.studyType} onChange={(e) => setEditingStudent({ ...editingStudent, studyType: e.target.value })} style={selectStyle}>
                      <option value="مباشر">مباشر (حضوري)</option>
                      <option value="عن بعد">عن بعد (رقمي)</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>المذهب الفقهي</label>
                    <select value={editingStudent.fiqhSchool} onChange={(e) => setEditingStudent({ ...editingStudent, fiqhSchool: e.target.value })} style={selectStyle}>
                      <option value="شافعي">شافعي</option>
                      <option value="مالكي">مالكي</option>
                      <option value="حنفي">حنفي</option>
                      <option value="حنبلي">حنبلي</option>
                    </select>
                  </div>
                </div>

                {editingStudent.stage === 'المتقدمة' ? (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>المرحلة</label>
                      <select 
                        value={editingStudent.stage} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingStudent({
                            ...editingStudent,
                            stage: val,
                            discipline: val === 'المتقدمة' ? 'فقه وأصوله' : '—',
                            level: 'المستوى الأول'
                          });
                        }} 
                        style={selectStyle}
                      >
                        <option value="التمهيدية">التمهيدية</option>
                        <option value="المتوسطة">المتوسطة</option>
                        <option value="المتقدمة">المتقدمة</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>التخصص</label>
                      <select 
                        value={editingStudent.discipline} 
                        onChange={(e) => setEditingStudent({ ...editingStudent, discipline: e.target.value })} 
                        style={selectStyle}
                      >
                        <option value="فقه وأصوله">فقه وأصوله</option>
                        <option value="تفسير وحديث">تفسير وحديث</option>
                        <option value="عقيدة">عقيدة</option>
                        <option value="لغة عربية">لغة عربية</option>
                        <option value="عامة">عامة</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>المستوى</label>
                      <select 
                        value={editingStudent.level} 
                        onChange={(e) => setEditingStudent({ ...editingStudent, level: e.target.value })} 
                        style={selectStyle}
                      >
                        <option value="المستوى الأول">المستوى الأول</option>
                        <option value="المستوى الثاني">المستوى الثاني</option>
                        <option value="المستوى الثالث">المستوى الثالث</option>
                        <option value="المستوى الرابع">المستوى الرابع</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>المرحلة</label>
                      <select 
                        value={editingStudent.stage} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingStudent({
                            ...editingStudent,
                            stage: val,
                            discipline: val === 'المتقدمة' ? 'فقه وأصوله' : '—',
                            level: 'المستوى الأول'
                          });
                        }} 
                        style={selectStyle}
                      >
                        <option value="التمهيدية">التمهيدية</option>
                        <option value="المتوسطة">المتوسطة</option>
                        <option value="المتقدمة">المتقدمة</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>المستوى</label>
                      <select 
                        value={editingStudent.level} 
                        onChange={(e) => setEditingStudent({ ...editingStudent, level: e.target.value })} 
                        style={selectStyle}
                      >
                        <option value="المستوى الأول">المستوى الأول</option>
                        <option value="المستوى الثاني">المستوى الثاني</option>
                      </select>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>كود الطالب (اختياري)</label>
                    <input type="text" placeholder="مثال: SH-10045" value={editingStudent.code || ''} onChange={(e) => setEditingStudent({ ...editingStudent, code: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>رقم الجلوس (اختياري)</label>
                    <input type="text" placeholder="مثال: GL-9014" value={editingStudent.seatNumber || ''} onChange={(e) => setEditingStudent({ ...editingStudent, seatNumber: e.target.value })} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={() => setEditingStudent(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold', backgroundColor: '#ec4899', border: 'none', color: 'white' }}>حفظ التعديلات</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Add Exam */}
      {showAddModal === 'exam' && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 'bold' }}>جدولة وجدولة امتحان جديد</h2>
              <button onClick={() => setShowAddModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddExam}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <div>
                  <label style={labelStyle}>اسم الاختبار</label>
                  <input type="text" required placeholder="مثال: امتحان مبادئ التفسير" value={examForm.name} onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>المستوى المستهدف</label>
                  <input type="text" required placeholder="مثال: تمهيدية - المستوى الأول" value={examForm.level} onChange={(e) => setExamForm({ ...examForm, level: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>تاريخ الاختبار</label>
                    <input type="date" required value={examForm.date} onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>مدة الامتحان</label>
                    <input type="text" required placeholder="مثال: 90 دقيقة" value={examForm.duration} onChange={(e) => setExamForm({ ...examForm, duration: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>عدد الأسئلة</label>
                    <input type="number" required value={examForm.totalQuestions} onChange={(e) => setExamForm({ ...examForm, totalQuestions: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={() => setShowAddModal(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold', backgroundColor: '#14b8a6', border: 'none', color: 'white' }}>جدولة الامتحان</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Add Result */}
      {showAddModal === 'result' && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 'bold' }}>رصد تقدير ونتيجة دارس</h2>
              <button onClick={() => setShowAddModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddResult}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <div>
                  <label style={labelStyle}>اسم الطالب</label>
                  <input type="text" required placeholder="أدخل اسم الطالب المسجل" value={resultForm.studentName} onChange={(e) => setResultForm({ ...resultForm, studentName: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الموقع / المحافظة للدارس</label>
                    <select value={resultForm.governorate} onChange={(e) => setResultForm({ ...resultForm, governorate: e.target.value })} style={selectStyle}>
                      {GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الدرجة (من 100)</label>
                    <input type="number" required max="100" value={resultForm.score} onChange={(e) => setResultForm({ ...resultForm, score: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>اسم الاختبار والمقرر</label>
                  <input type="text" required placeholder="مثال: امتحان مبادئ الفقه" value={resultForm.examName} onChange={(e) => setResultForm({ ...resultForm, examName: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>التقدير العام</label>
                    <select value={resultForm.grade} onChange={(e) => setResultForm({ ...resultForm, grade: e.target.value })} style={selectStyle}>
                      <option value="ممتاز">ممتاز</option>
                      <option value="جيد جداً">جيد جداً</option>
                      <option value="جيد">جيد</option>
                      <option value="مقبول">مقبول</option>
                      <option value="ضعيف">ضعيف</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>حالة النجاح</label>
                    <select value={resultForm.status} onChange={(e) => setResultForm({ ...resultForm, status: e.target.value })} style={selectStyle}>
                      <option value="ناجح">ناجح</option>
                      <option value="راسب">راسب</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={() => setShowAddModal(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold', backgroundColor: '#06b6d4', border: 'none', color: 'white' }}>رصد وحفظ النتيجة</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 7: Add News */}
      {showAddModal === 'news' && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 'bold' }}>نشر إعلان أو خبر للرواق</h2>
              <button onClick={() => setShowAddModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddNews}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <div>
                  <label style={labelStyle}>عنوان الخبر / الإعلان</label>
                  <input type="text" required placeholder="عنوان جاذب وواضح" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>نوع الإعلان</label>
                  <select value={newsForm.category} onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })} style={selectStyle}>
                    <option value="إعلان عام">إعلان عام</option>
                    <option value="تعديل جدول">تعديل جدول</option>
                    <option value="نتائج امتحانات">نتائج امتحانات</option>
                    <option value="فعالية علمية">فعالية علمية</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>محتوى الخبر بالكامل</label>
                  <textarea required rows="4" value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}></textarea>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={() => setShowAddModal(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold', backgroundColor: '#84cc16', border: 'none', color: 'white' }}>نشر الآن</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 8: Add Live */}
      {showAddModal === 'live' && (() => {
        const getDisciplineKey = (arabicVal) => {
          if (arabicVal === 'فقه وأصوله') return 'fiqh';
          if (arabicVal === 'تفسير وحديث') return 'tafsir';
          if (arabicVal === 'عقيدة') return 'aqeedah';
          if (arabicVal === 'لغة عربية') return 'arabic';
          if (arabicVal === 'عامة') return 'general';
          return arabicVal;
        };

        const filteredCoursesForAddLive = courses.filter(c => 
          c.stage === liveForm.stage && 
          c.level === liveForm.level &&
          (liveForm.stage !== 'المتقدمة' || c.discipline === getDisciplineKey(liveForm.discipline))
        );

        return (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <div style={modalHeaderStyle}>
                <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 'bold' }}>جدولة بث مباشر ومحاضرة رقمية للإدارة</h2>
                <button onClick={() => setShowAddModal(null)} style={closeBtnStyle}><X size={18} /></button>
              </div>
              <form onSubmit={handleAddLive}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                  
                  {/* Administration (Governorate) */}
                  <div>
                    <label style={labelStyle}>الإدارة / المحافظة</label>
                    <select 
                      value={liveForm.governorate} 
                      onChange={(e) => setLiveForm({ ...liveForm, governorate: e.target.value, teacher: '' })} 
                      style={selectStyle}
                      disabled={isGovOfficial}
                    >
                      <option value="جميع المحافظات">جميع المحافظات</option>
                      {GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  {/* Stage & Level & Specialty */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <label style={labelStyle}>المرحلة</label>
                      <select 
                        value={liveForm.stage} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setLiveForm({
                            ...liveForm,
                            stage: val,
                            level: 'المستوى الأول',
                            discipline: val === 'المتقدمة' ? 'فقه وأصوله' : '—',
                            title: ''
                          });
                        }} 
                        style={selectStyle}
                      >
                        <option value="التمهيدية">التمهيدية</option>
                        <option value="المتوسطة">المتوسطة</option>
                        <option value="المتقدمة">المتقدمة</option>
                      </select>
                    </div>

                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <label style={labelStyle}>المستوى</label>
                      <select 
                        value={liveForm.level} 
                        onChange={(e) => setLiveForm({ ...liveForm, level: e.target.value, title: '' })} 
                        style={selectStyle}
                      >
                        <option value="المستوى الأول">المستوى الأول</option>
                        <option value="المستوى الثاني">المستوى الثاني</option>
                        {liveForm.stage === 'المتقدمة' && (
                          <>
                            <option value="المستوى الثالث">المستوى الثالث</option>
                            <option value="المستوى الرابع">المستوى الرابع</option>
                          </>
                        )}
                      </select>
                    </div>

                    {liveForm.stage === 'المتقدمة' && (
                      <div style={{ flex: 1, minWidth: '120px' }}>
                        <label style={labelStyle}>التخصص الدراسي</label>
                        <select 
                          value={liveForm.discipline} 
                          onChange={(e) => setLiveForm({ ...liveForm, discipline: e.target.value, title: '' })} 
                          style={selectStyle}
                        >
                          <option value="فقه وأصوله">فقه وأصوله</option>
                          <option value="تفسير وحديث">تفسير وحديث</option>
                          <option value="عقيدة">عقيدة</option>
                          <option value="لغة عربية">لغة عربية</option>
                          <option value="عامة">عامة</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Title / Subject */}
                  <div>
                    <label style={labelStyle}>المادة المسجلة (عنوان البث)</label>
                    <select 
                      required 
                      value={liveForm.title} 
                      onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })} 
                      style={selectStyle}
                    >
                      {filteredCoursesForAddLive.length === 0 ? (
                        <option value="">لا توجد مواد مسجلة لهذه المرحلة والمستوى حالياً</option>
                      ) : (
                        <>
                          <option value="">اختر المادة...</option>
                          {filteredCoursesForAddLive.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </>
                      )}
                    </select>
                    {filteredCoursesForAddLive.length === 0 && (
                      <span style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px', display: 'block' }}>
                        * يرجى إضافة مادة أولاً لهذا المستوى من تبويب "المقررات والمواد الدراسية".
                      </span>
                    )}
                  </div>

                {/* Lecturer (Teacher) filtered by Governorate */}
                <div>
                  <label style={labelStyle}>المحاضر (من قائمة المحاضرين بالإدارة)</label>
                  <input 
                    type="text" 
                    placeholder="ابحث عن المحاضر بالاسم..." 
                    value={teacherSearchQuery} 
                    onChange={(e) => setTeacherSearchQuery(e.target.value)} 
                    style={{ ...inputStyle, marginBottom: '8px' }} 
                  />
                  <select 
                    required 
                    value={liveForm.teacher} 
                    onChange={(e) => setLiveForm({ ...liveForm, teacher: e.target.value })} 
                    style={selectStyle}
                  >
                    {teachers.filter(t => 
                      (liveForm.governorate === 'جميع المحافظات' || t.governorate === liveForm.governorate) &&
                      (!teacherSearchQuery || t.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()))
                    ).length === 0 ? (
                      <option value="">لا يوجد محاضرين يطابقون البحث في هذه الإدارة حالياً</option>
                    ) : (
                      <>
                        <option value="">اختر الأستاذ المحاضر...</option>
                        {teachers.filter(t => 
                          (liveForm.governorate === 'جميع المحافظات' || t.governorate === liveForm.governorate) &&
                          (!teacherSearchQuery || t.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()))
                        ).map(t => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </>
                    )}
                  </select>
                  {teachers.filter(t => liveForm.governorate === 'جميع المحافظات' || t.governorate === liveForm.governorate).length === 0 && (
                    <span style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px', display: 'block' }}>
                      * يرجى إضافة محاضرين لهذه الإدارة أولاً من تبويب "أعضاء هيئة التدريس".
                    </span>
                  )}
                </div>

                {/* Day and Time Range */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={labelStyle}>اليوم</label>
                    <select 
                      value={liveForm.day} 
                      onChange={(e) => setLiveForm({ ...liveForm, day: e.target.value })} 
                      style={selectStyle}
                    >
                      <option value="السبت">السبت</option>
                      <option value="الأحد">الأحد</option>
                      <option value="الإثنين">الإثنين</option>
                      <option value="الثلاثاء">الثلاثاء</option>
                      <option value="الأربعاء">الأربعاء</option>
                      <option value="الخميس">الخميس</option>
                      <option value="الجمعة">الجمعة</option>
                    </select>
                  </div>

                  <div style={{ flex: 1, minWidth: '100px' }}>
                    <label style={labelStyle}>الوقت من</label>
                    <input 
                      type="time" 
                      required 
                      value={liveForm.timeStart} 
                      onChange={(e) => setLiveForm({ ...liveForm, timeStart: e.target.value })} 
                      style={inputStyle} 
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: '100px' }}>
                    <label style={labelStyle}>الوقت إلى</label>
                    <input 
                      type="time" 
                      required 
                      value={liveForm.timeEnd} 
                      onChange={(e) => setLiveForm({ ...liveForm, timeEnd: e.target.value })} 
                      style={inputStyle} 
                    />
                  </div>
                </div>

                {/* Stream Type */}
                <div>
                  <label style={labelStyle}>نوع البث المباشر</label>
                  <select 
                    value={liveForm.streamType || 'embedded'} 
                    onChange={(e) => setLiveForm({ ...liveForm, streamType: e.target.value, link: e.target.value === 'embedded' ? '' : liveForm.link })} 
                    style={selectStyle}
                  >
                    <option value="embedded">بث مدمج داخل الموقع (Jitsi Meet - مجاني وموصى به)</option>
                    <option value="external">رابط خارجي (Microsoft Teams / Zoom / إلخ)</option>
                  </select>
                </div>

                {/* Link */}
                {liveForm.streamType === 'external' && (
                  <div>
                    <label style={labelStyle}>رابط المحاضرة الخارجي</label>
                    <input 
                      type="url" 
                      required 
                      placeholder="https://zoom.us/j/..." 
                      value={liveForm.link} 
                      onChange={(e) => setLiveForm({ ...liveForm, link: e.target.value })} 
                      style={inputStyle} 
                    />
                  </div>
                )}

                {/* Weekly Renewal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                  <input 
                    type="checkbox" 
                    id="isWeekly" 
                    checked={liveForm.isWeekly} 
                    onChange={(e) => setLiveForm({ ...liveForm, isWeekly: e.target.checked })} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isWeekly" style={{ fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>
                    يتجدد البث تلقائياً في نفس التوقيت أسبوعياً
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={() => setShowAddModal(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold', backgroundColor: '#ef4444', border: 'none', color: 'white' }}>جدولة المحاضرة</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      );
    })()}

      {/* Modal: Add Schedule */}
      {showAddModal === 'schedule' && (() => {
        const availableTeachers = teachers.filter(t => {
          const matchGov = t.governorate === scheduleForm.governorate;
          const tBranches = String(t.branch || '').split(/,|،/).map(b => b.trim());
          return matchGov && (scheduleForm.branch === '' || tBranches.includes(scheduleForm.branch.trim()));
        });

        return (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <div style={modalHeaderStyle}>
                <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 'bold' }}>إضافة جدول محاضرة جديدة بالفروع</h2>
                <button onClick={() => setShowAddModal(null)} style={closeBtnStyle}><X size={18} /></button>
              </div>
              <form onSubmit={handleAddSchedule}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px', maxHeight: '60vh', overflowY: 'auto', paddingLeft: '8px' }}>
                  
                  {/* Governorate */}
                  <div>
                    <label style={labelStyle}>المحافظة / الإدارة</label>
                    <select 
                      value={scheduleForm.governorate} 
                      onChange={(e) => {
                        const newGov = e.target.value;
                        const firstBranch = shariaBranches.find(b => b.governorate === newGov)?.name || '';
                        setScheduleForm({ ...scheduleForm, governorate: newGov, branch: firstBranch, teacher: '' });
                      }} 
                      style={selectStyle}
                      disabled={isGovOfficial}
                    >
                      {GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  {/* Branch */}
                  <div>
                    <label style={labelStyle}>الفرع</label>
                    <select 
                      value={scheduleForm.branch} 
                      onChange={(e) => setScheduleForm({ ...scheduleForm, branch: e.target.value, teacher: '' })} 
                      style={selectStyle}
                      required
                    >
                      <option value="">اختر الفرع...</option>
                      {shariaBranches.filter(b => b.governorate === scheduleForm.governorate).map(b => (
                        <option key={b.id || b._id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Stage */}
                  <div>
                    <label style={labelStyle}>المرحلة الدراسية</label>
                    <select 
                      value={scheduleForm.stage} 
                      onChange={(e) => {
                        const stageVal = e.target.value;
                        setScheduleForm({ 
                          ...scheduleForm, 
                          stage: stageVal,
                          level: (stageVal !== 'المتقدمة' && (scheduleForm.level === 'المستوى الثالث' || scheduleForm.level === 'المستوى الرابع')) 
                            ? 'المستوى الأول' 
                            : scheduleForm.level,
                          discipline: stageVal === 'المتقدمة' ? 'fiqh' : '—'
                        });
                      }} 
                      style={selectStyle}
                    >
                      <option value="التمهيدية">المرحلة التمهيدية</option>
                      <option value="المتوسطة">المرحلة المتوسطة</option>
                      <option value="المتقدمة">المرحلة المتقدمة</option>
                    </select>
                  </div>

                  {/* Discipline (for Advanced Stage) */}
                  {scheduleForm.stage === 'المتقدمة' && (
                    <div>
                      <label style={labelStyle}>التخصص</label>
                      <select 
                        value={scheduleForm.discipline} 
                        onChange={(e) => setScheduleForm({ ...scheduleForm, discipline: e.target.value })} 
                        style={selectStyle}
                      >
                        <option value="fiqh">فقه وأصوله</option>
                        <option value="tafsir">تفسير وحديث</option>
                        <option value="aqeedah">عقيدة</option>
                        <option value="arabic">لغة عربية</option>
                        <option value="general">عامة</option>
                      </select>
                    </div>
                  )}

                  {/* Level */}
                  <div>
                    <label style={labelStyle}>المستوى الدراسي</label>
                    <select 
                      value={scheduleForm.level} 
                      onChange={(e) => setScheduleForm({ ...scheduleForm, level: e.target.value })} 
                      style={selectStyle}
                    >
                      <option value="المستوى الأول">المستوى الأول</option>
                      <option value="المستوى الثاني">المستوى الثاني</option>
                      {scheduleForm.stage === 'المتقدمة' && (
                        <>
                          <option value="المستوى الثالث">المستوى الثالث</option>
                          <option value="المستوى الرابع">المستوى الرابع</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Lecturer / Teacher */}
                  <div>
                    <label style={labelStyle}>المحاضر (من المسجلين بالفرع)</label>
                    <select 
                      value={scheduleForm.teacher} 
                      onChange={(e) => setScheduleForm({ ...scheduleForm, teacher: e.target.value })} 
                      style={selectStyle}
                      required
                    >
                      <option value="">اختر محاضراً...</option>
                      {availableTeachers.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                    {availableTeachers.length === 0 && scheduleForm.branch && (
                      <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
                        تنبيه: لا يوجد محاضرين مسجلين في هذا الفرع حالياً. يرجى إضافة محاضر في قسم هيئة التدريس وتعيين هذا الفرع له أولاً.
                      </div>
                    )}
                  </div>

                  {/* Day */}
                  <div>
                    <label style={labelStyle}>اليوم</label>
                    <select 
                      value={scheduleForm.day} 
                      onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })} 
                      style={selectStyle}
                    >
                      <option value="السبت">السبت</option>
                      <option value="الأحد">الأحد</option>
                      <option value="الاثنين">الاثنين</option>
                      <option value="الثلاثاء">الثلاثاء</option>
                      <option value="الأربعاء">الأربعاء</option>
                      <option value="الخميس">الخميس</option>
                      <option value="الجمعة">الجمعة</option>
                    </select>
                  </div>

                  {/* Time */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>وقت البدء</label>
                      <input 
                        type="time" 
                        required 
                        value={scheduleForm.timeStart} 
                        onChange={(e) => setScheduleForm({ ...scheduleForm, timeStart: e.target.value })} 
                        style={inputStyle} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>وقت الانتهاء</label>
                      <input 
                        type="time" 
                        required 
                        value={scheduleForm.timeEnd} 
                        onChange={(e) => setScheduleForm({ ...scheduleForm, timeEnd: e.target.value })} 
                        style={inputStyle} 
                      />
                    </div>
                  </div>

                  {/* Place */}
                  <div>
                    <label style={labelStyle}>مكان المحاضرة بالفصل/الرواق</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="مثال: القاعة الكبرى، رواق القرآن، فصل 3" 
                      value={scheduleForm.place} 
                      onChange={(e) => setScheduleForm({ ...scheduleForm, place: e.target.value })} 
                      style={inputStyle} 
                    />
                  </div>

                  {/* Weekly Recurrence Note */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                    <input 
                      type="checkbox" 
                      id="isWeeklySchedule"
                      checked={scheduleForm.isWeekly} 
                      onChange={(e) => setScheduleForm({ ...scheduleForm, isWeekly: e.target.checked })} 
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="isWeeklySchedule" style={{ fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>
                      تتجدد المحاضرة في نفس التوقيت أسبوعياً تلقائياً
                    </label>
                  </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setShowAddModal(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold', backgroundColor: '#6366f1', border: 'none', color: 'white' }}>حفظ الجدول</button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Modal: Edit Schedule */}
      {editingSchedule && (() => {
        const availableTeachers = teachers.filter(t => {
          const matchGov = t.governorate === editingSchedule.governorate;
          const tBranches = String(t.branch || '').split(/,|،/).map(b => b.trim());
          return matchGov && (editingSchedule.branch === '' || tBranches.includes(editingSchedule.branch.trim()));
        });

        return (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <div style={modalHeaderStyle}>
                <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 'bold' }}>تعديل جدول المحاضرة</h2>
                <button onClick={() => setEditingSchedule(null)} style={closeBtnStyle}><X size={18} /></button>
              </div>
              <form onSubmit={handleEditSchedule}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px', maxHeight: '60vh', overflowY: 'auto', paddingLeft: '8px' }}>
                  
                  {/* Governorate */}
                  <div>
                    <label style={labelStyle}>المحافظة / الإدارة</label>
                    <select 
                      value={editingSchedule.governorate} 
                      onChange={(e) => {
                        const newGov = e.target.value;
                        const firstBranch = shariaBranches.find(b => b.governorate === newGov)?.name || '';
                        setEditingSchedule({ ...editingSchedule, governorate: newGov, branch: firstBranch, teacher: '' });
                      }} 
                      style={selectStyle}
                      disabled={isGovOfficial}
                    >
                      {GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  {/* Branch */}
                  <div>
                    <label style={labelStyle}>الفرع</label>
                    <select 
                      value={editingSchedule.branch} 
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, branch: e.target.value, teacher: '' })} 
                      style={selectStyle}
                      required
                    >
                      <option value="">اختر الفرع...</option>
                      {shariaBranches.filter(b => b.governorate === editingSchedule.governorate).map(b => (
                        <option key={b.id || b._id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Stage */}
                  <div>
                    <label style={labelStyle}>المرحلة الدراسية</label>
                    <select 
                      value={editingSchedule.stage} 
                      onChange={(e) => {
                        const stageVal = e.target.value;
                        setEditingSchedule({ 
                          ...editingSchedule, 
                          stage: stageVal,
                          level: (stageVal !== 'المتقدمة' && (editingSchedule.level === 'المستوى الثالث' || editingSchedule.level === 'المستوى الرابع')) 
                            ? 'المستوى الأول' 
                            : editingSchedule.level,
                          discipline: stageVal === 'المتقدمة' ? 'fiqh' : '—'
                        });
                      }} 
                      style={selectStyle}
                    >
                      <option value="التمهيدية">المرحلة التمهيدية</option>
                      <option value="المتوسطة">المرحلة المتوسطة</option>
                      <option value="المتقدمة">المرحلة المتقدمة</option>
                    </select>
                  </div>

                  {/* Discipline (for Advanced Stage) */}
                  {editingSchedule.stage === 'المتقدمة' && (
                    <div>
                      <label style={labelStyle}>التخصص</label>
                      <select 
                        value={editingSchedule.discipline} 
                        onChange={(e) => setEditingSchedule({ ...editingSchedule, discipline: e.target.value })} 
                        style={selectStyle}
                      >
                        <option value="fiqh">فقه وأصوله</option>
                        <option value="tafsir">تفسير وحديث</option>
                        <option value="aqeedah">عقيدة</option>
                        <option value="arabic">لغة عربية</option>
                        <option value="general">عامة</option>
                      </select>
                    </div>
                  )}

                  {/* Level */}
                  <div>
                    <label style={labelStyle}>المستوى الدراسي</label>
                    <select 
                      value={editingSchedule.level} 
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, level: e.target.value })} 
                      style={selectStyle}
                    >
                      <option value="المستوى الأول">المستوى الأول</option>
                      <option value="المستوى الثاني">المستوى الثاني</option>
                      {editingSchedule.stage === 'المتقدمة' && (
                        <>
                          <option value="المستوى الثالث">المستوى الثالث</option>
                          <option value="المستوى الرابع">المستوى الرابع</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Lecturer / Teacher */}
                  <div>
                    <label style={labelStyle}>المحاضر (من المسجلين بالفرع)</label>
                    <select 
                      value={editingSchedule.teacher} 
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, teacher: e.target.value })} 
                      style={selectStyle}
                      required
                    >
                      <option value="">اختر محاضراً...</option>
                      {availableTeachers.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                    {availableTeachers.length === 0 && editingSchedule.branch && (
                      <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
                        تنبيه: لا يوجد محاضرين مسجلين في هذا الفرع حالياً. يرجى إضافة محاضر في قسم هيئة التدريس وتعيين هذا الفرع له أولاً.
                      </div>
                    )}
                  </div>

                  {/* Day */}
                  <div>
                    <label style={labelStyle}>اليوم</label>
                    <select 
                      value={editingSchedule.day} 
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, day: e.target.value })} 
                      style={selectStyle}
                    >
                      <option value="السبت">السبت</option>
                      <option value="الأحد">الأحد</option>
                      <option value="الاثنين">الاثنين</option>
                      <option value="الثلاثاء">الثلاثاء</option>
                      <option value="الأربعاء">الأربعاء</option>
                      <option value="الخميس">الخميس</option>
                      <option value="الجمعة">الجمعة</option>
                    </select>
                  </div>

                  {/* Time */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>وقت البدء</label>
                      <input 
                        type="time" 
                        required 
                        value={editingSchedule.timeStart} 
                        onChange={(e) => setEditingSchedule({ ...editingSchedule, timeStart: e.target.value })} 
                        style={inputStyle} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>وقت الانتهاء</label>
                      <input 
                        type="time" 
                        required 
                        value={editingSchedule.timeEnd} 
                        onChange={(e) => setEditingSchedule({ ...editingSchedule, timeEnd: e.target.value })} 
                        style={inputStyle} 
                      />
                    </div>
                  </div>

                  {/* Place */}
                  <div>
                    <label style={labelStyle}>مكان المحاضرة بالفصل/الرواق</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="مثال: القاعة الكبرى، رواق القرآن، فصل 3" 
                      value={editingSchedule.place} 
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, place: e.target.value })} 
                      style={inputStyle} 
                    />
                  </div>

                  {/* Weekly Recurrence Note */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                    <input 
                      type="checkbox" 
                      id="editIsWeeklySchedule"
                      checked={editingSchedule.isWeekly} 
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, isWeekly: e.target.checked })} 
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="editIsWeeklySchedule" style={{ fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>
                      تتجدد المحاضرة في نفس التوقيت أسبوعياً تلقائياً
                    </label>
                  </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setEditingSchedule(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold', backgroundColor: '#6366f1', border: 'none', color: 'white' }}>حفظ التعديلات</button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Modal 8-Edit: Edit Live */}
      {editingLive && (() => {
        const getDisciplineKey = (arabicVal) => {
          if (arabicVal === 'فقه وأصوله') return 'fiqh';
          if (arabicVal === 'تفسير وحديث') return 'tafsir';
          if (arabicVal === 'عقيدة') return 'aqeedah';
          if (arabicVal === 'لغة عربية') return 'arabic';
          if (arabicVal === 'عامة') return 'general';
          return arabicVal;
        };

        const filteredCoursesForEditLive = courses.filter(c => 
          c.stage === editingLive.stage && 
          c.level === editingLive.level &&
          (editingLive.stage !== 'المتقدمة' || c.discipline === getDisciplineKey(editingLive.discipline))
        );

        return (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <div style={modalHeaderStyle}>
                <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 'bold' }}>تعديل البث المباشر والمحاضرة الرقمية</h2>
                <button onClick={() => setEditingLive(null)} style={closeBtnStyle}><X size={18} /></button>
              </div>
              <form onSubmit={handleEditLive}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                  
                  {/* Administration (Governorate) */}
                  <div>
                    <label style={labelStyle}>الإدارة / المحافظة</label>
                    <select 
                      value={editingLive.governorate} 
                      onChange={(e) => setEditingLive({ ...editingLive, governorate: e.target.value, teacher: '' })} 
                      style={selectStyle}
                      disabled={isGovOfficial}
                    >
                      <option value="جميع المحافظات">جميع المحافظات</option>
                      {GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  {/* Stage & Level & Specialty */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <label style={labelStyle}>المرحلة</label>
                      <select 
                        value={editingLive.stage} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingLive({
                            ...editingLive,
                            stage: val,
                            level: 'المستوى الأول',
                            discipline: val === 'المتقدمة' ? 'فقه وأصوله' : '—',
                            title: ''
                          });
                        }} 
                        style={selectStyle}
                      >
                        <option value="التمهيدية">التمهيدية</option>
                        <option value="المتوسطة">المتوسطة</option>
                        <option value="المتقدمة">المتقدمة</option>
                      </select>
                    </div>

                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <label style={labelStyle}>المستوى</label>
                      <select 
                        value={editingLive.level} 
                        onChange={(e) => setEditingLive({ ...editingLive, level: e.target.value, title: '' })} 
                        style={selectStyle}
                      >
                        <option value="المستوى الأول">المستوى الأول</option>
                        <option value="المستوى الثاني">المستوى الثاني</option>
                        {editingLive.stage === 'المتقدمة' && (
                          <>
                            <option value="المستوى الثالث">المستوى الثالث</option>
                            <option value="المستوى الرابع">المستوى الرابع</option>
                          </>
                        )}
                      </select>
                    </div>

                    {editingLive.stage === 'المتقدمة' && (
                      <div style={{ flex: 1, minWidth: '120px' }}>
                        <label style={labelStyle}>التخصص الدراسي</label>
                        <select 
                          value={editingLive.discipline} 
                          onChange={(e) => setEditingLive({ ...editingLive, discipline: e.target.value, title: '' })} 
                          style={selectStyle}
                        >
                          <option value="فقه وأصوله">فقه وأصوله</option>
                          <option value="تفسير وحديث">تفسير وحديث</option>
                          <option value="عقيدة">عقيدة</option>
                          <option value="لغة عربية">لغة عربية</option>
                          <option value="عامة">عامة</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label style={labelStyle}>المادة المسجلة (عنوان البث)</label>
                    <select 
                      required 
                      value={editingLive.title} 
                      onChange={(e) => setEditingLive({ ...editingLive, title: e.target.value })} 
                      style={selectStyle}
                    >
                      {filteredCoursesForEditLive.length === 0 ? (
                        <option value="">لا توجد مواد مسجلة لهذه المرحلة والمستوى حالياً</option>
                      ) : (
                        <>
                          <option value="">اختر المادة...</option>
                          {filteredCoursesForEditLive.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </>
                      )}
                    </select>
                    {filteredCoursesForEditLive.length === 0 && (
                      <span style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px', display: 'block' }}>
                        * يرجى إضافة مادة أولاً لهذا المستوى من تبويب "المقررات والمواد الدراسية".
                      </span>
                    )}
                  </div>

                  {/* Lecturer (Teacher) filtered by Governorate */}
                  <div>
                    <label style={labelStyle}>المحاضر (من قائمة المحاضرين بالإدارة)</label>
                    <input 
                      type="text" 
                      placeholder="ابحث عن المحاضر بالاسم..." 
                      value={editTeacherSearchQuery} 
                      onChange={(e) => setEditTeacherSearchQuery(e.target.value)} 
                      style={{ ...inputStyle, marginBottom: '8px' }} 
                    />
                    <select 
                      required 
                      value={editingLive.teacher} 
                      onChange={(e) => setEditingLive({ ...editingLive, teacher: e.target.value })} 
                      style={selectStyle}
                    >
                      {teachers.filter(t => 
                        (editingLive.governorate === 'جميع المحافظات' || t.governorate === editingLive.governorate) &&
                        (!editTeacherSearchQuery || t.name.toLowerCase().includes(editTeacherSearchQuery.toLowerCase()))
                      ).length === 0 ? (
                        <option value="">لا يوجد محاضرين يطابقون البحث في هذه الإدارة حالياً</option>
                      ) : (
                        <>
                          <option value="">اختر الأستاذ المحاضر...</option>
                          {teachers.filter(t => 
                            (editingLive.governorate === 'جميع المحافظات' || t.governorate === editingLive.governorate) &&
                            (!editTeacherSearchQuery || t.name.toLowerCase().includes(editTeacherSearchQuery.toLowerCase()))
                          ).map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </>
                      )}
                    </select>
                    {teachers.filter(t => editingLive.governorate === 'جميع المحافظات' || t.governorate === editingLive.governorate).length === 0 && (
                      <span style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px', display: 'block' }}>
                        * يرجى إضافة محاضرين لهذه الإدارة أولاً من تبويب "أعضاء هيئة التدريس".
                      </span>
                    )}
                  </div>

                  {/* Day and Time Range */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <label style={labelStyle}>اليوم</label>
                      <select 
                        value={editingLive.day} 
                        onChange={(e) => setEditingLive({ ...editingLive, day: e.target.value })} 
                        style={selectStyle}
                      >
                        <option value="السبت">السبت</option>
                        <option value="الأحد">الأحد</option>
                        <option value="الإثنين">الإثنين</option>
                        <option value="الثلاثاء">الثلاثاء</option>
                        <option value="الأربعاء">الأربعاء</option>
                        <option value="الخميس">الخميس</option>
                        <option value="الجمعة">الجمعة</option>
                      </select>
                    </div>

                    <div style={{ flex: 1, minWidth: '100px' }}>
                      <label style={labelStyle}>الوقت من</label>
                      <input 
                        type="time" 
                        required 
                        value={editingLive.timeStart || ''} 
                        onChange={(e) => setEditingLive({ ...editingLive, timeStart: e.target.value })} 
                        style={inputStyle} 
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: '100px' }}>
                      <label style={labelStyle}>الوقت إلى</label>
                      <input 
                        type="time" 
                        required 
                        value={editingLive.timeEnd || ''} 
                        onChange={(e) => setEditingLive({ ...editingLive, timeEnd: e.target.value })} 
                        style={inputStyle} 
                      />
                    </div>
                  </div>

                  {/* Stream Type */}
                  <div>
                    <label style={labelStyle}>نوع البث المباشر</label>
                    <select 
                      value={editingLive.streamType || 'embedded'} 
                      onChange={(e) => setEditingLive({ ...editingLive, streamType: e.target.value, link: e.target.value === 'embedded' ? '' : editingLive.link })} 
                      style={selectStyle}
                    >
                      <option value="embedded">بث مدمج داخل الموقع (Jitsi Meet - مجاني وموصى به)</option>
                      <option value="external">رابط خارجي (Microsoft Teams / Zoom / إلخ)</option>
                    </select>
                  </div>

                  {/* Link */}
                  {(editingLive.streamType || 'embedded') === 'external' && (
                    <div>
                      <label style={labelStyle}>رابط المحاضرة الخارجي</label>
                      <input 
                        type="url" 
                        required 
                        placeholder="https://zoom.us/j/..." 
                        value={editingLive.link || ''} 
                        onChange={(e) => setEditingLive({ ...editingLive, link: e.target.value })} 
                        style={inputStyle} 
                      />
                    </div>
                  )}

                  {/* Weekly Renewal */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                    <input 
                      type="checkbox" 
                      id="isWeeklyEdit" 
                      checked={editingLive.isWeekly} 
                      onChange={(e) => setEditingLive({ ...editingLive, isWeekly: e.target.checked })} 
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="isWeeklyEdit" style={{ fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>
                      يتجدد البث تلقائياً في نفس التوقيت أسبوعياً
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                    <button type="button" onClick={() => setEditingLive(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold', backgroundColor: '#ef4444', border: 'none', color: 'white' }}>حفظ التعديلات</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Modal: Add Teacher */}
      {showAddModal === 'teacher' && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 'bold' }}>تسجيل عضو هيئة تدريس جديد بموقع [ {teacherForm.governorate} ]</h2>
              <button onClick={() => setShowAddModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddTeacher}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>اسم المحاضر بالكامل</label>
                    <input type="text" required value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الإدارة (الموقع / المحافظة)</label>
                    <select value={teacherForm.governorate} onChange={(e) => setTeacherForm({ ...teacherForm, governorate: e.target.value, branches: [] })} style={selectStyle} disabled={isGovOfficial}>
                      <option value="جميع المحافظات">جميع المحافظات</option>
                      {GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الفروع التعليمية</label>
                    <div style={{
                      maxHeight: '120px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '8px',
                      backgroundColor: 'var(--bg-main)'
                    }}>
                      {shariaBranches.filter(b => b.governorate === teacherForm.governorate).length === 0 ? (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>لا توجد فروع مسجلة لهذه المحافظة</span>
                      ) : (
                        shariaBranches.filter(b => b.governorate === teacherForm.governorate).map(b => (
                          <div key={b.id || b._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <input 
                              type="checkbox" 
                              id={`add-branch-${b.id || b._id}`}
                              checked={teacherForm.branches?.includes(b.name) || false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setTeacherForm(prev => {
                                  const currentBranches = prev.branches || [];
                                  const newBranches = checked 
                                    ? [...currentBranches, b.name]
                                    : currentBranches.filter(name => name !== b.name);
                                  return { ...prev, branches: newBranches };
                                });
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            <label htmlFor={`add-branch-${b.id || b._id}`} style={{ fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                              {b.name}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الرقم القومي (14 رقم)</label>
                    <input type="text" required maxLength="14" value={teacherForm.nationalId} onChange={(e) => setTeacherForm({ ...teacherForm, nationalId: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>رقم الهاتف</label>
                    <input type="text" required maxLength={11} value={teacherForm.phone} onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value.replace(/\D/g, '') })} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الدرجة الوظيفية</label>
                    <input type="text" required placeholder="مثال: أستاذ مساعد" value={teacherForm.jobGrade} onChange={(e) => setTeacherForm({ ...teacherForm, jobGrade: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الجامعة</label>
                    <input type="text" required placeholder="مثال: جامعة الأزهر" value={teacherForm.university} onChange={(e) => setTeacherForm({ ...teacherForm, university: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الكلية</label>
                    <input type="text" required placeholder="مثال: كلية اللغة العربية" value={teacherForm.college} onChange={(e) => setTeacherForm({ ...teacherForm, college: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>القسم التخصصي</label>
                    <input type="text" required placeholder="مثال: أصول الفقه" value={teacherForm.department} onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={() => setShowAddModal(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold', backgroundColor: '#f59e0b', border: 'none', color: 'white' }}>حفظ البيانات</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Sharia Branch */}
      {showAddModal === 'shariaBranch' && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 'bold' }}>إضافة فرع علوم شرعية جديد</h2>
              <button onClick={() => setShowAddModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddShariaBranch}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>اسم الفرع بالكامل</label>
                    <input type="text" required placeholder="مثال: معهد تفهنا الأشراف الشرعي" value={shariaBranchForm.name} onChange={(e) => setShariaBranchForm({ ...shariaBranchForm, name: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الموقع / المحافظة</label>
                    <select value={shariaBranchForm.governorate} onChange={(e) => setShariaBranchForm({ ...shariaBranchForm, governorate: e.target.value })} style={selectStyle} disabled={isGovOfficial}>
                      {GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>رمز الفرع</label>
                    <input type="text" required placeholder="مثال: SH-DK01" value={shariaBranchForm.code} onChange={(e) => setShariaBranchForm({ ...shariaBranchForm, code: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={labelStyle}>العنوان بالتفصيل</label>
                    <input type="text" required placeholder="العنوان أو اسم المعهد/المسجد المستضيف" value={shariaBranchForm.address} onChange={(e) => setShariaBranchForm({ ...shariaBranchForm, address: e.target.value })} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={() => setShowAddModal(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold', backgroundColor: '#eab308', border: 'none', color: 'black' }}>حفظ الفرع</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Sharia Branch */}
      {editingShariaBranch && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 'bold' }}>تعديل بيانات فرع العلوم الشرعية</h2>
              <button onClick={() => setEditingShariaBranch(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <form onSubmit={handleEditShariaBranch}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>اسم الفرع بالكامل</label>
                    <input type="text" required value={editingShariaBranch.name} onChange={(e) => setEditingShariaBranch({ ...editingShariaBranch, name: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الموقع / المحافظة</label>
                    <select value={editingShariaBranch.governorate} onChange={(e) => setEditingShariaBranch({ ...editingShariaBranch, governorate: e.target.value })} style={selectStyle} disabled={isGovOfficial}>
                      {GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>رمز الفرع</label>
                    <input type="text" required value={editingShariaBranch.code} onChange={(e) => setEditingShariaBranch({ ...editingShariaBranch, code: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={labelStyle}>العنوان بالتفصيل</label>
                    <input type="text" required value={editingShariaBranch.address} onChange={(e) => setEditingShariaBranch({ ...editingShariaBranch, address: e.target.value })} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={() => setEditingShariaBranch(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold', backgroundColor: '#eab308', border: 'none', color: 'black' }}>حفظ التعديلات</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Teacher */}
      {editingTeacher && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 'bold' }}>تعديل بيانات عضو هيئة التدريس بموقع [ {editingTeacher.governorate} ]</h2>
              <button onClick={() => setEditingTeacher(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <form onSubmit={handleEditTeacher}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>اسم المحاضر بالكامل</label>
                    <input type="text" required value={editingTeacher.name} onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الإدارة (الموقع / المحافظة)</label>
                    <select value={editingTeacher.governorate} onChange={(e) => setEditingTeacher({ ...editingTeacher, governorate: e.target.value, branches: [], branch: '' })} style={selectStyle} disabled={isGovOfficial}>
                      <option value="جميع المحافظات">جميع المحافظات</option>
                      {GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الفروع التعليمية</label>
                    <div style={{
                      maxHeight: '120px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '8px',
                      backgroundColor: 'var(--bg-main)'
                    }}>
                      {shariaBranches.filter(b => b.governorate === editingTeacher.governorate).length === 0 ? (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>لا توجد فروع مسجلة لهذه المحافظة</span>
                      ) : (
                        shariaBranches.filter(b => b.governorate === editingTeacher.governorate).map(b => {
                          const currentBranches = Array.isArray(editingTeacher.branches) 
                            ? editingTeacher.branches 
                            : (editingTeacher.branch ? editingTeacher.branch.split('، ') : []);
                          
                          return (
                            <div key={b.id || b._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <input 
                                type="checkbox" 
                                id={`edit-branch-${b.id || b._id}`}
                                checked={currentBranches.includes(b.name)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const newBranches = checked 
                                    ? [...currentBranches, b.name]
                                    : currentBranches.filter(name => name !== b.name);
                                  setEditingTeacher({
                                    ...editingTeacher,
                                    branches: newBranches,
                                    branch: newBranches.join('، ')
                                  });
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                              <label htmlFor={`edit-branch-${b.id || b._id}`} style={{ fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                {b.name}
                              </label>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الرقم القومي (14 رقم)</label>
                    <input type="text" required maxLength="14" value={editingTeacher.nationalId} onChange={(e) => setEditingTeacher({ ...editingTeacher, nationalId: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>رقم الهاتف</label>
                    <input type="text" required maxLength={11} value={editingTeacher.phone || ''} onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value.replace(/\D/g, '') })} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الدرجة الوظيفية</label>
                    <input type="text" required placeholder="مثال: أستاذ مساعد" value={editingTeacher.jobGrade || ''} onChange={(e) => setEditingTeacher({ ...editingTeacher, jobGrade: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الجامعة</label>
                    <input type="text" required placeholder="مثال: جامعة الأزهر" value={editingTeacher.university || ''} onChange={(e) => setEditingTeacher({ ...editingTeacher, university: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الكلية</label>
                    <input type="text" required placeholder="مثال: كلية اللغة العربية" value={editingTeacher.college || ''} onChange={(e) => setEditingTeacher({ ...editingTeacher, college: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>القسم التخصصي</label>
                    <input type="text" required placeholder="مثال: أصول الفقه" value={editingTeacher.department || ''} onChange={(e) => setEditingTeacher({ ...editingTeacher, department: e.target.value })} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={() => setEditingTeacher(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold', backgroundColor: '#f59e0b', border: 'none', color: 'white' }}>حفظ التعديلات</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Course */}
      {editingCourse && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 'bold' }}>تعديل مقرر دراسي</h2>
              <button onClick={() => setEditingCourse(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <form onSubmit={handleEditCourse}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                
                {/* Stage Selection */}
                <div>
                  <label style={labelStyle}>المرحلة الدراسية</label>
                  <select 
                    value={editingCourse.stage} 
                    onChange={(e) => {
                      const stageVal = e.target.value;
                      setEditingCourse({ 
                        ...editingCourse, 
                        stage: stageVal,
                        level: (stageVal !== 'المتقدمة' && (editingCourse.level === 'المستوى الثالث' || editingCourse.level === 'المستوى الرابع')) 
                          ? 'المستوى الأول' 
                          : editingCourse.level,
                        discipline: stageVal === 'المتقدمة' ? 'fiqh' : '—'
                      });
                    }} 
                    style={selectStyle}
                  >
                    <option value="التمهيدية">المرحلة التمهيدية</option>
                    <option value="المتوسطة">المرحلة المتوسطة</option>
                    <option value="المتقدمة">المرحلة المتقدمة</option>
                  </select>
                </div>

                {/* Specialization / Discipline Selection - Only for Advanced Stage */}
                {editingCourse.stage === 'المتقدمة' && (
                  <div>
                    <label style={labelStyle}>التخصص الدراسي</label>
                    <select 
                      value={editingCourse.discipline} 
                      onChange={(e) => setEditingCourse({ ...editingCourse, discipline: e.target.value })} 
                      style={selectStyle}
                    >
                      <option value="fiqh">فقه وأصوله</option>
                      <option value="tafsir">تفسير وحديث</option>
                      <option value="aqeedah">عقيدة</option>
                      <option value="arabic">لغة عربية</option>
                      <option value="general">عامة</option>
                    </select>
                  </div>
                )}

                {/* Level Selection */}
                <div>
                  <label style={labelStyle}>المستوى الدراسي</label>
                  <select 
                    value={editingCourse.level} 
                    onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })} 
                    style={selectStyle}
                  >
                    <option value="المستوى الأول">المستوى الأول</option>
                    <option value="المستوى الثاني">المستوى الثاني</option>
                    {editingCourse.stage === 'المتقدمة' && (
                      <>
                        <option value="المستوى الثالث">المستوى الثالث</option>
                        <option value="المستوى الرابع">المستوى الرابع</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Course Name */}
                <div>
                  <label style={labelStyle}>اسم المادة</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="مثال: شرح متن قطر الندى" 
                    value={editingCourse.name} 
                    onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })} 
                    style={inputStyle} 
                  />
                </div>

                {/* PDF/Files Upload */}
                <div>
                  <label style={labelStyle}>المرفقات (ملفات PDF، صور، ملفات مضغوطة)</label>
                  <input 
                    type="file" 
                    accept=".pdf,image/*,.zip,.rar,.7z" 
                    multiple 
                    onChange={(e) => handleFileChange(e, true)} 
                    style={{ ...inputStyle, padding: '6px 10px' }} 
                  />
                  {editingCourse.pdfs && editingCourse.pdfs.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {editingCourse.pdfs.map((pdf, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '13px'
                        }}>
                          <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                            {pdf.name}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setEditingCourse(prev => ({ ...prev, pdfs: prev.pdfs.filter((_, i) => i !== index) }))}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>


                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={() => setEditingCourse(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold' }}>حفظ التعديلات</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeMeeting && (
        <JitsiMeeting 
          meeting={activeMeeting}
          currentUser={currentUser}
          onClose={() => setActiveMeeting(null)}
          addLectureAccessLog={addLectureAccessLog}
          updateLectureAccessDuration={updateLectureAccessDuration}
          loggedInStudent={loggedInStudent}
        />
      )}

      <Footer />
    </div>
  );
}

// --- Inline styles for modals ---
const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  direction: 'rtl'
};

const modalContentStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '16px',
  width: '95%',
  maxWidth: '550px',
  padding: '24px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  color: 'var(--text-primary)'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid var(--border-subtle)',
  paddingBottom: '12px'
};

const closeBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer'
};

const labelStyle = {
  fontSize: '12px',
  color: 'var(--text-secondary)',
  display: 'block',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  backgroundColor: 'var(--bg-main)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)',
  fontSize: '13px'
};

const selectStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  backgroundColor: 'var(--bg-main)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)',
  fontSize: '13px'
};

export default ShariaDashboard;
