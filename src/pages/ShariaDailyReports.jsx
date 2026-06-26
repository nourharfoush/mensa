import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  FileText, Plus, Search, Trash2, Download, Printer,
  ChevronRight, Calendar, User, BookOpen, Layers, Award,
  CheckCircle, HelpCircle, XCircle
} from 'lucide-react';
import { exportToXLSX } from '../utils/xlsxHelper';

const GOVERNORATES = [
  'الجامع الأزهر', 'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية',
  'البحر الأحمر', 'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية',
  'المنوفية', 'المنيا', 'القليوبية', 'الوادي الجديد', 'الشرقية',
  'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط',
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا', 'شمال سيناء', 'سوهاج'
];

const STAGES = ['التمهيدية', 'المتوسطة', 'المتقدمة'];

const LEVELS_BY_STAGE = {
  'التمهيدية': ['المستوى الأول', 'المستوى الثاني'],
  'المتوسطة': ['المستوى الأول', 'المستوى الثاني'],
  'المتقدمة': ['المستوى الأول', 'المستوى الثاني', 'المستوى الثالث', 'المستوى الرابع']
};

const getDisciplineKey = (arabicVal) => {
  if (!arabicVal) return '—';
  const clean = String(arabicVal).trim();
  if (clean === 'فقه وأصوله' || clean === 'الفقه وأصوله' || clean === 'fiqh') return 'fiqh';
  if (clean === 'تفسير وحديث' || clean === 'التفسير والحديث' || clean === 'tafsir') return 'tafsir';
  if (clean === 'عقيدة' || clean === 'العقيدة الإسلامية' || clean === 'aqeedah') return 'aqeedah';
  if (clean === 'لغة عربية' || clean === 'اللغة العربية وآدابها' || clean === 'arabic') return 'arabic';
  if (clean === 'عامة' || clean === ' عامة  ' || clean === 'general') return 'general';
  return clean;
};

const getDisciplineLabel = (key) => {
  if (key === 'fiqh') return 'الفقه وأصوله';
  if (key === 'tafsir') return 'التفسير والحديث';
  if (key === 'aqeedah') return 'العقيدة الإسلامية';
  if (key === 'arabic') return 'اللغة العربية وآدابها';
  if (key === 'general') return 'محاضرات عامة / مشتركة';
  return key || '—';
};

function ShariaDailyReports() {
  const {
    shariaCourses = [],
    shariaTeachers = [],
    shariaDailyReports = [],
    shariaSchedules = [],
    addShariaDailyReport,
    deleteShariaDailyReport
  } = useAppData();

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const userRole = currentUser ? currentUser.role : '';
  const userSpecialty = currentUser ? currentUser.specialty : '';
  const userAdminGov = currentUser ? (currentUser.userAdmin || currentUser.governorate) : '';

  const isSuperAdmin = userRole === 'admin' || userRole === 'rowaq_admin';

  const allowedSpecialties = [
    'مدير الإدارة',
    'العضو التقني',
    'العضو الإداري علوم شرعية وعربية',
    'العضو العلمي علوم شرعية وعربية',
    'العضو الإداري، علوم شرعية وعربية',
    'العضو العلمي، علوم شرعية وعربية',
    'العضو الإداري للعلوم الشرعية والعربية',
    'العضو العلمي للعلوم الشرعية والعربية'
  ];

  const isShariaStaff = allowedSpecialties.includes(userSpecialty);
  const isAuthorized = isSuperAdmin || isShariaStaff;

  // Governorate lock
  const [selectedGov, setSelectedGov] = useState(() => {
    if (!isSuperAdmin && userAdminGov) return userAdminGov;
    return 'الدقهلية'; // default
  });

  const [stage, setStage] = useState('التمهيدية');
  const [discipline, setDiscipline] = useState('—');
  const [level, setLevel] = useState('المستوى الأول');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [teacher, setTeacher] = useState('');
  const [lectureNumber, setLectureNumber] = useState(1);
  const [lectureTitle, setLectureTitle] = useState('');

  // 3 Questions
  const [question1, setQuestion1] = useState('');
  const [question2, setQuestion2] = useState('');
  const [question2Answer, setQuestion2Answer] = useState('صح');

  const [question3, setQuestion3] = useState('');
  const [q3OptA, setQ3OptA] = useState('');
  const [q3OptB, setQ3OptB] = useState('');
  const [q3OptC, setQ3OptC] = useState('');
  const [q3OptD, setQ3OptD] = useState('');
  const [question3Answer, setQuestion3Answer] = useState('أ');

  // Search / Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGov, setFilterGov] = useState(() => {
    if (!isSuperAdmin && userAdminGov) return userAdminGov;
    return 'الكل';
  });
  const [filterStage, setFilterStage] = useState('الكل');

  // Modal / Preview state
  const [selectedReport, setSelectedReport] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Dynamic filter lists
  const levels = LEVELS_BY_STAGE[stage] || [];

  // Subjects (Courses) filtered by stage and level
  const filteredCourses = shariaCourses.filter(c =>
    c.stage === stage &&
    c.level === level &&
    (stage !== 'المتقدمة' || !c.discipline || c.discipline === '—' || getDisciplineKey(c.discipline) === getDisciplineKey(discipline))
  );

  // Get lecturers housed for the selected subject
  const [availableLecturers, setAvailableLecturers] = useState([]);

  useEffect(() => {
    if (levels.length > 0 && !levels.includes(level)) {
      setLevel(levels[0]);
    }
  }, [stage]);

  useEffect(() => {
    if (filteredCourses.length > 0) {
      // Auto select first subject if not in list
      const matched = filteredCourses.find(c => c.name === subject);
      if (!matched) {
        setSubject(filteredCourses[0].name);
      }
    } else {
      setSubject('');
    }
  }, [stage, level, discipline, shariaCourses]);

  // Load teachers assigned to course or governorate
  useEffect(() => {
    // 1. Find teachers directly assigned to the selected course
    const courseObj = shariaCourses.find(c => c.name === subject && c.stage === stage && c.level === level);
    const primaryTeacher = courseObj ? courseObj.teacher : '';

    // 2. Find teachers in schedules for this level/subject
    const scheduleTeachers = shariaSchedules
      .filter(s => s.stage === stage && s.level === level && (selectedGov === 'الكل' || s.governorate === selectedGov))
      .map(s => s.teacher)
      .filter(Boolean);

    // 3. Find teachers registered in this governorate
    const govTeachers = shariaTeachers
      .filter(t => t.governorate === selectedGov || t.governorate === 'جميع المحافظات')
      .map(t => t.name);

    // Combine and deduplicate
    const combined = Array.from(new Set([
      primaryTeacher,
      ...scheduleTeachers,
      ...govTeachers
    ])).filter(Boolean);

    setAvailableLecturers(combined);

    // Auto select first lecturer
    if (combined.length > 0) {
      if (!combined.includes(teacher)) {
        setTeacher(combined[0]);
      }
    } else {
      setTeacher('');
    }
  }, [subject, selectedGov, stage, level, discipline, shariaCourses, shariaTeachers, shariaSchedules]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject) {
      alert('الرجاء إدخال أو اختيار المادة الدراسية');
      return;
    }
    if (!teacher) {
      alert('الرجاء إدخال أو اختيار اسم المحاضر');
      return;
    }

    const reportData = {
      governorate: selectedGov,
      stage,
      level,
      discipline: stage === 'المتقدمة' ? getDisciplineLabel(discipline) : '—',
      subject,
      date,
      teacher,
      lectureNumber: Number(lectureNumber),
      lectureTitle,
      question1,
      question2,
      question2Answer,
      question3,
      question3Options: [q3OptA, q3OptB, q3OptC, q3OptD].filter(Boolean),
      question3Answer: question3Answer === 'أ' ? q3OptA : question3Answer === 'ب' ? q3OptB : question3Answer === 'ج' ? q3OptC : q3OptD,
      reporter: currentUser ? currentUser.name : 'مستخدم غير معروف',
      reporterRole: userSpecialty || 'عضو إداري/علمي'
    };

    addShariaDailyReport(reportData);
    alert('تم حفظ التقرير بنجاح');

    // Reset questions form fields
    setLectureTitle('');
    setQuestion1('');
    setQuestion2('');
    setQuestion3('');
    setQ3OptA('');
    setQ3OptB('');
    setQ3OptC('');
    setQ3OptD('');

    setShowAddForm(false);
  };

  const handleExcelExport = () => {
    const list = getFilteredReports().map(r => ({
      'المحافظة': r.governorate,
      'المرحلة': r.stage,
      'المستوى': r.level,
      'المادة / المقرر': r.subject,
      'التاريخ': r.date,
      'المحاضر': r.teacher,
      'رقم المحاضرة': r.lectureNumber,
      'عنوان المحاضرة': r.lectureTitle || '',
      'السؤال المقالي': r.question1,
      'سؤال صح وخطأ': r.question2,
      'إجابة صح وخطأ': r.question2Answer,
      'سؤال الاختيار من متعدد': r.question3,
      'الخيار الأول (أ)': r.question3Options && r.question3Options[0] ? r.question3Options[0] : '',
      'الخيار الثاني (ب)': r.question3Options && r.question3Options[1] ? r.question3Options[1] : '',
      'الخيار الثالث (ج)': r.question3Options && r.question3Options[2] ? r.question3Options[2] : '',
      'الخيار الرابع (د)': r.question3Options && r.question3Options[3] ? r.question3Options[3] : '',
      'الإجابة الصحيحة للاختيار': r.question3Answer,
      'معد التقرير': r.reporter,
      'الصفة': r.reporterRole
    }));

    exportToXLSX(list, `تقارير_المحاضرات_اليومية_${selectedGov}`, 'التقارير اليومية');
  };

  // Pre-configured Excel template for users to download and fill out
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'المحافظة': selectedGov,
        'المرحلة': 'التمهيدية',
        'المستوى': 'المستوى الأول',
        'المادة / المقرر': subject || 'اسم المقرر',
        'التاريخ': new Date().toISOString().split('T')[0],
        'المحاضر': teacher || 'اسم المحاضر',
        'رقم المحاضرة': 1,
        'عنوان المحاضرة': 'اسم المحاضرة',
        'السؤال المقالي': 'اكتب سؤالك المقالي هنا...',
        'سؤال صح وخطأ': 'اكتب سؤال صح وخطأ هنا...',
        'إجابة صح وخطأ': 'صح',
        'سؤال الاختيار من متعدد': 'اكتب سؤال الاختيار من متعدد هنا...',
        'الخيار الأول (أ)': 'الخيار الأول',
        'الخيار الثاني (ب)': 'الخيار الثاني',
        'الخيار الثالث (ج)': 'الخيار الثالث',
        'الخيار الرابع (د)': 'الخيار الرابع',
        'الإجابة الصحيحة للاختيار': 'الخيار الأول'
      }
    ];
    exportToXLSX(templateData, 'نموذج_تعبئة_التقرير_اليومي', 'نموذج التقرير');
  };

  const getFilteredReports = () => {
    return shariaDailyReports.filter(r => {
      const matchGov = filterGov === 'الكل' || r.governorate === filterGov || r.governorate === 'جميع المحافظات';
      const matchStage = filterStage === 'الكل' || r.stage === filterStage;
      const matchSearch =
        r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reporter.toLowerCase().includes(searchQuery.toLowerCase());

      return matchGov && matchStage && matchSearch;
    });
  };

  const handlePrint = (report) => {
    const printWindow = window.open('', '_blank');
    const optionsHtml = report.question3Options && report.question3Options.length > 0
      ? report.question3Options.map((opt, i) => `<li>[ ${['أ', 'ب', 'ج', 'د'][i]} ] ${opt}</li>`).join('')
      : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>تقرير المحاضرة اليومي - ${report.subject}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Cairo', sans-serif;
              direction: rtl;
              padding: 40px;
              color: #333;
              background-color: #fff;
            }
            .header {
              text-align: center;
              border-bottom: 3px double #d4af37;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #1b5e20;
            }
            .header h2 {
              margin: 5px 0 0 0;
              font-size: 18px;
              color: #d4af37;
              font-weight: 500;
            }
            .meta-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .meta-table td {
              border: 1px solid #ddd;
              padding: 10px 15px;
              font-size: 14px;
            }
            .meta-table td.label {
              background-color: #f9f9f9;
              font-weight: bold;
              width: 15%;
              color: #555;
            }
            .meta-table td.value {
              width: 35%;
            }
            .section {
              margin-bottom: 30px;
              background-color: #fafafa;
              border: 1px solid #eaeaea;
              border-radius: 8px;
              padding: 20px;
            }
            .section h3 {
              margin-top: 0;
              font-size: 16px;
              color: #1b5e20;
              border-bottom: 1px solid #eaeaea;
              padding-bottom: 10px;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .question-body {
              font-size: 15px;
              line-height: 1.6;
              margin-bottom: 10px;
              font-weight: bold;
            }
            .answer-box {
              background-color: #e8f5e9;
              border-right: 4px solid #2e7d32;
              padding: 10px 15px;
              font-size: 14px;
              color: #2e7d32;
              border-radius: 0 4px 4px 0;
              margin-top: 10px;
            }
            .options-list {
              list-style-type: none;
              padding: 0;
              margin: 10px 0;
            }
            .options-list li {
              padding: 6px 12px;
              border: 1px solid #eee;
              margin-bottom: 6px;
              background-color: #fff;
              border-radius: 4px;
              font-size: 14px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #888;
              border-top: 1px solid #eaeaea;
              padding-top: 15px;
            }
            @media print {
              body {
                padding: 20px;
              }
              .section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <h1>الأروقة العلمية للعلوم الشرعية والعربية بمحافظة ${report.governorate}</h1>
            <h2>تقرير المحاضرة اليومي بنموذج الأسئلة للمحاضر</h2>
          </div>

          <table class="meta-table">
            <tr>
              <td class="label">المحافظة:</td>
              <td class="value">${report.governorate}</td>
              <td class="label">التاريخ:</td>
              <td class="value">${report.date}</td>
            </tr>
            <tr>
              <td class="label">المرحلة الدراسية:</td>
              <td class="value">${report.stage} ${report.discipline && report.discipline !== '—' ? '(' + report.discipline + ')' : ''}</td>
              <td class="label">المستوى الدراسي:</td>
              <td class="value">${report.level}</td>
            </tr>
            <tr>
              <td class="label">المادة / المقرر:</td>
              <td class="value">${report.subject}</td>
              <td class="label">المحاضر:</td>
              <td class="value">${report.teacher}</td>
            </tr>
            <tr>
              <td class="label">رقم المحاضرة:</td>
              <td class="value">${report.lectureNumber} ${report.lectureTitle ? ' - ' + report.lectureTitle : ''}</td>
              <td class="label">معد التقرير:</td>
              <td class="value">${report.reporter} (${report.reporterRole})</td>
            </tr>
          </table>

          <div class="section">
            <h3>السؤال الأول: مقالي (Essay Question)</h3>
            <div class="question-body">${report.question1}</div>
          </div>

          <div class="section">
            <h3>السؤال الثاني: صح وخطأ (True/False Question)</h3>
            <div class="question-body">${report.question2}</div>
            <div class="answer-box">
              <strong>الإجابة الصحيحة:</strong> ${report.question2Answer}
            </div>
          </div>

          <div class="section">
            <h3>السؤال الثالث: اختيار من متعدد (Multiple Choice Question)</h3>
            <div class="question-body">${report.question3}</div>
            <ul class="options-list">
              ${optionsHtml}
            </ul>
            <div class="answer-box">
              <strong>الإجابة الصحيحة:</strong> ${report.question3Answer}
            </div>
          </div>

          <div class="footer">
            تم استخراج هذا التقرير تلقائياً من منصة الرواق الأزهري الإلكترونية بتاريخ ${new Date().toLocaleDateString('ar-EG')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', direction: 'rtl' }}>
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
        }}>
          <h3 style={{ color: '#ef4444', fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
            عذراً، ليس لديك صلاحية لدخول هذا القسم
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            هذا القسم متاح فقط للأعضاء الإداريين والعلميين المعينين بقسم العلوم الشرعية والعربية بالمحافظات، أو إدارة النظام العليا بالجامع الأزهر.
          </p>
        </div>
      </div>
    );
  }

  const reportsList = getFilteredReports();

  return (
    <div style={{ direction: 'rtl', padding: '10px 0' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={24} color="var(--accent-gold)" />
            تقارير المحاضرات اليومية للعلوم الشرعية
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            إنشاء واستعراض تقارير اليومية وتوثيق أسئلة المحاضرات لدارسي العلوم الشرعية بالمحافظات
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleDownloadTemplate}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 'bold' }}
          >
            <Download size={16} />
            تنزيل نموذج فارغ
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 'bold' }}
          >
            <Plus size={18} />
            {showAddForm ? 'إخفاء نموذج الإضافة' : 'إضافة تقرير يومي'}
          </button>
        </div>
      </div>

      {/* Submission Form Section */}
      {showAddForm && (
        <form onSubmit={handleSubmit} style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            تسجيل تقرير محاضرة جديد ونموذج الأسئلة
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>

            {/* Governorate field (disabled for governorate officials) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>المحافظة / المقر</label>
              <select
                value={selectedGov}
                onChange={(e) => setSelectedGov(e.target.value)}
                disabled={!isSuperAdmin}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: isSuperAdmin ? 'pointer' : 'not-allowed',
                  opacity: isSuperAdmin ? 1 : 0.8
                }}
              >
                <option value="جميع المحافظات">جميع المحافظات</option>
                {GOVERNORATES.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>

            {/* Stage */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>المرحلة الدراسية</label>
              <select
                value={stage}
                onChange={(e) => {
                  const newStage = e.target.value;
                  setStage(newStage);
                  if (newStage !== 'المتقدمة') {
                    setDiscipline('—');
                  } else {
                    setDiscipline('fiqh');
                  }
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {STAGES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Discipline (Specialty) - Only for Advanced Stage */}
            {stage === 'المتقدمة' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>التخصص التخصصي</label>
                <select
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="fiqh">الفقه وأصوله</option>
                  <option value="tafsir">التفسير والحديث</option>
                  <option value="aqeedah">العقيدة الإسلامية</option>
                  <option value="arabic">اللغة العربية وآدابها</option>
                  <option value="general">محاضرات عامة / مشتركة</option>
                </select>
              </div>
            )}

            {/* Level */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>المستوى الدراسي</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {levels.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* Subject (Course) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>المادة / المقرر التخصصي</label>
              {filteredCourses.length > 0 ? (
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {filteredCourses.map(c => (
                    <option key={c.id || c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="اكتب اسم المادة..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              )}
            </div>

            {/* Lecturer (Teacher) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>المحاضر</label>
              {availableLecturers.length > 0 ? (
                <select
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {availableLecturers.map(tName => (
                    <option key={tName} value={tName}>{tName}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="اكتب اسم المحاضر..."
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              )}
            </div>

            {/* Date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>التاريخ</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Lecture Number */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>رقم المحاضرة</label>
              <input
                type="number"
                required
                min="1"
                value={lectureNumber}
                onChange={(e) => setLectureNumber(e.target.value)}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Lecture Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>عنوان المحاضرة</label>
              <input
                type="text"
                required
                placeholder="مثال: مدخل إلى الفقه المالكي"
                value={lectureTitle}
                onChange={(e) => setLectureTitle(e.target.value)}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Form Questions Block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>

            {/* Question 1: Essay */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '16px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={16} color="var(--accent-gold)" />
                السؤال الأول: مقالي (Essay Question)
              </h4>
              <textarea
                required
                placeholder="اكتب نص السؤال المقالي الموجه من المحاضر للدارسين..."
                value={question1}
                onChange={(e) => setQuestion1(e.target.value)}
                rows="2"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Question 2: True/False */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '16px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={16} color="var(--accent-gold)" />
                السؤال الثاني: صح وخطأ (True/False Question)
              </h4>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', width: '100%' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <input
                    type="text"
                    required
                    placeholder="اكتب نص سؤال الصح والخطأ..."
                    value={question2}
                    onChange={(e) => setQuestion2(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ width: '150px' }}>
                  <select
                    value={question2Answer}
                    onChange={(e) => setQuestion2Answer(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="صح">صح</option>
                    <option value="خطأ">خطأ</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Question 3: Multiple Choice */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '16px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={16} color="var(--accent-gold)" />
                السؤال الثالث: اختيار من متعدد (Multiple Choice Question)
              </h4>
              <input
                type="text"
                required
                placeholder="اكتب نص سؤال الاختيار من متعدد..."
                value={question3}
                onChange={(e) => setQuestion3(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  marginBottom: '14px'
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>أ:</span>
                  <input
                    type="text"
                    required
                    placeholder="الخيار الأول"
                    value={q3OptA}
                    onChange={(e) => setQ3OptA(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>ب:</span>
                  <input
                    type="text"
                    required
                    placeholder="الخيار الثاني"
                    value={q3OptB}
                    onChange={(e) => setQ3OptB(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>ج:</span>
                  <input
                    type="text"
                    required
                    placeholder="الخيار الثالث"
                    value={q3OptC}
                    onChange={(e) => setQ3OptC(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>د:</span>
                  <input
                    type="text"
                    required
                    placeholder="الخيار الرابع"
                    value={q3OptD}
                    onChange={(e) => setQ3OptD(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>الإجابة الصحيحة للاختيار من متعدد:</label>
                <select
                  value={question3Answer}
                  onChange={(e) => setQuestion3Answer(e.target.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="أ">الخيار أ ({q3OptA || 'فارغ'})</option>
                  <option value="ب">الخيار ب ({q3OptB || 'فارغ'})</option>
                  <option value="ج">الخيار ج ({q3OptC || 'فارغ'})</option>
                  <option value="د">الخيار د ({q3OptD || 'فارغ'})</option>
                </select>
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowAddForm(false)}
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 'bold' }}
            >
              حفظ التقرير والأسئلة
            </button>
          </div>

        </form>
      )}

      {/* Filter and Search Panel */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
      }}>
        <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '14px' }}>فلاتر البحث والمشاهدة</h4>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Search box */}
          <div style={{ position: 'relative', flex: '2', minWidth: '250px' }}>
            <input
              type="text"
              placeholder="البحث باسم المقرر، المحاضر، أو معد التقرير..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 40px 10px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', right: '14px', top: '12px' }} />
          </div>

          {/* Governorate Filter */}
          <div style={{ flex: '1', minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>الموقع:</span>
            <select
              value={filterGov}
              onChange={(e) => setFilterGov(e.target.value)}
              disabled={!isSuperAdmin}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                cursor: isSuperAdmin ? 'pointer' : 'not-allowed',
                opacity: isSuperAdmin ? 1 : 0.8
              }}
            >
              {isSuperAdmin && <option value="الكل">الكل (جميع المحافظات)</option>}
              <option value="جميع المحافظات">جميع المحافظات</option>
              {isSuperAdmin ? (
                GOVERNORATES.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))
              ) : (
                <option value={userAdminGov}>{userAdminGov}</option>
              )}
            </select>
          </div>

          {/* Stage Filter */}
          <div style={{ flex: '1', minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>المرحلة:</span>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="الكل">الكل (جميع المراحل)</option>
              {STAGES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Export button */}
          <button
            onClick={handleExcelExport}
            className="btn btn-outline"
            style={{
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            <Download size={16} />
            تصدير إكسيل
          </button>
        </div>
      </div>

      {/* Reports Table / Grid */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        {reportsList.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <FileText size={48} style={{ opacity: 0.25, marginBottom: '14px' }} />
            <p style={{ fontSize: '15px' }}>لا توجد تقارير محاضرات مسجلة حالياً تطابق خيارات البحث.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(214, 175, 55, 0.08)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>التاريخ</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>المحافظة</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>المادة</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>المستوى</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>المحاضر</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>المحاضرة #</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>بواسطة</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold', textAlign: 'center' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {reportsList.map((report) => (
                  <tr
                    key={report.id || report._id}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.2s', cursor: 'pointer' }}
                    onClick={() => setSelectedReport(report)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{report.date}</td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-primary)' }}>{report.governorate}</td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{report.subject}</td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{report.stage} - {report.level}</td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-primary)' }}>{report.teacher}</td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-primary)', textAlign: 'center' }}>
                      {report.lectureNumber} {report.lectureTitle ? ` - ${report.lectureTitle}` : ''}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <div>{report.reporter}</div>
                      <div style={{ fontSize: '10px', opacity: 0.7 }}>{report.reporterRole}</div>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handlePrint(report)}
                          title="طباعة التقرير وحفظ PDF"
                          style={{
                            background: 'rgba(214, 175, 55, 0.1)',
                            color: 'var(--accent-gold)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Printer size={15} />
                        </button>

                        <button
                          onClick={() => deleteShariaDailyReport(report.id || report._id)}
                          title="حذف التقرير"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Preview Modal */}
      {selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            width: '95%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedReport(null)}
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <XCircle size={24} />
            </button>

            {/* Modal Content */}
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} />
              تفاصيل تقرير المحاضرة اليومي
            </h3>

            <div style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '13px'
            }}>
              <div>المحافظة: <strong style={{ color: 'var(--text-primary)' }}>{selectedReport.governorate}</strong></div>
              <div>التاريخ: <strong style={{ color: 'var(--text-primary)' }}>{selectedReport.date}</strong></div>
              <div>المرحلة: <strong style={{ color: 'var(--text-primary)' }}>{selectedReport.stage} {selectedReport.discipline && selectedReport.discipline !== '—' ? `(${selectedReport.discipline})` : ''}</strong></div>
              <div>المستوى: <strong style={{ color: 'var(--text-primary)' }}>{selectedReport.level}</strong></div>
              <div style={{ gridColumn: 'span 2' }}>المادة: <strong style={{ color: 'var(--accent-gold)' }}>{selectedReport.subject}</strong></div>
              <div>المحاضر: <strong style={{ color: 'var(--text-primary)' }}>{selectedReport.teacher}</strong></div>
              <div>رقم المحاضرة: <strong style={{ color: 'var(--text-primary)' }}>{selectedReport.lectureNumber} {selectedReport.lectureTitle ? ` - ${selectedReport.lectureTitle}` : ''}</strong></div>
              <div style={{ gridColumn: 'span 2', fontSize: '11px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '4px' }}>
                بواسطة: {selectedReport.reporter} ({selectedReport.reporterRole})
              </div>
            </div>

            {/* Questions preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

              {/* Q1 */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px' }}>السؤال الأول: مقالي</h5>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0, fontWeight: '500', lineHeight: '1.5' }}>{selectedReport.question1}</p>
              </div>

              {/* Q2 */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px' }}>السؤال الثاني: صح وخطأ</h5>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0 0 10px 0', fontWeight: '500', lineHeight: '1.5' }}>{selectedReport.question2}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                  <CheckCircle size={14} />
                  <span>الإجابة الصحيحة: {selectedReport.question2Answer}</span>
                </div>
              </div>

              {/* Q3 */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px' }}>السؤال الثالث: اختيار من متعدد</h5>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0 0 10px 0', fontWeight: '500', lineHeight: '1.5' }}>{selectedReport.question3}</p>

                {selectedReport.question3Options && selectedReport.question3Options.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    {selectedReport.question3Options.map((opt, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '12px',
                          color: opt === selectedReport.question3Answer ? '#10b981' : 'var(--text-secondary)',
                          backgroundColor: opt === selectedReport.question3Answer ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                          fontWeight: opt === selectedReport.question3Answer ? 'bold' : 'normal'
                        }}
                      >
                        {['أ', 'ب', 'ج', 'د'][i]}: {opt}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                  <CheckCircle size={14} />
                  <span>الإجابة الصحيحة: {selectedReport.question3Answer}</span>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <button
                onClick={() => setSelectedReport(null)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                إغلاق
              </button>
              <button
                onClick={() => handlePrint(selectedReport)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: 'bold' }}
              >
                <Printer size={16} />
                طباعة وحفظ PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ShariaDailyReports;
