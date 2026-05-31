import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../components/Management.css';
import { useAppData } from '../context/AppDataContext';
import { countriesList } from '../data/countries';

function PlatformStudentsCreate() {
  const { addPlatformStudent, updatePlatformStudent, platformSessions, platformStudents, users, addUser, updateUser } = useAppData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('id');
  const isEditing = !!studentId;

  const [form, setForm] = useState({
    name: '', passport_no: '', birth_date: '', phone: '', email: '',
    qualification: '', job: '', address: '',
    session_id: '', username: '', password: '', country: ''
  });
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const selectCountry = (country) => {
    setForm(prev => ({ ...prev, country }));
    setCountrySearch(country);
    setShowCountryDropdown(false);
  };

  useEffect(() => {
    if (isEditing && studentId) {
      const studentToEdit = platformStudents.find(s => String(s.id) === String(studentId));
      if (studentToEdit) {
        setForm({
          name: studentToEdit.name || '',
          passport_no: studentToEdit.passport_no || studentToEdit.national_id || '',
          birth_date: studentToEdit.birth_date || '',
          phone: studentToEdit.phone || '',
          email: studentToEdit.email || '',
          qualification: studentToEdit.qualification || '',
          job: studentToEdit.job || '',
          address: studentToEdit.address || '',
          session_id: studentToEdit.session_id || '',
          username: studentToEdit.username || '',
          password: studentToEdit.password || '',
          country: studentToEdit.country || ''
        });
        setCountrySearch(studentToEdit.country || '');
      }
    }
  }, [isEditing, studentId, platformStudents]);

  const handleSubmit = () => {
    if (!form.name || !form.passport_no || !form.phone || !form.session_id || !form.country) {
      alert('الرجاء ملء الحقول المطلوبة');
      return;
    }

    const selectedSession = platformSessions.find(s => s.session_no === form.session_id);
    const finalForm = {
      ...form,
      username: form.passport_no,
      password: form.passport_no
    };

    const studentData = {
      ...finalForm,
      rowaq: selectedSession?.rowaq || '',
      level: selectedSession?.level || '',
      gender: selectedSession?.student_type || '',
    };

    const existingUser = users.find(u => u.national_id === form.passport_no || u.email === form.passport_no);

    if (isEditing) {
      updatePlatformStudent(studentId, studentData);
      if (existingUser) {
        updateUser(existingUser.id, {
          name: form.name,
          phone: form.phone,
          email: form.passport_no,
          password: form.passport_no,
          national_id: form.passport_no,
          userSession: form.session_id || ''
        });
      } else {
        addUser({
          name: form.name,
          email: form.passport_no,
          password: form.passport_no,
          phone: form.phone,
          role: 'student',
          national_id: form.passport_no,
          userSession: form.session_id || ''
        });
      }
      alert('تم تحديث الدارس بنجاح');
    } else {
      addPlatformStudent(studentData);
      if (existingUser) {
        updateUser(existingUser.id, {
          name: form.name,
          phone: form.phone,
          role: 'student',
          email: form.passport_no,
          national_id: form.passport_no,
          userSession: form.session_id || ''
        });
      } else {
        addUser({
          name: form.name,
          email: form.passport_no,
          password: form.passport_no,
          phone: form.phone,
          role: 'student',
          national_id: form.passport_no,
          userSession: form.session_id || ''
        });
      }
      alert('تم إضافة الدارس بنجاح');
    }
    navigate('/platform-students');
  };

  return (
    <div className="management-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', width: '100%' }}>{isEditing ? 'تعديل دارس' : 'إضافة دارس جديد'}</h2>
      </div>

      <div className="form-wrapper box-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', padding: '10px', fontSize: '18px' }}>المعلومات الشخصية</h3>

        <div className="form-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="form-group"><label>الاسم الكامل <span className="req">*</span></label><input name="name" type="text" className="form-input" placeholder="أدخل الاسم الكامل" value={form.name} onChange={handleChange} /></div>
          <div className="form-group"><label>رقم جواز السفر <span className="req">*</span></label><input name="passport_no" type="text" className="form-input" placeholder="أدخل رقم جواز السفر" value={form.passport_no} onChange={handleChange} /></div>
          <div className="form-group"><label>تاريخ الميلاد</label><input name="birth_date" type="date" className="form-input" value={form.birth_date} onChange={handleChange} /></div>
          <div className="form-group"><label>رقم الهاتف <span className="req">*</span></label><input name="phone" type="text" className="form-input" placeholder="أدخل رقم الهاتف" value={form.phone} onChange={handleChange} dir="ltr" /></div>
          <div className="form-group"><label>البريد الإلكتروني</label><input name="email" type="email" className="form-input" placeholder="example@email.com" value={form.email} onChange={handleChange} dir="ltr" /></div>
          <div className="form-group"><label>الوظيفة (اختياري)</label><input name="job" type="text" className="form-input" placeholder="أدخل الوظيفة" value={form.job} onChange={handleChange} /></div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>الدولة <span className="req">*</span></label>
            <input
              type="text" className="form-input" placeholder="ابحث عن الدولة..."
              value={countrySearch}
              onChange={e => {
                const val = e.target.value;
                setCountrySearch(val);
                setForm(prev => ({ ...prev, country: val }));
              }}
              onFocus={() => setShowCountryDropdown(true)}
              onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
            />
            {showCountryDropdown && countrySearch && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '6px', maxHeight: '150px', overflowY: 'auto', zIndex: 10, marginTop: '4px' }}>
                {countriesList.filter(c => c.includes(countrySearch)).map(country => (
                  <div
                    key={country}
                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseDown={(e) => { e.preventDefault(); selectCountry(country); }}
                  >
                    {country}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label>العنوان</label>
          <textarea name="address" className="form-input textarea" placeholder="أدخل العنوان التفصيلي" value={form.address} onChange={handleChange}></textarea>
        </div>

        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', padding: '10px', fontSize: '18px' }}>معلومات الحلقة</h3>

        <div className="form-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="form-group">
            <label>الحلقة <span className="req">*</span></label>
            <select name="session_id" className="form-select" value={form.session_id} onChange={handleChange}>
              <option value="">--- اختار الحلقة ---</option>
              {platformSessions.map((s, i) => <option key={i} value={s.session_no}>حلقة {s.session_no}</option>)}
            </select>
          </div>
        </div>

      </div>

      <div className="form-actions" style={{ justifyContent: 'center', marginTop: '30px' }}>
        <button className="btn btn-primary" style={{ padding: '10px 40px' }} onClick={handleSubmit}>حفظ</button>
        <Link to="/platform-students" className="btn btn-outline" style={{ textDecoration: 'none', padding: '10px 40px' }}>إلغاء</Link>
      </div>
    </div>
  );
}

export default PlatformStudentsCreate;
