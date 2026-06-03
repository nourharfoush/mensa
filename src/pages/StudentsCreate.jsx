import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import egyptCenters from '../data/egyptCenters';
import { calculateBirthDateFromNationalId } from '../utils/nationalIdHelper';

const governorates = Object.keys(egyptCenters);

function StudentsCreate() {
  const { addStudent, updateStudent, branches, sessions, students, users, addUser, updateUser } = useAppData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('id');
  const isEditing = !!studentId;
  
  const [form, setForm] = useState({
    name: '', national_id: '', birth_date: '', phone: '', email: '',
    qualification: '', job: '', address: '',
    admin: '', center: '', branch: '', session_id: '', username: '', password: ''
  });

  const availableCenters = form.admin ? (egyptCenters[form.admin] || []) : [];
  const availableBranches = branches.filter(b => {
    const normalize = (val) => (val || '').toString().trim().replace(/ة/g, 'ه').replace(/أ|إ|آ/g, 'ا');
    return normalize(b.admin) === normalize(form.admin) && normalize(b.center) === normalize(form.center);
  });
  const availableSessions = sessions.filter(s => {
    const normalize = (val) => (val || '').toString().trim().replace(/ة/g, 'ه').replace(/أ|إ|آ/g, 'ا');
    return normalize(s.admin) === normalize(form.admin) &&
           normalize(s.center) === normalize(form.center) &&
           normalize(s.branch) === normalize(form.branch);
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAdminChange = e => setForm({ ...form, admin: e.target.value, center: '', branch: '', session_id: '' });
  const handleCenterChange = e => setForm({ ...form, center: e.target.value, branch: '', session_id: '' });
  const handleBranchChange = e => setForm({ ...form, branch: e.target.value, session_id: '' });

  useEffect(() => {
    if (isEditing && studentId) {
      const studentToEdit = students.find(s => String(s.id) === String(studentId));
      if (studentToEdit) {
        setForm({
          name: studentToEdit.name || '',
          national_id: studentToEdit.national_id || '',
          birth_date: studentToEdit.birth_date || '',
          phone: studentToEdit.phone || '',
          email: studentToEdit.email || '',
          qualification: studentToEdit.qualification || '',
          job: studentToEdit.job || '',
          address: studentToEdit.address || '',
          admin: studentToEdit.admin || '',
          center: studentToEdit.center || '',
          branch: studentToEdit.branch || '',
          session_id: studentToEdit.session_id || '',
          username: studentToEdit.username || '',
          password: studentToEdit.password || ''
        });
      }
    }
  }, [isEditing, studentId, students]);

  const handleSubmit = () => {
    if (!form.name || !form.national_id || !form.phone || !form.admin || !form.session_id) {
      alert('الرجاء ملء الحقول المطلوبة');
      return;
    }
    
    const computedBirthDate = calculateBirthDateFromNationalId(form.national_id);
    if (!computedBirthDate) {
      alert('الرقم القومي غير صحيح. يرجى إدخال رقم قومي مكون من 14 رقماً صحيحاً.');
      return;
    }

    const selectedSession = sessions.find(s => s.session_no === form.session_id);
    const finalForm = {
      ...form,
      birth_date: computedBirthDate,
      username: form.national_id,
      password: form.national_id // Student has no record number, use national_id
    };

    const studentData = {
      ...finalForm,
      rowaq: selectedSession?.rowaq || '',
      level: selectedSession?.level || '',
      gender: selectedSession?.student_type || '',
    };

    const existingUser = users.find(u => u.national_id === form.national_id || u.email === form.national_id);

    if (isEditing) {
      updateStudent(studentId, studentData);
      if (existingUser) {
        updateUser(existingUser.id, {
          name: form.name,
          phone: form.phone,
          email: form.national_id,
          password: form.national_id,
          national_id: form.national_id,
          userAdmin: form.admin || '',
          userCenter: form.center || '',
          userBranch: form.branch || '',
          userSession: form.session_id || ''
        });
      } else {
        addUser({
          name: form.name,
          email: form.national_id,
          password: form.national_id,
          phone: form.phone,
          role: 'student',
          national_id: form.national_id,
          userAdmin: form.admin || '',
          userCenter: form.center || '',
          userBranch: form.branch || '',
          userSession: form.session_id || ''
        });
      }
      alert('تم تحديث الطالب بنجاح');
    } else {
      addStudent(studentData);
      if (existingUser) {
        updateUser(existingUser.id, {
          name: form.name,
          phone: form.phone,
          role: 'student',
          email: form.national_id,
          national_id: form.national_id,
          userAdmin: form.admin || '',
          userCenter: form.center || '',
          userBranch: form.branch || '',
          userSession: form.session_id || ''
        });
      } else {
        addUser({
          name: form.name,
          email: form.national_id,
          password: form.national_id,
          phone: form.phone,
          role: 'student',
          national_id: form.national_id,
          userAdmin: form.admin || '',
          userCenter: form.center || '',
          userBranch: form.branch || '',
          userSession: form.session_id || ''
        });
      }
      alert('تم إضافة الطالب بنجاح');
    }
    navigate('/students');
  };

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', width: '100%' }}>{isEditing ? 'تعديل الطالب' : 'إضافة طالب جديد'}</h2>
      </div>

      <div className="form-wrapper box-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', fontSize: '18px' }}>المعلومات الشخصية</h3>
        
        <div className="form-grid" style={{ marginBottom: '30px' }}>
          <div className="form-group">
            <label>الاسم الكامل <span className="req">*</span></label>
            <input name="name" type="text" className="form-input" placeholder="أدخل الاسم الكامل" value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>الرقم القومي <span className="req">*</span></label>
            <input name="national_id" type="text" className="form-input" placeholder="أدخل الرقم القومي" value={form.national_id} onChange={handleChange} />
          </div>


          <div className="form-group">
            <label>رقم الهاتف <span className="req">*</span></label>
            <div style={{ display: 'flex' }}>
               <span style={{ padding: '0 10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderLeft: 'none', borderRadius: '0 6px 6px 0', display: 'flex', alignItems: 'center', direction: 'ltr' }}>+20 <img src="https://flagcdn.com/w20/eg.png" alt="Egypt" style={{ marginLeft: '5px' }}/></span>
               <input name="phone" type="text" className="form-input" placeholder="أدخل رقم الهاتف" value={form.phone} onChange={handleChange} style={{ borderRadius: '6px 0 0 6px', flex: 1 }} dir="ltr" />
            </div>
          </div>

          <div className="form-group">
            <label>البريد الإلكتروني <span className="req">*</span></label>
            <input name="email" type="email" className="form-input" placeholder="example@email.com" value={form.email} onChange={handleChange} dir="ltr" />
          </div>
        </div>

          <div className="form-group">
            <label>الوظيفة (اختياري)</label>
            <input name="job" type="text" className="form-input" placeholder="أدخل الوظيفة" value={form.job} onChange={handleChange} />
          </div>

        <div className="form-group" style={{ marginBottom: '30px' }}>
           <label>العنوان <span className="req">*</span></label>
           <textarea name="address" className="form-input textarea" placeholder="أدخل العنوان التفصيلي" value={form.address} onChange={handleChange}></textarea>
        </div>

        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', fontSize: '18px' }}>معلومات الحلقة</h3>

        <div className="form-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
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
            <select name="branch" className="form-select" value={form.branch} onChange={handleBranchChange} disabled={!form.center}>
              <option value="">{form.center ? 'اختار الفرع' : 'اختار المركز أولاً'}</option>
              {availableBranches.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>الحلقة <span className="req">*</span></label>
            <select name="session_id" className="form-select" value={form.session_id} onChange={handleChange} disabled={!form.branch}>
              <option value="">{form.branch ? 'اختار الحلقة' : 'اختار الفرع أولاً'}</option>
              {availableSessions.map((s, i) => <option key={i} value={s.session_no}>حلقة {s.session_no}</option>)}
            </select>
          </div>
        </div>

      </div>

      <div className="form-actions" style={{ justifyContent: 'center', marginTop: '30px' }}>
        <button className="btn btn-primary" style={{ padding: '10px 40px' }} onClick={handleSubmit}>حفظ</button>
        <Link to="/students" className="btn btn-outline" style={{ textDecoration: 'none', padding: '10px 40px' }}>إلغاء</Link>
      </div>
    </div>
  );
}

export default StudentsCreate;
