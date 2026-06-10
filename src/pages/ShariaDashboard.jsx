import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  BookOpen, GraduationCap, Users, Calendar, Award, Shield, MapPin, 
  Layers, FileText, Newspaper, Radio, Video, Plus, Search, Filter, 
  Trash, Edit, Check, X, ChevronLeft, ChevronRight, Play, ExternalLink
} from 'lucide-react';
import Footer from '../components/Footer';
import { useAppData } from '../context/AppDataContext';

// All Egyptian governorates + Al-Azhar Mosque
const GOVERNORATES = [
  'الجامع الأزهر', 'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 
  'البحر الأحمر', 'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 
  'المنوفية', 'المنيا', 'القليوبية', 'الوادي الجديد', 'الشرقية', 
  'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا', 'شمال سيناء', 'سوهاج'
];

function ShariaDashboard() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const userRole = currentUser ? currentUser.role : '';
  const isShariaStudent = userRole === 'sharia_student';

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(null); // 'admin', 'externalAdmin', 'course', 'student', 'exam', 'result', 'news', 'live'
  
  // Governorate filter selection (Students & Live Lectures & Attendance vary per governorate)
  const [selectedGov, setSelectedGov] = useState('الكل');
  const [selectedBranch, setSelectedBranch] = useState('الكل');

  useEffect(() => {
    const targetTab = tabParam || 'overview';
    if (isShariaStudent && ['admins', 'externalAdmins', 'students'].includes(targetTab)) {
      setActiveTab('overview');
    } else {
      setActiveTab(targetTab);
    }
  }, [tabParam, isShariaStudent]);

  const { managers = [], addManager, deleteManager, addUser, updateUser, users = [], branches = [] } = useAppData();

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

  // Stages, Levels, Courses (Subjects) are static/global
  const [courses, setCourses] = useState(() => {
    try {
      const stored = localStorage.getItem('sharia_courses');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map(c => c.hours === 30 ? { ...c, hours: 20 } : c);
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('sharia_courses', JSON.stringify(courses));
  }, [courses]);

  const [shariaBranches, setShariaBranches] = useState(() => {
    try {
      const stored = localStorage.getItem('sharia_branches');
      return stored ? JSON.parse(stored) : [
        { id: 'sb-1', name: 'فرع معهد تفهنا الأشراف الشرعي', governorate: 'الدقهلية', code: 'SH-DK01', address: 'معهد فتيات تفهنا الأشراف' },
        { id: 'sb-2', name: 'فرع الجامع الأزهر الرئيسي', governorate: 'الجامع الأزهر', code: 'SH-AZ01', address: 'مقر الجامع الأزهر الشريف بالقاهرة' }
      ];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sharia_branches', JSON.stringify(shariaBranches));
  }, [shariaBranches]);

  const [selectedCourseStage, setSelectedCourseStage] = useState('تمهيدية');
  const [selectedCourseLevel, setSelectedCourseLevel] = useState('المستوى الأول');
  const [selectedCourseDiscipline, setSelectedCourseDiscipline] = useState('fiqh');

  // Students list changes per location/governorate with the new fields
  const [students, setStudents] = useState(() => {
    try {
      const stored = localStorage.getItem('sharia_students');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const loggedInStudent = isShariaStudent 
    ? students.find(s => String(s.nationalId || '').trim() === String(currentUser?.national_id || '').trim())
    : null;

  useEffect(() => {
    localStorage.setItem('sharia_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    if (isShariaStudent && loggedInStudent) {
      setSelectedCourseStage(loggedInStudent.stage || 'تمهيدية');
      setSelectedCourseLevel(loggedInStudent.level || 'المستوى الأول');
      setSelectedCourseDiscipline(loggedInStudent.discipline || 'fiqh');
      setSelectedGov(loggedInStudent.governorate || 'الجامع الأزهر');
    }
  }, [isShariaStudent, loggedInStudent]);

  const [editingStudent, setEditingStudent] = useState(null);

  const [teachers, setTeachers] = useState(() => {
    try {
      const stored = localStorage.getItem('sharia_teachers');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });

  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingShariaBranch, setEditingShariaBranch] = useState(null);
  const [editingLive, setEditingLive] = useState(null);

  useEffect(() => {
    localStorage.setItem('sharia_teachers', JSON.stringify(teachers));
  }, [teachers]);

  const [exams, setExams] = useState([]);

  const [results, setResults] = useState([]);

  // News is static/global
  const [news, setNews] = useState([]);

  // Live stream lectures change per location/governorate
  const [liveLectures, setLiveLectures] = useState(() => {
    try {
      const stored = localStorage.getItem('sharia_live');
      return stored ? JSON.parse(stored) : [
        {
          id: 1,
          title: 'شرح كتاب التوحيد من صحيح البخاري',
          governorate: 'الجامع الأزهر',
          stage: 'تمهيدية',
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
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sharia_live', JSON.stringify(liveLectures));
  }, [liveLectures]);

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
  const [courseForm, setCourseForm] = useState({ stage: 'تمهيدية', level: 'المستوى الأول', discipline: 'fiqh', name: '', teacher: '', hours: 20 });
  const [studentForm, setStudentForm] = useState({ 
    name: '', 
    nationalId: '', 
    governorate: 'الجامع الأزهر', 
    branch: '',
    stage: 'تمهيدية', 
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
  const [liveForm, setLiveForm] = useState({
    title: '',
    governorate: 'الجامع الأزهر',
    stage: 'تمهيدية',
    level: 'المستوى الأول',
    discipline: '—',
    teacher: '',
    day: 'الأحد',
    timeStart: '',
    timeEnd: '',
    link: '',
    isWeekly: true,
    status: 'مجدول'
  });
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    nationalId: '',
    phone: '',
    jobGrade: '',
    university: '',
    college: '',
    department: '',
    governorate: 'الجامع الأزهر',
    branch: ''
  });
  const [shariaBranchForm, setShariaBranchForm] = useState({ name: '', governorate: 'الجامع الأزهر', code: '', address: '' });

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
      id: Date.now(),
      stage: courseForm.stage,
      level: courseForm.level,
      discipline: courseForm.stage === 'متقدمة' ? courseForm.discipline : '—',
      name: courseForm.name,
      teacher: '',
      studentsCount: 0,
      hours: 20
    };
    setCourses([...courses, formattedCourse]);
    setShowAddModal(null);
    setCourseForm({ stage: 'تمهيدية', level: 'المستوى الأول', discipline: 'fiqh', name: '', teacher: '', hours: 20 });
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    const studentId = Date.now();
    const newStudent = { ...studentForm, id: studentId };
    
    // Add to local state
    setStudents([...students, newStudent]);
    
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
      stage: 'تمهيدية', 
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
    
    // Find the original student before editing
    const originalStudent = students.find(s => s.id === editingStudent.id);
    const oldNationalId = originalStudent ? originalStudent.nationalId : null;
    const newNationalId = editingStudent.nationalId;
    
    // Update student in list
    setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
    
    // Update or create user credentials
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
        // Fallback: If no associated user was found, create one now
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
      const sameDiscipline = l.stage !== 'متقدمة' || l.discipline === newLive.discipline;
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
    setLiveLectures([...liveLectures, { ...liveForm, id: Date.now() }]);
    setShowAddModal(null);
    setLiveForm({
      title: '',
      governorate: 'الجامع الأزهر',
      stage: 'تمهيدية',
      level: 'المستوى الأول',
      discipline: '—',
      teacher: '',
      day: 'الأحد',
      timeStart: '',
      timeEnd: '',
      link: '',
      isWeekly: true,
      status: 'مجدول'
    });
  };

  const handleAddTeacher = (e) => {
    e.preventDefault();
    const newTeacher = { ...teacherForm, id: Date.now() };
    setTeachers([...teachers, newTeacher]);
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
      branch: ''
    });
  };

  const handleEditTeacher = (e) => {
    e.preventDefault();
    if (!editingTeacher) return;
    setTeachers(teachers.map(t => t.id === editingTeacher.id ? editingTeacher : t));
    setEditingTeacher(null);
  };

  const handleEditCourse = (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    setCourses(courses.map(c => c.id === editingCourse.id ? {
      ...c,
      stage: editingCourse.stage,
      level: editingCourse.level,
      discipline: editingCourse.stage === 'متقدمة' ? editingCourse.discipline : '—',
      name: editingCourse.name,
      teacher: '',
      hours: 20
    } : c));
    setEditingCourse(null);
  };

  const handleAddShariaBranch = (e) => {
    e.preventDefault();
    const newBranch = { ...shariaBranchForm, id: 'sb-' + Date.now() };
    setShariaBranches([...shariaBranches, newBranch]);
    setShowAddModal(null);
    setShariaBranchForm({ name: '', governorate: 'الجامع الأزهر', code: '', address: '' });
  };

  const handleEditShariaBranch = (e) => {
    e.preventDefault();
    if (!editingShariaBranch) return;
    setShariaBranches(shariaBranches.map(b => b.id === editingShariaBranch.id ? editingShariaBranch : b));
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
    setLiveLectures(liveLectures.map(l => l.id === editingLive.id ? editingLive : l));
    setEditingLive(null);
  };

  // --- ACTIONS ---
  const handleDelete = (id, listName) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا السجل؟')) {
      if (listName === 'admins') deleteManager(id);
      if (listName === 'externalAdmins') deleteManager(id);
      if (listName === 'shariaBranches') setShariaBranches(shariaBranches.filter(x => x.id !== id));
      if (listName === 'courses') setCourses(courses.filter(x => x.id !== id));
      if (listName === 'preparatory') setCourses(courses.filter(x => x.id !== id));
      if (listName === 'intermediate') setCourses(courses.filter(x => x.id !== id));
      if (listName === 'advanced') setCourses(courses.filter(x => x.id !== id));
      if (listName === 'students') setStudents(students.filter(x => x.id !== id));
      if (listName === 'exams') setExams(exams.filter(x => x.id !== id));
      if (listName === 'results') setResults(results.filter(x => x.id !== id));
      if (listName === 'news') setNews(news.filter(x => x.id !== id));
      if (listName === 'live') setLiveLectures(liveLectures.filter(x => x.id !== id));
      if (listName === 'teachers') setTeachers(teachers.filter(x => x.id !== id));
    }
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
    return teachers.filter(t => 
      (selectedGov === 'الكل' || t.governorate === selectedGov) &&
      (selectedBranch === 'الكل' || t.branch === selectedBranch) &&
      (t.name.includes(searchTerm) || t.department.includes(searchTerm) || t.university.includes(searchTerm))
    );
  };

  const getFilteredLiveLectures = () => {
    let filtered = liveLectures;
    if (isShariaStudent && loggedInStudent) {
      filtered = filtered.filter(l => {
        const matchGov = l.governorate === loggedInStudent.governorate;
        const lectureStage = l.stage || '';
        const hasStage = lectureStage.includes(loggedInStudent.stage);
        const hasLevel = lectureStage.includes(loggedInStudent.level) || 
                         (loggedInStudent.level === 'المستوى الأول' && (lectureStage.includes('الأول') || lectureStage.includes('اول'))) ||
                         (loggedInStudent.level === 'المستوى الثاني' && (lectureStage.includes('الثاني') || lectureStage.includes('ثاني'))) ||
                         (loggedInStudent.level === 'المستوى الثالث' && (lectureStage.includes('الثالث') || lectureStage.includes('ثالث'))) ||
                         (loggedInStudent.level === 'المستوى الرابع' && (lectureStage.includes('الرابع') || lectureStage.includes('رابع')));
        return matchGov && hasStage && hasLevel;
      });
    } else {
      filtered = filtered.filter(l => 
        (selectedGov === 'الكل' || l.governorate === selectedGov)
      );
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

  const dynamicStats = [
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
    { key: 'exams', name: 'قسم الاختبارات والامتحانات', desc: 'تنظيم وجدولة الامتحانات، وتصميم أوراق الاختبارات الفترية والنهائية.', icon: FileText, color: '#14b8a6' },
    { key: 'results', name: 'قسم النتائج والتقديرات', desc: 'إصدار نتائج المحافظة وعرض درجات الدارسين ونسب النجاح والرسوب.', icon: Award, color: '#06b6d4' },
    { key: 'news', name: 'قسم الأخبار والإعلانات', desc: 'إضافة الإعلانات الهامة وتعميم المواعيد وجداول الفصول الدراسية العامة للرواق.', icon: Newspaper, color: '#84cc16' },
  ];

  const sectionGridItems = isShariaStudent
    ? allSectionGridItems.filter(item => !['admins', 'externalAdmins', 'students', 'teachers'].includes(item.key))
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
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>فصل الصيف 2026</div>
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
                <option value="الكل">الكل (جميع المحافظات والجامع الأزهر)</option>
                {GOVERNORATES.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
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
          onClick={() => { setActiveTab('overview'); setSearchTerm(''); }}
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
            onClick={() => { setActiveTab(item.key); setSearchTerm(''); }}
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
                onClick={() => setActiveTab('live')}
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
                onClick={() => setActiveTab(stat.tab)}
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
            <div style={{ display: 'flex', gap: '10px' }}>
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
                    width: '250px'
                  }}
                />
                <Search size={14} color="var(--text-secondary)" style={{ position: 'absolute', right: '12px', top: '11px' }} />
              </div>
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
                        {teacher.governorate} {teacher.branch && <span style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>({teacher.branch})</span>}
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
                    المرحلة {selectedCourseStage} {selectedCourseStage === 'متقدمة' && `(${[
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
                      { key: 'تمهيدية', label: 'المرحلة التمهيدية' },
                      { key: 'متوسطة', label: 'المرحلة المتوسطة' },
                      { key: 'متقدمة', label: 'المرحلة المتقدمة' }
                    ].map(stage => (
                      <button
                        key={stage.key}
                        onClick={() => {
                          setSelectedCourseStage(stage.key);
                          // Reset level if moving to prep/intermediate from level 3/4
                          if ((stage.key === 'تمهيدية' || stage.key === 'متوسطة') && 
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
                {selectedCourseStage === 'متقدمة' && (
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
                    {(selectedCourseStage === 'متقدمة'
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
                      المرحلة {selectedCourseStage} {selectedCourseStage === 'متقدمة' && `(${[
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
                          discipline: selectedCourseStage === 'متقدمة' ? selectedCourseDiscipline : 'fiqh',
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
                (selectedCourseStage !== 'متقدمة' || c.discipline === selectedCourseDiscipline)
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
            <div style={{ display: 'flex', gap: '10px' }}>
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
                    width: '250px'
                  }}
                />
                <Search size={14} color="var(--text-secondary)" style={{ position: 'absolute', right: '12px', top: '11px' }} />
              </div>
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
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredStudents().length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
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
            {!isShariaStudent && (
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
                        {!isShariaStudent && (
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
                        {live.stage === 'متقدمة' && live.discipline && live.discipline !== '—' && (
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
                      <a 
                        href={live.link} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{
                          backgroundColor: isActive ? '#ef4444' : 'var(--border-subtle)',
                          color: 'white',
                          textDecoration: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {isActive ? <Play size={12} /> : <ExternalLink size={12} />}
                        دخول المحاضرة
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

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
                        level: (stageVal !== 'متقدمة' && (courseForm.level === 'المستوى الثالث' || courseForm.level === 'المستوى الرابع')) 
                          ? 'المستوى الأول' 
                          : courseForm.level,
                        discipline: stageVal === 'متقدمة' ? 'fiqh' : '—'
                      });
                    }} 
                    style={selectStyle}
                  >
                    <option value="تمهيدية">المرحلة التمهيدية</option>
                    <option value="متوسطة">المرحلة المتوسطة</option>
                    <option value="متقدمة">المرحلة المتقدمة</option>
                  </select>
                </div>

                {/* Specialization / Discipline Selection - Only for Advanced Stage */}
                {courseForm.stage === 'متقدمة' && (
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
                    {courseForm.stage === 'متقدمة' && (
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
                    <select value={studentForm.governorate} onChange={(e) => setStudentForm({ ...studentForm, governorate: e.target.value, branch: '' })} style={selectStyle}>
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
                    <input type="text" required value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} style={inputStyle} />
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

                {studentForm.stage === 'متقدمة' ? (
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
                            discipline: val === 'متقدمة' ? 'فقه وأصوله' : '—',
                            level: 'المستوى الأول'
                          });
                        }} 
                        style={selectStyle}
                      >
                        <option value="تمهيدية">تمهيدية</option>
                        <option value="متوسطة">متوسطة</option>
                        <option value="متقدمة">متقدمة</option>
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
                            discipline: val === 'متقدمة' ? 'فقه وأصوله' : '—',
                            level: 'المستوى الأول'
                          });
                        }} 
                        style={selectStyle}
                      >
                        <option value="تمهيدية">تمهيدية</option>
                        <option value="متوسطة">متوسطة</option>
                        <option value="متقدمة">متقدمة</option>
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
                    <select value={editingStudent.governorate} onChange={(e) => setEditingStudent({ ...editingStudent, governorate: e.target.value, branch: '' })} style={selectStyle}>
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
                    <input type="text" required value={editingStudent.phone || ''} onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })} style={inputStyle} />
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

                {editingStudent.stage === 'متقدمة' ? (
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
                            discipline: val === 'متقدمة' ? 'فقه وأصوله' : '—',
                            level: 'المستوى الأول'
                          });
                        }} 
                        style={selectStyle}
                      >
                        <option value="تمهيدية">تمهيدية</option>
                        <option value="متوسطة">متوسطة</option>
                        <option value="متقدمة">متقدمة</option>
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
                            discipline: val === 'متقدمة' ? 'فقه وأصوله' : '—',
                            level: 'المستوى الأول'
                          });
                        }} 
                        style={selectStyle}
                      >
                        <option value="تمهيدية">تمهيدية</option>
                        <option value="متوسطة">متوسطة</option>
                        <option value="متقدمة">متقدمة</option>
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
          (liveForm.stage !== 'متقدمة' || c.discipline === getDisciplineKey(liveForm.discipline))
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
                    >
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
                            discipline: val === 'متقدمة' ? 'فقه وأصوله' : '—',
                            title: ''
                          });
                        }} 
                        style={selectStyle}
                      >
                        <option value="تمهيدية">تمهيدية</option>
                        <option value="متوسطة">متوسطة</option>
                        <option value="متقدمة">متقدمة</option>
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
                        {liveForm.stage === 'متقدمة' && (
                          <>
                            <option value="المستوى الثالث">المستوى الثالث</option>
                            <option value="المستوى الرابع">المستوى الرابع</option>
                          </>
                        )}
                      </select>
                    </div>

                    {liveForm.stage === 'متقدمة' && (
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
                  <select 
                    required 
                    value={liveForm.teacher} 
                    onChange={(e) => setLiveForm({ ...liveForm, teacher: e.target.value })} 
                    style={selectStyle}
                  >
                    {teachers.filter(t => t.governorate === liveForm.governorate).length === 0 ? (
                      <option value="">لا يوجد محاضرين مسجلين في هذه الإدارة حالياً</option>
                    ) : (
                      <>
                        <option value="">اختر الأستاذ المحاضر...</option>
                        {teachers.filter(t => t.governorate === liveForm.governorate).map(t => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </>
                    )}
                  </select>
                  {teachers.filter(t => t.governorate === liveForm.governorate).length === 0 && (
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

                {/* Link */}
                <div>
                  <label style={labelStyle}>رابط المحاضرة (زووم، تيمز، إلخ)</label>
                  <input type="url" required placeholder="https://zoom.us/j/..." value={liveForm.link} onChange={(e) => setLiveForm({ ...liveForm, link: e.target.value })} style={inputStyle} />
                </div>

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
          (editingLive.stage !== 'متقدمة' || c.discipline === getDisciplineKey(editingLive.discipline))
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
                    >
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
                            discipline: val === 'متقدمة' ? 'فقه وأصوله' : '—',
                            title: ''
                          });
                        }} 
                        style={selectStyle}
                      >
                        <option value="تمهيدية">تمهيدية</option>
                        <option value="متوسطة">متوسطة</option>
                        <option value="متقدمة">متقدمة</option>
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
                        {editingLive.stage === 'متقدمة' && (
                          <>
                            <option value="المستوى الثالث">المستوى الثالث</option>
                            <option value="المستوى الرابع">المستوى الرابع</option>
                          </>
                        )}
                      </select>
                    </div>

                    {editingLive.stage === 'متقدمة' && (
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
                    <select 
                      required 
                      value={editingLive.teacher} 
                      onChange={(e) => setEditingLive({ ...editingLive, teacher: e.target.value })} 
                      style={selectStyle}
                    >
                      {teachers.filter(t => t.governorate === editingLive.governorate).length === 0 ? (
                        <option value="">لا يوجد محاضرين مسجلين في هذه الإدارة حالياً</option>
                      ) : (
                        <>
                          <option value="">اختر الأستاذ المحاضر...</option>
                          {teachers.filter(t => t.governorate === editingLive.governorate).map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </>
                      )}
                    </select>
                    {teachers.filter(t => t.governorate === editingLive.governorate).length === 0 && (
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

                  {/* Link */}
                  <div>
                    <label style={labelStyle}>رابط المحاضرة (زووم، تيمز، إلخ)</label>
                    <input type="url" required placeholder="https://zoom.us/j/..." value={editingLive.link} onChange={(e) => setEditingLive({ ...editingLive, link: e.target.value })} style={inputStyle} />
                  </div>

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
                    <select value={teacherForm.governorate} onChange={(e) => setTeacherForm({ ...teacherForm, governorate: e.target.value, branch: '' })} style={selectStyle}>
                      {GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الفرع التعليمي</label>
                    <select required value={teacherForm.branch} onChange={(e) => setTeacherForm({ ...teacherForm, branch: e.target.value })} style={selectStyle}>
                      <option value="">اختر الفرع...</option>
                      {shariaBranches.filter(b => b.governorate === teacherForm.governorate).map(b => (
                        <option key={b.id || b._id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الرقم القومي (14 رقم)</label>
                    <input type="text" required maxLength="14" value={teacherForm.nationalId} onChange={(e) => setTeacherForm({ ...teacherForm, nationalId: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>رقم الهاتف</label>
                    <input type="text" required value={teacherForm.phone} onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })} style={inputStyle} />
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
                    <select value={shariaBranchForm.governorate} onChange={(e) => setShariaBranchForm({ ...shariaBranchForm, governorate: e.target.value })} style={selectStyle}>
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
                    <select value={editingShariaBranch.governorate} onChange={(e) => setEditingShariaBranch({ ...editingShariaBranch, governorate: e.target.value })} style={selectStyle}>
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
                    <select value={editingTeacher.governorate} onChange={(e) => setEditingTeacher({ ...editingTeacher, governorate: e.target.value, branch: '' })} style={selectStyle}>
                      {GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الفرع التعليمي</label>
                    <select required value={editingTeacher.branch || ''} onChange={(e) => setEditingTeacher({ ...editingTeacher, branch: e.target.value })} style={selectStyle}>
                      <option value="">اختر الفرع...</option>
                      {shariaBranches.filter(b => b.governorate === editingTeacher.governorate).map(b => (
                        <option key={b.id || b._id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>الرقم القومي (14 رقم)</label>
                    <input type="text" required maxLength="14" value={editingTeacher.nationalId} onChange={(e) => setEditingTeacher({ ...editingTeacher, nationalId: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>رقم الهاتف</label>
                    <input type="text" required value={editingTeacher.phone || ''} onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })} style={inputStyle} />
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
                        level: (stageVal !== 'متقدمة' && (editingCourse.level === 'المستوى الثالث' || editingCourse.level === 'المستوى الرابع')) 
                          ? 'المستوى الأول' 
                          : editingCourse.level,
                        discipline: stageVal === 'متقدمة' ? 'fiqh' : '—'
                      });
                    }} 
                    style={selectStyle}
                  >
                    <option value="تمهيدية">المرحلة التمهيدية</option>
                    <option value="متوسطة">المرحلة المتوسطة</option>
                    <option value="متقدمة">المرحلة المتقدمة</option>
                  </select>
                </div>

                {/* Specialization / Discipline Selection - Only for Advanced Stage */}
                {editingCourse.stage === 'متقدمة' && (
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
                    {editingCourse.stage === 'متقدمة' && (
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


                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={() => setEditingCourse(null)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold' }}>حفظ التعديلات</button>
                </div>
              </div>
            </form>
          </div>
        </div>
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
