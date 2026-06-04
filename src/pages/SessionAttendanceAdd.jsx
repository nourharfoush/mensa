import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';

function SessionAttendanceAdd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isPlatform = location.pathname.startsWith('/platform-sessions');
  const { sessions, platformSessions, students, platformStudents, addAttendance } = useAppData();
  
  const sessionId = id;
  const session = isPlatform
    ? platformSessions.find(s => String(s.id) === String(id))
    : sessions.find(s => String(s.id) === String(id));
  
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
  
  // Find students in this session.
  const sessionStudents = isPlatform
    ? platformStudents.filter(s => 
        (s.session_id && String(s.session_id) === String(session?.id)) ||
        (String(s.session_no) === String(session?.session_no))
      )
    : students.filter(s => 
        (s.session_id && String(s.session_id) === String(session?.id)) ||
        (String(s.session_no) === String(session?.session_no) &&
         normalizeArabic(s.branch) === normalizeArabic(session?.branch) &&
         normalizeArabic(s.center) === normalizeArabic(session?.center) &&
         normalizeArabic(s.admin) === normalizeArabic(session?.admin))
      );
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0].replace(/-/g, '/'));
  
  // State to track which students are present. Default to all present (true)
  const [attendanceState, setAttendanceState] = useState({});

  useEffect(() => {
    const initialState = {};
    sessionStudents.forEach(student => {
      initialState[student.id] = true; // Checked by default (Present)
    });
    setAttendanceState(initialState);
  }, [students, platformStudents, session]); // Dependency on students to re-initialize if students load

  const handleToggle = (studentId) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const checkDateValidity = (dateStr) => {
    if (!dateStr) return { valid: false, msg: 'يرجى اختيار التاريخ' };
    const normalizedDateStr = dateStr.replace(/\//g, '-');
    const selectedDate = new Date(normalizedDateStr);
    if (isNaN(selectedDate.getTime())) return { valid: false, msg: 'تاريخ غير صالح' };
    
    // 1. Check if it's a future date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    
    if (selectedDay > today) {
      return { valid: false, msg: 'لا يمكن تسجيل الغياب لتاريخ في المستقبل' };
    }
    
    // 2. Check if more than 24 hours have passed since the end of that day (only today and yesterday are allowed)
    const oneDayMs = 24 * 60 * 60 * 1000;
    const diffMs = today.getTime() - selectedDay.getTime();
    if (diffMs > oneDayMs) {
      return { valid: false, msg: 'عفواً، لقد مضى أكثر من 24 ساعة على هذا اليوم، لا يمكن تسجيل الغياب' };
    }
    
    // 3. Check if it is a working day of the session (only for branch sessions, platform sessions can be on any day)
    if (!isPlatform && session?.workDays && session.workDays.length > 0) {
      const daysMap = {
        0: 'الأحد', 1: 'الاثنين', 2: 'الثلاثاء', 3: 'الأربعاء', 4: 'الخميس', 5: 'الجمعة', 6: 'السبت'
      };
      const selectedDayOfWeek = daysMap[selectedDay.getDay()];
      const cleanSelectedDayOfWeek = normalizeArabic(selectedDayOfWeek);
      const isWorkDay = session.workDays.some(wd => normalizeArabic(wd) === cleanSelectedDayOfWeek);
      if (!isWorkDay) {
        return { valid: false, msg: `هذا اليوم (${selectedDayOfWeek}) ليس من أيام عمل هذه الحلقة: (${session.workDays.join(', ')})` };
      }
    }
    
    return { valid: true };
  };

  const handleSave = () => {
    if (!date) {
      alert('يرجى اختيار التاريخ');
      return;
    }

    const validation = checkDateValidity(date);
    if (!validation.valid) {
      alert(validation.msg);
      return;
    }
    
    let presentCount = 0;
    let absentCount = 0;
    const records = [];
    
    sessionStudents.forEach(student => {
      const isPresent = attendanceState[student.id];
      if (isPresent) presentCount++;
      else absentCount++;
      
      records.push({
        studentId: student.id,
        studentName: student.name,
        isPresent
      });
    });
    
    addAttendance({
      sessionId: String(sessionId),
      isPlatform,
      date,
      presentCount,
      absentCount,
      records
    });
    
    alert('تم حفظ الغياب بنجاح');
    navigate(isPlatform ? `/platform-sessions/${sessionId}/attendance` : `/sessions/${sessionId}/attendance`);
  };

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', width: '100%' }}>ادارة الغياب [حلقة:{session?.session_no || sessionId}]</h2>
      </div>

      <div className="form-wrapper box-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', fontSize: '18px' }}>إضافة الغياب</h3>
        
        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label>التاريخ <span className="req">*</span></label>
          <input 
            type="date" 
            className="form-input" 
            value={date ? date.replace(/\//g, '-') : ''} 
            onChange={(e) => setDate(e.target.value ? e.target.value.replace(/-/g, '/') : '')} 
          />
          {date && !checkDateValidity(date).valid && (
            <span style={{ color: '#ef4444', fontSize: '13px', marginTop: '5px', display: 'block' }}>
              ⚠️ {checkDateValidity(date).msg}
            </span>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>الدارسين <span className="req">*</span></span>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>الدارس</span>
          </label>
          
          <div style={{ marginTop: '10px', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
            {sessionStudents.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                لا يوجد دارسين مسجلين في هذه الحلقة.
              </div>
            ) : (
              sessionStudents.map((student, index) => (
                <div 
                  key={student.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '12px 20px',
                    backgroundColor: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-card)',
                    borderBottom: index < sessionStudents.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{student.name}</span>
                  <input 
                    type="checkbox" 
                    checked={attendanceState[student.id] || false} 
                    onChange={() => handleToggle(student.id)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="form-actions" style={{ justifyContent: 'center', marginTop: '30px' }}>
          <button className="btn btn-primary" style={{ padding: '10px 40px' }} onClick={handleSave}>حفظ الغياب</button>
        </div>
      </div>
    </div>
  );
}

export default SessionAttendanceAdd;
