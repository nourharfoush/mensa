import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import egyptCenters from '../data/egyptCenters';
import TimePicker from '../components/TimePicker';

const governorates = Object.keys(egyptCenters);
const workDaysList = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const levelsForRowaq = {
  'رواق القرآن الكريم (أطفال)': ['الاول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر'],
  'رواق القرآن الكريم (كبار)': ['السنة الواحدة', 'السنتين', 'ثلاث سنوات', 'أربع سنوات من البقرة', 'أربع سنوات من الناس', 'خمس سنوات من البقرة', 'خمس سنوات من الناس']
};

function SessionsCreate() {
  const { addSession, updateSession, branches, mohfezs, sessions } = useAppData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('id');
  const isEditing = !!sessionId;
  
  const [form, setForm] = useState({
    session_no: '', admin: '', center: '', branch: '', rowaq: '', level: '', mohfez: '',
    mohfez_type: '', student_type: '', attendance_type: '', time_start: '', time_end: '',
    workDays: []
  });

  const availableCenters = form.admin ? (egyptCenters[form.admin] || []) : [];
  const availableBranches = branches.filter(b => {
    const normalize = (val) => (val || '').toString().trim().replace(/ة/g, 'ه').replace(/أ|إ|آ/g, 'ا');
    return normalize(b.admin) === normalize(form.admin) && normalize(b.center) === normalize(form.center);
  });
  const availableMohfezs = mohfezs.filter(m => (!form.admin || m.admin === form.admin));

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAdminChange = e => setForm({ ...form, admin: e.target.value, center: '', branch: '' });
  const handleCenterChange = e => setForm({ ...form, center: e.target.value, branch: '' });
  const handleRowaqChange = e => setForm({ ...form, rowaq: e.target.value, level: '' });

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day]
    }));
  };

  useEffect(() => {
    if (isEditing && sessionId) {
      const sessionToEdit = sessions.find(s => String(s.id) === String(sessionId));
      if (sessionToEdit) {
        setForm({
          session_no: sessionToEdit.session_no || '',
          admin: sessionToEdit.admin || '',
          center: sessionToEdit.center || '',
          branch: sessionToEdit.branch || '',
          rowaq: sessionToEdit.rowaq || '',
          level: sessionToEdit.level || '',
          mohfez: sessionToEdit.mohfez || '',
          mohfez_type: sessionToEdit.mohfez_type || '',
          student_type: sessionToEdit.student_type || '',
          attendance_type: sessionToEdit.attendance_type || '',
          time_start: sessionToEdit.time_start || '',
          time_end: sessionToEdit.time_end || '',
          workDays: sessionToEdit.workDays || []
        });
      }
    }
  }, [isEditing, sessionId, sessions]);

  const handleSubmit = () => {
    if (!form.session_no || !form.admin || !form.center || !form.branch || !form.rowaq) {
      alert('الرجاء ملء الحقول المطلوبة');
      return;
    }
    
    if (isEditing) {
      updateSession(sessionId, form);
      alert('تم تحديث الحلقة بنجاح');
    } else {
      addSession(form);
      alert('تم إضافة الحلقة بنجاح');
    }
    navigate('/sessions');
  };

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', width: '100%' }}>{isEditing ? 'تعديل الحلقة' : 'إضافة حلقة جديدة'}</h2>
      </div>

      <div className="form-wrapper box-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', fontSize: '18px' }}>معلومات الحلقة</h3>
        
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>رقم الحلقة <span className="req">*</span></label>
          <input name="session_no" type="text" className="form-input" placeholder="أدخل رقم الحلقة" value={form.session_no} onChange={handleChange} />
        </div>
        
        <div className="form-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="form-group">
            <label>الإدارة <span className="req">*</span></label>
            <select name="admin" className="form-select" value={form.admin} onChange={handleAdminChange}>
              <option value="">اختار إدارة</option>
              {governorates.map((g, i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>المركز <span className="req">*</span></label>
            <select name="center" className="form-select" value={form.center} onChange={handleCenterChange} disabled={!form.admin}>
              <option value="">{form.admin ? 'اختار المركز' : 'اختار إدارة أولاً'}</option>
              {availableCenters.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>الفرع <span className="req">*</span></label>
            <select name="branch" className="form-select" value={form.branch} onChange={handleChange} disabled={!form.center}>
              <option value="">{form.center ? 'اختار الفرع' : 'اختار المركز أولاً'}</option>
              {availableBranches.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>الرواق <span className="req">*</span></label>
            <select name="rowaq" className="form-select" value={form.rowaq} onChange={handleRowaqChange}>
              <option value="">اختار الرواق</option>
              <option value="رواق القرآن الكريم (أطفال)">رواق القرآن الكريم (أطفال)</option>
              <option value="رواق القرآن الكريم (كبار)">رواق القرآن الكريم (كبار)</option>
              <option value="رواق التجويد">رواق التجويد</option>
              <option value="رواق القراءات">رواق القراءات</option>
            </select>
          </div>
          <div className="form-group">
            <label>المستوى <span className="req">*</span></label>
            <select name="level" className="form-select" value={form.level} onChange={handleChange}>
              <option value="">اختار المستوى</option>
              {form.rowaq && levelsForRowaq[form.rowaq] ? (
                levelsForRowaq[form.rowaq].map((level, i) => <option key={i} value={level}>{level}</option>)
              ) : (
                <option value="">اختار الرواق أولاً</option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label>المحفظ <span className="req">*</span></label>
            <select name="mohfez" className="form-select" value={form.mohfez} onChange={handleChange}>
              <option value="">اختار المحفظ</option>
              {availableMohfezs.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', fontSize: '18px' }}>تفاصيل الحلقة</h3>
        
        <div className="form-grid" style={{ marginBottom: '20px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="form-group">
            <label>نوع المحفظ <span className="req">*</span></label>
            <select name="mohfez_type" className="form-select" value={form.mohfez_type} onChange={handleChange}>
              <option value="">اختار النوع</option>
              <option value="أساسي">أساسي</option>
              <option value="منتدب">منتدب</option>
            </select>
          </div>
          <div className="form-group">
            <label>نوع الدارسين <span className="req">*</span></label>
            <select name="student_type" className="form-select" value={form.student_type} onChange={handleChange}>
              <option value="">اختار النوع</option>
              <option value="رجال">رجال</option>
              <option value="نساء">نساء</option>
              <option value="أطفال">أطفال</option>
            </select>
          </div>
          <div className="form-group">
            <label>نوع الحضور <span className="req">*</span></label>
            <select name="attendance_type" className="form-select" value={form.attendance_type} onChange={handleChange}>
              <option value="">اختار النوع</option>
              <option value="مباشر">مباشر</option>
              <option value="عن بعد">عن بعد</option>
            </select>
          </div>
        </div>

        <div className="form-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="form-group">
            <label>وقت البدء <span className="req">*</span></label>
            <TimePicker name="time_start" value={form.time_start} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>وقت الانتهاء <span className="req">*</span></label>
            <TimePicker name="time_end" value={form.time_end} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label>أيام العمل <span className="req">*</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
            {workDaysList.map(day => (
              <label key={day} style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                background: form.workDays.includes(day) ? 'rgba(212,175,55,0.15)' : 'var(--bg-card)',
                border: `1px solid ${form.workDays.includes(day) ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                padding: '6px 12px', borderRadius: '6px', transition: 'all 0.2s'
              }}>
                <input type="checkbox" checked={form.workDays.includes(day)} onChange={() => toggleDay(day)} style={{ display: 'none' }} />
                {day}
              </label>
            ))}
          </div>
        </div>

      </div>

      <div className="form-actions" style={{ justifyContent: 'center', marginTop: '30px' }}>
        <button className="btn btn-primary" style={{ padding: '10px 40px' }} onClick={handleSubmit}>حفظ</button>
        <Link to="/sessions" className="btn btn-outline" style={{ textDecoration: 'none', padding: '10px 40px' }}>إلغاء</Link>
      </div>
    </div>
  );
}

export default SessionsCreate;
